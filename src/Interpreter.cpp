#include "include/Interpreter.hpp"

namespace IBPCI{

Interpreter::Interpreter(ast::AST *tree){
    this->tree = tree;
    call_stack = cstk::CallStack(tree);
}

void Interpreter::interpret(){
    for(auto *a : tree->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
        }
    }
    ast::delete_tree(tree);
    call_stack.test();
}   

void Interpreter::error(std::string message, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->token.line
        << ": " << message << std::endl;
    exit(1);
}

void Interpreter::error(std::string message, rf::Reference *token){
    std::cout << "RUN-TIME error at line " << token->get_token()->line
        << ": " << message << std::endl;
    delete token;
    exit(1);
}

void Interpreter::method_decl(ast::AST *root){
    if(methods.find(root->token.val_str) == methods.end()){
        methods.insert(std::make_pair(root->token.val_str, root));
    }else{
        error("Duplicate method declaration", root);
    }
}

void Interpreter::assign(ast::AST *root){
    std::string var_name = root->children[0]->token.val_str;
    ast::AST *rn = root->children[1]; 
    rf::Reference *in = compute(rn);
        if(root->children[0]->id != ast::ARR_ACC){
        call_stack.push(var_name, in);
    }else{
        unsigned address = compute_key(root->children[0], call_stack.peek(var_name, rn));
        call_stack.push(var_name, address, in);
    }
    delete in;
}

rf::Reference *Interpreter::compute(ast::AST *root){
    if(root == nullptr) return nullptr;
    switch(root->id){
        case ast::NUM: return new rf::Reference(&root->token);
        case ast::STRING: return new rf::Reference(&root->token);
        case ast::ID: return new rf::Reference(call_stack.peek(root->token.val_str, root));
        case ast::UN_MIN: return negative(compute(root->children[0]));
        case ast::ARR: return make_array(root);
        case ast::ARR_ACC: return access_array(root);
        case ast::ARR_DYN: return declare_empty_array(root);
        case ast::BINOP: return binop(compute(root->children[0]), compute(root->children[1]), root->token.id);
    }
    return nullptr;
}

rf::Reference *Interpreter::binop(rf::Reference *l, rf::Reference *r, int op){
    int type = check_types(l, r);
    rf::Reference *out;
    if(type == tk::STRING){
        if(op == tk::PLUS){ 
            out = add(l, r);
        }else{ 
            delete l;
            error("cannot make this type of comparison on strings", r);
        }
    }else if(op == tk::MINUS || op == tk::MULT || op == tk::PLUS){
        switch(op){
            case tk::PLUS: out = add(l, r); break;
            case tk::MINUS: out = new rf::Reference(l->token.val_num - r->token.val_num); break; 
            case tk::MULT: out = new rf::Reference(l->token.val_num * r->token.val_num); break;
        }
    }else{
        out = divide(l, r, op);
    }
    delete l; delete r;
    return out;
}

rf::Reference *Interpreter::add(rf::Reference *l, rf::Reference *r){
    if(l->type == tk::STRING){
        return new rf::Reference(l->token.val_str + r->token.val_str);
    }else{
        return new rf::Reference(l->token.val_num + r->token.val_num);
    }
    return nullptr;
}

rf::Reference *Interpreter::divide(rf::Reference *l, rf::Reference *r, int op){
    if(r->token.val_num == 0){
        delete l; 
        error("Division by 0 is illegal", r);
    }
    switch(op){
        case tk::DIV_WOQ: return new rf::Reference(l->token.val_num / r->token.val_num);
        case tk::DIV_WQ: return new rf::Reference((int)l->token.val_num / (int)r->token.val_num);
        case tk::MOD: return new rf::Reference((int)l->token.val_num % (int)r->token.val_num);
    }
    return nullptr;
}


int Interpreter::check_types(rf::Reference *l, rf::Reference *r){
    std::string error_message;
    if(l->get_type() == r->get_type()) return l->get_type();
    else{
        error_message = ("Incompatible types: " + tk::id_to_str(l->get_type()) + 
            " and " + tk::id_to_str(r->get_type()));
        delete l; error(error_message, r);
    }
    return false;
}


