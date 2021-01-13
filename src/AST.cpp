#include "include/AST.hpp"

namespace ast{

AST::AST(tk::Token &token, int node_id) : token(token){
    id = node_id;
    is_terminal = true;
}

AST::AST(int node_id){ 
    id = node_id; 
    is_terminal = false;
}

void AST::push_child(AST *child){
    children.push_back(child);
}

void print_tree(AST *root, int offset){
    if(root == NULL) return;
    std::cout << std::setw(offset); 
    std::cout << "\u2560";
    std::cout << "\u2550\u2550[";
    if(root->is_terminal) root->token.print();
    else std::cout << id_to_str(root->id);
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
        case BLOCK: out = "block"; return out;
        case METHOD: out = "method"; return out;
        case METHOD_CALL: out = "method call"; return out;
        case PARAM: out = "param"; return out;
        case RETURN: out = "return"; return out;
        case WHILE: out = "while"; return out;
        case FOR: out = "for"; return out;
        case RANGE: out = "range"; return out;
        case IF: out = "if"; return out;
        case ELSE:  out = "else"; return out;
        case COND:  out = "cond"; return out;
        case CMP: out = "cmp"; return out;
        case ASSIGN: out = "="; return out;
        case BINOP:  out = "binop"; return out;
        case UN_MIN: out = "-"; return out;
        case NUM:  out = "numerical"; return out;
        case STRING:  out = "string"; return out;
        case ID: out = "id"; return out;
        case ARR:  out = "arr"; return out;
        case ARR_DYN:  out = "arr_dyn"; return out;
        case ARR_ACC: out = "arr_acc"; return out;
        case STACK:  out = "stack"; return out;
        case QUEUE: out = "queue"; return out;
        case STD_RETURN:  out = "std return"; return out;
        case STD_VOID:  out = "std void"; return out;
        case INPUT:  out = "input"; return out;
        case OUTPUT: out = "output"; return out;
    }   
    return 0;
}

}
