#include "include/Interpreter.hpp"

namespace IBPCI{

Interpreter::Interpreter(ast::AST *tree){
    this->tree = tree;
    call_stack = cstk::CallStack(tree);
}

void Interpreter::interpret(){
    rf::Reference *method;
    for(auto *a : tree->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::STD_VOID: std_void(a); break;
            case ast::IF: exec_if(a); break;
            case ast::WHILE: exec_whl(a); break;
            case ast::FOR: exec_for(a); break;
            case ast::METHOD: method_decl(a); break;
            case ast::METHOD_CALL: method = method_call(a); delete method; break;
            //case ast::INPUT: input(a);
            case ast::OUTPUT: output(a); break;
        }
    }
    ast::delete_tree(tree);
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
    print_methods();
}

rf::Reference *Interpreter::method_call(ast::AST *root){
    std::string method_name = root->token.val_str;
    std::vector<rf::Reference*> computed_params;
    rf::Reference *return_reference;
    if(!root->children.empty())
        collect_params(root->children[0], &computed_params);
    call_stack.push_AR(method_name, lookup_method(method_name, root));
    ast::AST *method_root = call_stack.peek_for_root();
    init_record(root, &computed_params);
    if(method_root->children.size() == 2)
        return_reference = exec_block(method_root->children[1]);
    else{
        return_reference = exec_block(method_root->children[0]);
    }
    call_stack.pop();
    return return_reference;
}

void Interpreter::exec_if(ast::AST *root){
    bool b = condition(root->children[0]);
    ast::AST *n;
    if(b){
        exec_block(root->children[1]);
    }else if(root->children.size() > 2){
        for(unsigned i = 2; n = root->children[i], i < root->children.size(); ++i){
            if(n->id == ast::ELIF){
                if(condition(n->children[0])){ 
                    exec_block(n->children[1]);
                    return;
                }
            }else if(n->id == ast::ELSE){
                if(!b){ 
                    exec_block(n->children[0]);
                    return;
                }
            }
        }
    }
}

void Interpreter::exec_whl(ast::AST *root){
    while(condition(root->children[0])){
        exec_block(root->children[1]);
    }
}

void Interpreter::exec_for(ast::AST *root){
    ast::AST *rng = root->children[0];
    ast::AST *block = root->children[1];
    std::string iter = rng->children[0]->token.val_str;
    rf::Reference *from = compute(rng->children[1]);
    rf::Reference *to = compute(rng->children[2]);
    int fr = from->token.val_num;
    int t = to->token.val_num;
    call_stack.push(iter, from);
    delete to;
    if(fr < t){
        for(; fr <= t; ++fr){
            from->token.val_num = fr;
            call_stack.push(iter, from);
            exec_block(block);
        }
    }else{
        for(; fr >= t; --fr){
            from->token.val_num = fr;
            call_stack.push(iter, from);
            exec_block(block);
        }
    }
    delete from;
}

rf::Reference *Interpreter::exec_block(ast::AST *root){
    rf::Reference *method;
    for(auto &a : root->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::IF: exec_if(a); break;
            case ast::WHILE: exec_whl(a); break;
            case ast::STD_VOID: std_void(a); break;
            case ast::FOR: exec_for(a); break;
            case ast::METHOD_CALL: method = method_call(a); delete method; break;
            //case ast::INPUT: input(a); break;
            case ast::OUTPUT: output(a); break;
            case ast::RETURN: return compute(a->children[0]);
            default: error("Unexpected behavior", root);
        }
    }
    return nullptr;
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
    rf::Reference *ref;
    if(root == nullptr) return nullptr;
    switch(root->id){
        case ast::NUM: return new rf::Reference(&root->token);
        case ast::STRING: return new rf::Reference(&root->token);
        case ast::ID: return new rf::Reference(call_stack.peek(root->token.val_str, root));
        case ast::UN_MIN: return negative(compute(root->children[0]));
        case ast::STACK: return new rf::Reference(ast::STACK);
        case ast::QUEUE: return new rf::Reference(ast::QUEUE);
        case ast::ARR: return make_array(root);
        case ast::ARR_ACC: return access_array(root);
        case ast::ARR_DYN: return declare_empty_array(root);
        case ast::STD_RETURN: return std_return(root);
        case ast::BINOP: return binop(compute(root->children[0]), compute(root->children[1]), root->token.id);
        case ast::INPUT: return input(root);
        case ast::METHOD_CALL:
                ref = method_call(root);
                if(ref == nullptr) return new rf::Reference(VOID_RETURN);
                else return ref;
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
        if(op == tk::IS) out = equal(l, r);
        else{ 
            delete l;
            error("cannot make this type of comparison on strings", r);
        }
    }
    switch(op){
        case tk::LT: out = l->token.val_num < r->token.val_num; break;
        case tk::GT: out = l->token.val_num > r->token.val_num; break;
        case tk::LEQ: out = l->token.val_num <= r->token.val_num; break;
        case tk::GEQ: out = l->token.val_num >= r->token.val_num; break;
        case tk::DNEQ: out = l->token.val_num != r->token.val_num; break;
        case tk::IS: out = equal(l,r); break;
    }
    delete l; delete r;
    return out;
}

