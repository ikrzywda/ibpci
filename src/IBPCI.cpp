#include "include/IBPCI.hpp"

namespace IBPCI{

Interpreter::Interpreter(ast::AST *tree){
    this->tree = tree;
    call_stack = cstk::CallStack(tree);
}

void Interpreter::interpret(){
    for(auto *a : tree->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::IF: exec_if(a); break;
            case ast::WHILE: exec_whl(a); break;
            case ast::FOR: exec_for(a); break;
            case ast::METHOD: method_decl(a); break;
            case ast::METHOD_CALL: method_call(a); break;
            case ast::RETURN: break;
            case ast::STANDARD_METHOD: break;
            case ast::INPUT: input(a);
            case ast::OUTPUT: output(a); break;
        }
    }
    ast::delete_tree(tree);
    call_stack.test();
    print_methods();
}   

void Interpreter::error(std::string message, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->line_num
        << ": " << message << std::endl;
    exit(1);
}

void Interpreter::method_decl(ast::AST *root){
    if(methods.find(root->val_str) == methods.end()){
        methods.insert(std::make_pair(root->val_str, root));
    }else{
        error("Duplicate method declaration", root);
    }
}

void Interpreter::method_call(ast::AST *root){
    std::string method_name = root->val_str;
    collect_params(root);
    call_stack.push_AR(method_name, lookup_method(method_name, root));
    init_record(root);
}

double Interpreter::binop(ast::AST *root){
    double check;
    tk::Token input_token;
    if(root == NULL) return 0; 
    switch(root->id){
        case ast::NUM: return root->val_num;
        case ast::ID: return call_stack.peek_for_num(root->val_str, root);
        case ast::UN_MIN: return -(binop(root->children[0]));
        case ast::STRING: error("incompatible type STRING, should be NUM", root);
        case ast::BINOP:
            switch(root->op){
                case tk::PLUS: 
                    return binop(root->children[0]) + binop(root->children[1]);
                case tk::MINUS: 
                    return binop(root->children[0]) - binop(root->children[1]);
                case tk::MULT: 
                    return binop(root->children[0]) * binop(root->children[1]);
                case tk::DIV_WQ:
                    if((check = binop(root->children[1])) == 0) error("cannot divide by 0", root->children[1]);
                    else return binop(root->children[0]) / check;
                case tk::DIV_WOQ: 
                    if((check = binop(root->children[1])) == 0) error("cannot divide by 0", root->children[1]);
                    else return (long)binop(root->children[0]) / (long)binop(root->children[1]);
                case tk::MOD: 
                    return (long)binop(root->children[0]) % (long)binop(root->children[1]);
            }
    }
    return 0;
}

std::string Interpreter::concatenation(ast::AST *root){
    tk::Token input_token;
    if(root == NULL) return "";
    switch(root->id){ 
        case ast::STRING: return root->val_str;
        case ast::ID: return call_stack.peek_for_str(root->val_str, root);
        case ast::BINOP:
            if(root->op == tk::PLUS) 
                return concatenation(root->children[0]) + concatenation(root->children[1]);
            else
                error("Illegal operation on string, concatenation (+) is legal only", root);
        case ast::NUM: error("incompatible type numerical, should be string", root);

    }
    return "";
}

bool Interpreter::condition(ast::AST *root){
    if(root == NULL) return 0;
    if(root->id == ast::CMP){
        if(root->op == tk::IS){
            if(scout_type(root) == ast::STRING){
                return cmp_str(root);
            }else return cmp(root);
        }else return cmp(root);
    }else if(root->id == ast::COND){
        switch(root->op){
            case tk::AND:
                return condition(root->children[0]) && condition(root->children[1]); break;
            case tk::OR:
                return condition(root->children[0]) || condition(root->children[1]); break;
        }
    }
    return 0;
}

bool Interpreter::cmp(ast::AST *root){
    if(root == NULL) return 0;
    switch(root->op){
        case tk::LT: 
            return binop(root->children[0]) < binop(root->children[1]);
        case tk::GT: 
            return binop(root->children[0]) > binop(root->children[1]);
        case tk::LEQ: 
            return binop(root->children[0]) <= binop(root->children[1]);
        case tk::GEQ: 
            return binop(root->children[0]) >= binop(root->children[1]);
        case tk::DNEQ:
            return binop(root->children[0]) != binop(root->children[1]);
        case tk::IS:
            return binop(root->children[0]) == binop(root->children[1]);
        }
    return 0;
}

bool Interpreter::cmp_str(ast::AST *root){
    if(root == NULL) return 0;
    return concatenation(root->children[0]) == concatenation(root->children[1]);
}

void Interpreter::exec_block(ast::AST *root){
    for(auto &a : root->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::IF: exec_if(a); break;
            case ast::WHILE: exec_whl(a); break;
            case ast::FOR: exec_for(a); break;
            case ast::METHOD: break;
            case ast::METHOD_CALL: break;
            case ast::RETURN: break;
            case ast::STANDARD_METHOD: break;
            case ast::INPUT: input(a); break;
            case ast::OUTPUT: output(a); break;
            default: return;
        }
    }
    return;
}

