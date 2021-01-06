#include "include/AST.hpp"

namespace ast{

AST::AST(tk::Token &token, int node_id, unsigned ln){
    id = node_id;
    line_num = ln;
    switch(token.id){
        case tk::INT: val.i = token.val.i; break;
        case tk::FLOAT: val.f = token.val.f; break;
        default: val_str = *token.val.str;
    }
}

AST::AST(int node_id){ id = node_id; val_str = id_to_str(node_id);}

void AST::push_child(AST *child){
    children.push_back(child);
}

void print_tree(AST *root, int offset){
    if(root == NULL) return;
    std::cout << std::setw(offset); 
    std::cout << "\u2560";
    std::cout << "\u2550\u2550[";
    switch(root->id){
        case ast::INT: std::cout << root->val.i; break;
        case ast::FLOAT: std::cout << root->val.f; break;
        default: std::cout << root->val_str; break;
    }
    std::cout << "]\n";
    for(auto *a : root->children){
        print_tree(a, offset+4);
    }
}

void delete_tree(AST *root){
    if(root == NULL) return;
    for(auto *a : root->children){
        delete_tree(a);
    }
    delete root;
}

std::string id_to_str(int id){
    std::string out;
    switch(id){
        case START: out = "start"; return out;
        case METHOD: out = "method"; return out;
        case METHOD_CALL: out = "method call"; return out;
        case PARAM: out = "param"; return out;
        case RETURN: out = "return"; return out;
        case WHILE: out = "while"; return out;
        case FOR: out = "for"; return out;
        case IF: out = "if"; return out;
        case ELSE:  out = "else"; return out;
        case COND:  out = "cond"; return out;
        case CMP: out = "cmp"; return out;
        case ASSIGN: out = "="; return out;
        case BINOP:  out = "binop"; return out;
        case UN_MIN: out = "-"; return out;
        case INT:  out = "int"; return out;
        case FLOAT:  out = "float"; return out;
        case STRING:  out = "string"; return out;
        case ID: out = "id"; return out;
        case ARR:  out = "arr"; return out;
        case ARR_DYN:  out = "arr_dyn"; return out;
        case ARR_ACC: out = "arr_acc"; return out;
        case STACK:  out = "stack"; return out;
        case QUEUE: out = "queue"; return out;
        case STANDARD_METHOD:  out = "standard_method"; return out;
        case INPUT:  out = "input"; return out;
        case OUTPUT: out = "output"; return out;
    }   
    return 0;
}

}