bool Interpreter::equal(rf::Reference *l, rf::Reference *r){
    bool out;
    if(l->type == tk::STRING) out = l->token.val_str == r->token.val_str;
    else if(l->type == tk::NUM) out = l->token.val_num == r->token.val_num;
    std::cout << "equal: " << out;
    return out;
}

rf::Reference *Interpreter::declare_empty_array(ast::AST *root){
    rf::Reference *arr = new rf::Reference;
    rf::Reference *arg;
    unsigned size = 1;
    for(auto &a : root->children){
        arg = compute(a);
        if(arg->type != tk::NUM) error("Only viable argument is a number", a);
        size *= arg->token.val_num;
        arr->push_dimension(arg->token.val_num);
        delete arg;
    }
    for(unsigned i = 0; i < size; ++i){
        arr->push_zero();
    }
    arr->type = ast::ARR;
    return arr;
}

rf::Reference *Interpreter::make_array(ast::AST *root){
    rf::Reference *arr = new rf::Reference;
    get_dimensions(root, arr);
    get_contents(root, arr, 0); 
    arr->type = ast::ARR;
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
    rf::Reference *computed_node;
    unsigned addr = 1, nod; // number of dimensions
    if((nod = accessor->children.size()) == arr->s.size()){
        for(unsigned i = 0; i < nod - 1; ++i){
            computed_node = compute(accessor->children[i]);
            addr *= computed_node->token.val_num * arr->s[i]; 
            delete computed_node;
        }
        computed_node = compute(accessor->children[nod - 1]);
        if(addr == 0) addr += computed_node->token.val_num;
        else if(addr == 1) addr = computed_node->token.val_num;
        else addr += computed_node->token.val_num;
        delete computed_node;
        if(addr > arr->adt.size() - 1 || addr < 0){
            error(("index " + std::to_string(addr) + " out of bounds"), accessor);
        }
    }
    return addr;
}

void Interpreter::std_void(ast::AST *root){
    switch(root->children[0]->children[0]->token.id){
        case tk::PUSH: push(root->children[0]); break;
        case tk::ENQUEUE: enqueue(root->children[0]); break;
    }
}

void Interpreter::push(ast::AST *root){
    rf::Reference *ref = call_stack.peek(root->token.val_str, root);
    if(ref->type == ast::STACK){
        ref->push_contents(compute(root->children[0]->children[0]));
        ref->s[0] += 1;
    }else{
        error("'push' can only be done on a stack", root);
    }
}

void Interpreter::enqueue(ast::AST *root){
    rf::Reference *ref = call_stack.peek(root->token.val_str, root);
    if(ref->type == ast::QUEUE){
        ref->push_contents(compute(root->children[0]->children[0]));
        ref->s[0] += 1;
    }else{
        error("'enqueue' can only be done on a queue", root);
    }
}

