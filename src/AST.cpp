#include "include/AST.hpp"

namespace ast{

AST *NewNode(int node_id, const char *attr){
    AST *new_node = new AST;
    new_node->id = node_id;
    new_node->attr = attr;
    new_node->op = 0;
    return new_node;
}

AST *populate_by_attr(AST *parent, int id, const char *attr){
    if(parent == NULL) return NewNode(id, attr);
    AST *new_node = NewNode(id, attr);
    parent->nodes.push_back(new_node);
    return new_node;
}

AST *populate_by_node(AST *parent, AST *child){
    if(parent == NULL) return child;
    parent->nodes.push_back(child);
    return child;
}

void print_tree(AST *root, int offset){
    if(root == NULL) return;
    std::cout << root->attr << std::endl;
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        print_tree(root->nodes[i], offset + 4);
    }
}

}