rf::Reference *Interpreter::negative(rf::Reference *val){
    if(val->type != tk::NUM) error(("Cannot make negative value from " + tk::id_to_str(val->token.id)), val);
    rf::Reference *out = new rf::Reference(-(val->token.val_num));
    delete val;
    return out;
}

bool Interpreter::condition(ast::AST *root){
    if(root->id == ast::COND){
        if(root->token.id == tk::AND) 
            return condition(root->children[0]) && condition(root->children[1]);
        else if(root->token.id == tk::OR)
            return condition(root->children[0]) || condition(root->children[1]);
    }else if(root->id == ast::CMP)
        return numerical_comparison(compute(root->children[0]), compute(root->children[1]), root->token.id);
    return false;
}

bool Interpreter::numerical_comparison(rf::Reference *l, rf::Reference *r, int op){
    int type = check_types(l, r);
    bool out;
    if(type == tk::STRING){
        if(op == tk::IS) return equal(l, r);
        else{ 
            delete l;
            error("cannot make this type of comparison on strings", r);
        }
    }
    switch(op){
        case tk::LT: out = l->token.val_num < r->token.val_num; 
        case tk::GT: out = l->token.val_num > r->token.val_num;
        case tk::LEQ: out = l->token.val_num <= r->token.val_num;
        case tk::GEQ: out = l->token.val_num >= r->token.val_num;
        case tk::DNEQ: out = l->token.val_num != r->token.val_num;
    }
    delete l; delete r;
    return out;
}

bool Interpreter::equal(rf::Reference *l, rf::Reference *r){
    bool out;
    if(l->type == tk::STRING) out = l->token.val_str == r->token.val_str;
    else if(l->type == tk::NUM) out = l->token.val_num == r->token.val_num;
    delete l; delete r;
    return out;
}

rf::Reference *Interpreter::declare_empty_array(ast::AST *root){
    rf::Reference *arr = new rf::Reference;
    unsigned size = 1;
    for(auto &a : root->children){
        size *= a->token.val_num;
        arr->push_dimension(a->token.val_num);
    }
    for(unsigned i = 0; i < size; ++i){
        arr->push_zero();
    }
    arr->type = rf::ARRAY;
    return arr;
}

rf::Reference *Interpreter::make_array(ast::AST *root){
    rf::Reference *arr = new rf::Reference;
    get_dimensions(root, arr);
    get_contents(root, arr, 0); 
    arr->type = rf::ARRAY;
    return arr;
}

void Interpreter::get_contents(ast::AST *root, rf::Reference *arr, unsigned nesting){
    if(root == nullptr) return;
    if(root->children.size() != arr->s[nesting]){ 
        error("ragged array", root);
    }
    for(auto &a : root->children){
        if(a->id == ast::ARR){
            get_contents(a, arr, nesting + 1);
        }else if(nesting == arr->s.size() - 1){
            arr->push_contents(compute(a));
        }else{
            error("inconsistent array nesting", root);
        }
    }
}

void Interpreter::get_dimensions(ast::AST *root, rf::Reference *arr){
    while(root->id == ast::ARR){
        arr->push_dimension(root->children.size());
        root = root->children[0];
    }
}

rf::Reference *Interpreter::access_array(ast::AST *root){
    rf::Reference *arr = call_stack.peek(root->token.val_str, root);
    unsigned addr = compute_key(root, arr);
    return new rf::Reference(arr->get_array_element(addr));
}

unsigned Interpreter::compute_key(ast::AST *accessor, rf::Reference *arr){
    unsigned addr = 0, nod; // number of dimensions
    if((nod = accessor->children.size()) == arr->s.size()){
        for(unsigned i = 0; i < nod - 1; ++i){
            addr = 1;
            addr *= (accessor->children[i]->token.val_num * arr->s[i]); 
        }
        addr += accessor->children[nod - 1]->token.val_num;
    }
    return addr;
}

}
