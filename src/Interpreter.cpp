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

void Interpreter::error(std::string message, tk::Token *token){
    std::cout << "RUN-TIME error at line " << token->line
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
    tk::Token *in;
    ast::AST *rn = root->children[1]; 
    switch(rn->id){
        case ast::NUM: in = compute(rn); break;
        case ast::STRING: in = compute(rn); break;
        case ast::ID: in = compute(rn); break;
        case ast::UN_MIN: in = compute(rn); break;
        case ast::BINOP: in = compute(rn); break;
    }
    call_stack.push(var_name, in);
    delete in;
}

tk::Token *Interpreter::compute(ast::AST *root){
    if(root == nullptr) return nullptr;
    switch(root->id){
        case ast::NUM: return new tk::Token(root->token);
        case ast::STRING: return new tk::Token(root->token);
        case ast::ID: return new tk::Token(call_stack.peek(root->token.val_str, root));
        case ast::UN_MIN: return negative(compute(root->children[0]));
        case ast::BINOP: return binop(compute(root->children[0]), compute(root->children[1]), root->token.id);
    }
    return nullptr;
}

tk::Token *Interpreter::binop(tk::Token *l, tk::Token *r, int op){
    check_types(l, r);
    tk::Token *out;
    if(l->id == tk::STRING){
        if(op == tk::PLUS){ 
            out = add(l, r);
        }else{ 
            delete l;
            error("cannot make this type of comparison on strings", r);
        }
    }else if(op == tk::MINUS || op == tk::MULT || op == tk::PLUS){
        switch(op){
            case tk::PLUS: out = add(l, r); break;
            case tk::MINUS: out = new tk::Token(l->val_num - r->val_num); break; 
            case tk::MULT: out = new tk::Token(l->val_num * r->val_num); break;
        }
    }else{
        out = divide(l, r, op);
    }
    delete l; delete r;
    return out;
}

tk::Token *Interpreter::add(tk::Token *l, tk::Token *r){
    if(l->id == tk::STRING){
        return new tk::Token(l->val_str + r->val_str);
    }else{
        return new tk::Token(l->val_num + r->val_num);
    }
    return nullptr;
}

tk::Token *Interpreter::divide(tk::Token *l, tk::Token *r, int op){
    if(r->val_num == 0){
        delete l; 
        error("Division by 0 is illegal", r);
    }
    switch(op){
        case tk::DIV_WOQ: return new tk::Token(l->val_num / r->val_num);
        case tk::DIV_WQ: return new tk::Token((int)l->val_num / (int)r->val_num);
        case tk::MOD: return new tk::Token((int)l->val_num % (int)r->val_num);
    }
    return nullptr;
}


bool Interpreter::check_types(tk::Token *l, tk::Token *r){
    std::string error_message;
    if(l->id == r->id) return true;
    else{
        error_message = ("Incompatible types: " + tk::id_to_str(l->id) + 
            " and " + tk::id_to_str(r->id));
        delete l; error(error_message, r);
    }
    return false;
}


tk::Token *Interpreter::negative(tk::Token *val){
    if(val->id != tk::NUM) error(("Cannot make negative value from " + tk::id_to_str(val->id)), val);
    tk::Token *out = new tk::Token(-(val->val_num));
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

bool Interpreter::numerical_comparison(tk::Token *l, tk::Token *r, int op){
    check_types(l, r);
    bool out;
    if(l->id == tk::STRING){
        if(op == tk::IS) return equal(l, r);
        else{ 
            delete l;
            error("cannot make this type of comparison on strings", r);
        }
    }
    switch(op){
        case tk::LT: out = l->val_num < r->val_num; 
        case tk::GT: out = l->val_num > r->val_num;
        case tk::LEQ: out = l->val_num <= r->val_num;
        case tk::GEQ: out = l->val_num >= r->val_num;
        case tk::DNEQ: out = l->val_num != r->val_num;
    }
    delete l; delete r;
    return out;
}

bool Interpreter::equal(tk::Token *l, tk::Token *r){
    bool out;
    if(l->id == tk::STRING) out = l->val_str == r->val_str;
    else if(l->id == tk::NUM) out = l->val_num == r->val_num;
    delete l; delete r;
    return out;
}

}
