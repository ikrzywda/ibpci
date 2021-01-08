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
            case ast::WHILE: break;
            case ast::FOR: break;
            case ast::METHOD: break;
            case ast::METHOD_CALL: break;
            case ast::RETURN: break;
            case ast::STANDARD_METHOD: break;
            case ast::INPUT: break;
            case ast::OUTPUT: output(a); break;
        }
    }
    ast::delete_tree(tree);
    call_stack.test();
}   

void Interpreter::error(std::string message, ast::AST *leaf){
    std::cout << "SEMANTIC ERROR at line " << leaf->line_num
        << ": " << message << std::endl;
    exit(1);
}

double Interpreter::binop(ast::AST *root){
    double check;
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

std::string Interpreter::concatenation(ast::AST *root){
    if(root == NULL) return "";
    if(root->id == ast::STRING){ 
        return root->val_str;
    }else if(root->id == ast::ID){ 
        return call_stack.peek_for_str(root->val_str, root);
    }else if(root->id == ast::BINOP){
        if(root->op == tk::PLUS){ 
            return concatenation(root->children[0]) + concatenation(root->children[1]);
        }else{
            error("Illegal operation on string, concatenation (+) is legal only", root);
        }
    }else{ 
        error("incompatible type numerical, should be string", root);

    }
    return "";
}

void Interpreter::exec_block(ast::AST *root){
    for(auto &a : root->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::IF: exec_if(a); break;
            case ast::WHILE: break;
            case ast::FOR: break;
            case ast::METHOD: break;
            case ast::METHOD_CALL: break;
            case ast::RETURN: break;
            case ast::STANDARD_METHOD: break;
            case ast::INPUT: break;
            case ast::OUTPUT: output(a); break;
            default: return;
        }
    }
    return;
}

void Interpreter::assign(ast::AST *root){  
    std::string var_name = root->children[0]->val_str;
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

void Interpreter::output(ast::AST *root){
    for(auto &a : root->children){
        switch(a->id){
            case ast::NUM:
                std::cout << a->val_num << std::endl; break;
            case ast::STRING:
                std::cout << a->val_str << std::endl; break;
            case ast::ID:
                if(call_stack.peek_for_type(a->val_str, a) == ast::NUM){
                    std::cout << call_stack.peek_for_num(a->val_str, a) << std::endl;
                }else{
                    std::cout << call_stack.peek_for_str(a->val_str, a) << std::endl;
                }
                break;
            case ast::BINOP:
                if(a->op == tk::PLUS){
                    if(scout_type(a->children[1]) == ast::STRING){
                        concatenation(a->children[1]);
                        std::cout << concatenation(a->children[1]) << std::endl; 
                    }else std::cout << binop(a->children[1]) << std::endl; 
                }else std::cout << binop(a->children[1]) << std::endl;
                break;
            default: error(("cannot output " + ast::id_to_str(a->id)), a); break;
        }
    }
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

};