rf::Reference *Interpreter::std_return(ast::AST *root){
    switch(root->children[0]->token.id){
        case tk::LENGTH: return length(root); 
        case tk::POP: return pop(root);
        case tk::DEQUEUE: return dequeue(root);
        case tk::GET_NEXT: return get_next(root);
        case tk::IS_EMPTY: return empty(root);
    }
    return nullptr;
}

rf::Reference *Interpreter::length(ast::AST *root){
    rf::Reference *arr = call_stack.peek(root->token.val_str, root);
    double len = 1;
    for(auto &a : arr->s){
        len *= a;
    }
    return new rf::Reference(len);
}

rf::Reference *Interpreter::pop(ast::AST *root){
    rf::Reference *stk = call_stack.peek(root->token.val_str, root);
    if(stk->type != ast::STACK) error("'pop' can only be performed on stacks", root);
    if(!stk->adt.empty()){
        return stk->pop();
    }else{
        error("Cannot perform 'pop' on an empty stack", root);
    }
    return nullptr;
}

rf::Reference *Interpreter::dequeue(ast::AST *root){
    rf::Reference *que = call_stack.peek(root->token.val_str, root);
    if(que->type != ast::QUEUE) error("'dequeue' can only be performed on queues", root);
    if(!que->adt.empty()){
        return que->dequeue();
    }else{
        error("Cannot perform 'pop' on an empty stack", root);
    }
    return nullptr;
}

rf::Reference *Interpreter::get_next(ast::AST *root){ 
    rf::Reference *ref = call_stack.peek(root->token.val_str, root);
    if(!ref->adt.empty()){
        if(ref->type == ast::STACK){
            return new rf::Reference(ref->adt.front());
        }else if(ref->type == ast::QUEUE){
            return new rf::Reference(ref->adt.back());
        }else{
            error("'getNext()' can only be perfromed on a stack or a queue", root);
        }
    }else{
        error("cannot perform 'getNext()' on an empty container", root);
    }
    return nullptr;
}   

rf::Reference *Interpreter::empty(ast::AST *root){
    rf::Reference *ref = call_stack.peek(root->token.val_str, root);
    if(ref->adt.empty()) return new rf::Reference(1.f);
    else return new rf::Reference(0.f);
}

ast::AST *Interpreter::lookup_method(std::string key, ast::AST *leaf){
    method_map::iterator it;
    if((it = methods.find(key)) != methods.end()){
        return it->second;
    }else{
        error(("Undefined reference to method " + key), leaf);
    }
    return NULL;
}

void Interpreter::collect_params(ast::AST *root, std::vector<rf::Reference*> *container){
    if(root->id == ast::PARAM)
        for(auto &a : root->children){
            container->push_back(compute(a));
        }
}

void Interpreter::init_record(ast::AST *root, std::vector<rf::Reference*> *params){
    ast::AST *method_root = call_stack.peek_for_root();
    if(method_root->children[0]->id != ast::BLOCK){
        ast::AST *param_proto = method_root->children[0];
        std::string param_name;
        if(params->size() == param_proto->children.size()){
            for(unsigned i = 0; i < params->size(); ++i){
                param_name = param_proto->children[i]->token.val_str;
                call_stack.push(param_name, params->at(i));
            }
        }else{
            error(("Incorrect number of arguments in the call of function " 
                        + call_stack.peek_for_name()), root); 
        }
        for(auto &a : *params){
            delete a;
        }
    }
}

void Interpreter::output(ast::AST *root){
    rf::Reference *output;
    for(auto &a : root->children){
        output = compute(a);
        output->print();
        delete output;
    }
    std::cout << std::endl;
}

rf::Reference *Interpreter::input(ast::AST *root){
    std::cout << root->children[0]->token.val_str;
    std::string buffer;
    std::cin >> buffer;
    buffer.push_back('\0');
    std::cout << std::endl;
    lxr::Lexer lex(std::move(buffer)); 
    return new rf::Reference(&lex.get_next_token());
}

void Interpreter::print_methods(){
    std::cout << "METHODS" << "\n==============================\n";
    for(auto &a : methods){
        std::cout << a.first << " : " << a.second << std::endl;
    }
}

}