void Interpreter::assign(ast::AST *root){  
    std::string var_name = root->children[0]->val_str;
    tk::Token input_token;
    ast::AST *rn = root->children[1]; 
    variant_type vt;
    switch(rn->id){
        case ast::NUM:
            call_stack.push(var_name, rn->val_num);
            break;
        case ast::ID:
            if(call_stack.peek_for_type(rn->val_str, rn) == ast::NUM){
                call_stack.push(var_name, call_stack.peek_for_num(rn->val_str, rn));
            }else{
                call_stack.push(var_name, call_stack.peek_for_str(rn->val_str, rn));
            }
            break;
        case ast::UN_MIN:
            call_stack.push(var_name, -(binop(rn->children[0])));
            break;
        case ast::INPUT:
            if((input_token = input(rn)).id == tk::STRING)
                call_stack.push(var_name, input_token.val_str); 
            else call_stack.push(var_name, input_token.val_num); 
            break;
        case ast::STRING:
            call_stack.push(var_name, rn->val_str);
            break;
        case ast::BINOP:
            if(rn->op == tk::PLUS){
                if(scout_type(rn) == ast::STRING){
                    concatenation(rn);
                    call_stack.push(var_name, concatenation(rn));
                }else call_stack.push(var_name, binop(rn));
            }else call_stack.push(var_name, binop(rn));
            break;
    }
}

void Interpreter::exec_if(ast::AST *root){
    bool b = condition(root->children[0]);
    ast::AST *n;
    if(b){
        exec_block(root->children[1]);
    }else if(root->children.size() > 2){
        for(unsigned i = 2; n = root->children[i], i < root->children.size(); ++i){
            if(n->id == ast::ELSE){
                if(n->children[0]->id == ast::COND){
                    exec_if(n);
                }else if(!b){
                    exec_block(n->children[0]);
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
    int from = binop(rng->children[1]);
    int to = binop(rng->children[2]);
    call_stack.push(rng->children[0]->val_str, from);
    if(from < to){
        for(; from <= to; ++from){
            call_stack.push(rng->children[0]->val_str, from);
            exec_block(block);
        }
    }else{
        for(; from >= to; --from){
            call_stack.push(rng->children[0]->val_str, from);
            exec_block(block);
        }
    }
}

void Interpreter::output(ast::AST *root){
    tk::Token input_token;
    for(auto &a : root->children){
        switch(a->id){
            case ast::NUM:
                std::cout << a->val_num; break;
            case ast::STRING:
                std::cout << a->val_str; break;
            case ast::ID:
                if(call_stack.peek_for_type(a->val_str, a) == ast::NUM){
                    std::cout << call_stack.peek_for_num(a->val_str, a);
                }else{
                    std::cout << call_stack.peek_for_str(a->val_str, a);
                }
                break;
            case ast::INPUT:
                if((input_token = input(a)).id == tk::STRING)
                    std::cout << input_token.val_str; 
                else std::cout << input_token.val_num; 
                break;
            case ast::BINOP:
                if(a->op == tk::PLUS){
                    if(scout_type(a) == ast::STRING){
                        std::cout << concatenation(a); 
                    }else std::cout << binop(a); 
                }else std::cout << binop(a);
                break;
            default: error(("cannot output " + ast::id_to_str(a->id)), a); break;
        }
        std::cout << std::endl;
    }
}

tk::Token &Interpreter::input(ast::AST *root){
    std::cout << root->children[0]->val_str;
    std::string buffer;
    std::cin >> buffer;
    buffer.push_back('\0');
    std::cout << std::endl;
    lxr::Lexer lex(std::move(buffer)); 
    return lex.get_next_token();
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

void Interpreter::collect_params(ast::AST *root){
    tk::Token input_token;
    for(auto &a : root->children[0]->children){
        switch(a->id){
            case ast::ID:
                if(call_stack.peek_for_type(a->val_str, a) == ast::NUM){
                    cp.push_back(std::make_unique<ar::Reference>(call_stack.peek_for_num(a->val_str, a)));
                }else{
                    cp.push_back(std::make_unique<ar::Reference>(call_stack.peek_for_str(a->val_str, a)));
                }
                break;
            case ast::INPUT:
                if((input_token = input(a)).id == tk::STRING)
                    cp.push_back(std::make_unique<ar::Reference>(input_token.val_str));
                else
                    cp.push_back(std::make_unique<ar::Reference>(input_token.val_num));
                break;
            case ast::NUM:
                cp.push_back(std::make_unique<ar::Reference>(a->val_num));
                break;
            case ast::STRING:
                cp.push_back(std::make_unique<ar::Reference>(a->val_str));
                break;
            case ast::BINOP:
                if(a->op == tk::PLUS){
                    if(scout_type(a) == ast::STRING){
                        concatenation(a);
                        cp.push_back(std::make_unique<ar::Reference>(concatenation(a)));
                    }else cp.push_back(std::make_unique<ar::Reference>(binop(a)));
                }else cp.push_back(std::make_unique<ar::Reference>(binop(a)));
                break;
            }
    }
}

void Interpreter::init_record(ast::AST *root){
    ast::AST *param_proto = call_stack.peek_for_root()->children[0];
    std::string param_name;
    if(cp.size() == param_proto->children.size()){
        for(unsigned i = 0; i < cp.size(); ++i){
            param_name = param_proto->children[i]->val_str;
            if(cp[i].get()->get_type() == ast::NUM)
                call_stack.push(param_name, cp[i].get()->get_num());
            else
                call_stack.push(param_name, cp[i].get()->get_str());
        }
    }else{
        error(("Incorrect number of arguments in the call of function " 
                    + call_stack.peek_for_name()), root); 
    }
    cp.clear();
}

int Interpreter::scout_type(ast::AST *root){
    while(root != NULL){ 
        if(root->id == ast::NUM 
                || root->id == ast::STRING){
            return root->id;
        }else if(root->id == ast::ID){
            return call_stack.peek_for_type(root->val_str, root);
        }else{
            root = root->children[0];
        }
    }
    return -1;
}

void Interpreter::print_methods(){
    std::cout << "METHODS" << "\n==============================\n";
    for(auto &a : methods){
        std::cout << a.first << " : " << a.second;
    }
}

};
