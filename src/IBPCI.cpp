#include "include/IBPCI.hpp"

namespace IBPCI{

Interpreter::Interpreter(ast::AST *tree){
    this->tree = tree;
    call_stack = cstk::CallStack(tree);
}

void Interpreter::execute(){
    for(auto *a : tree->children){
        switch(a->id){        
            case ast::ASSIGN: assign(a); break;
            case ast::WHILE: break;
            case ast::FOR: break;
            case ast::IF: break;
            case ast::ELSE: break;
            case ast::COND: break;
            case ast::CMP: break;
            case ast::METHOD: break;
            case ast::METHOD_CALL: break;
            case ast::PARAM: break;
            case ast::RETURN: break;
            case ast::STANDARD_METHOD: break;
            case ast::INPUT: break;
            case ast::OUTPUT: break;
        }
    }
    ast::delete_tree(tree);
    call_stack.test();
}   

double Interpreter::binop(ast::AST *root){
    if(root == NULL) return 0; 
    switch(root->id){
        case ast::NUM: return root->val_num;
        case ast::UN_MIN: return -(binop(root->children[0]));
        case ast::STRING: exit(1);
        case ast::BINOP:
            switch(root->op){
                case tk::PLUS: 
                    return binop(root->children[0]) + binop(root->children[1]);
                case tk::MINUS: 
                    return binop(root->children[0]) - binop(root->children[1]);
                case tk::MULT: 
                    return binop(root->children[0]) * binop(root->children[1]);
                case tk::DIV_WQ: 
                    return binop(root->children[0]) / binop(root->children[1]);
                case tk::DIV_WOQ: 
                    return (long)binop(root->children[0]) / (long)binop(root->children[1]);
                case tk::MOD: 
                    return (long)binop(root->children[0]) % (long)binop(root->children[1]);
            }
    }
    return 0;
}

std::string Interpreter::concatenation(ast::AST *root){
    if(root == NULL) return "";
    if(root->id == ast::STRING){ 
        return root->val_str;
    }else if(root->id == ast::BINOP){
        if(root->op == tk::PLUS){ 
            return concatenation(root->children[0]) + concatenation(root->children[1]);
        }else{
            std::cout << "wrong op";
            exit(1);
        }
    }else{ 
        std::cout << "wrong type";
        exit(1);
    }
    return "";
}

void Interpreter::assign(ast::AST *root){  
    std::string var_name = root->children[0]->val_str;
    ast::AST *rn = root->children[1]; 
    variant_type vt;
    switch(rn->id){
        case ast::NUM:
            call_stack.push(var_name, rn->val_num);
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

int Interpreter::scout_type(ast::AST *root){
    while(root != NULL){ 
        if(root->id == ast::NUM || root->id == ast::STRING)
            return root->id;
        else
            root = root->children[0];
    }
    return -1;
}

};
