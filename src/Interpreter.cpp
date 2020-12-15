#include "include/Interpreter.hpp"

namespace pci{

std::map<std::string, ast::AST*> global_scope;


Reference::Reference(int tp, ast::AST *rt){
    type = tp;
    root = rt;
}

void print_table(){
    std::map<std::string, ast::AST*>::iterator it;
    for(it = global_scope.begin(); it != global_scope.end(); ++it){
        std::cout << "{" << it->first;
        ast::print_tree(it->second, 0); 
    }
}

void interpret(ast::AST *root){
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        execute(root->nodes[i]);
    }
}

void execute(ast::AST *root){
    switch(root->id){
        case ast::OUTPUT: output(root); break;
        case ast::ASSIGN: assignment(root); break;
        case ast::IF: if_statement(root); break;
    }
}

void assignment(ast::AST *root){
    global_scope[root->nodes[0]->attr] = root->nodes[1];
}

void output(ast::AST *root){
    std::string out, temp;
    for(unsigned i = 0; i < root->nodes.size(); ++i){
        switch(root->nodes[i]->id){
            case ast::BINOP: 
                out += std::to_string(binop(root->nodes[i])) + "\n"; break;
            case ast::ID_VAR: 
                out += std::to_string(binop(variable(root->nodes[i]))) + "\n"; 
                break;
            case ast::STRING:
                out += root->nodes[i]->attr;
                break;
        }
    }
    std::cout << out;
}

ast::AST *variable(ast::AST *root){
    std::map<std::string, ast::AST*>::const_iterator it = global_scope.find(root->attr);
    if(it == global_scope.end()){
        std::cout << "Undefided reference to a variable: " << root->attr << std::endl;
        exit(1);
    }else{
        return it->second;
    }
    
}

void if_statement(ast::AST *root){
    if(condition(root->nodes[0])){
        for(unsigned i = 1; i < root->nodes.size(); ++i){
            if(root->nodes[i]->id != ast::ELSE) execute(root->nodes[i]); 
        }
    }else{
        for(unsigned i = 1; i < root->nodes.size(); ++i){
            if(root->nodes[i]->id == ast::ELSE) 
                if(else_statement(root->nodes[i]) == 1) return;
        }
        
    }
}

bool else_statement(ast::AST *root){
    if(root->nodes[0]->id == ast::IF){
        if(elif_statement(root->nodes[0]) == 1) return 1;
    }else{
        for(unsigned i = 0; i < root->nodes.size(); ++i){
             execute(root->nodes[i]); 
        }
    }
    return 0;
}

bool elif_statement(ast::AST *root){
    if(condition(root->nodes[0])){
        for(unsigned i = 1; i < root->nodes.size(); ++i){
            if(root->nodes[i]->id != ast::ELSE) execute(root->nodes[i]); 
        }
        return 1;
    }
    return 0;
}

double binop(ast::AST *root){
    if(root == NULL) return 1;
    if(root->id == ast::NUM){
        return std::atof(root->attr);
    }else if(root->id == ast::UN_MIN){
        return -binop(root->nodes[0]);
    }else if(root->id == ast::ID_VAR){
        return binop(variable(root));
    }else if(root->id == ast::BINOP){
        switch(root->op){
            case tk::PLUS:
                return binop(root->nodes[0]) + binop(root->nodes[1]);
            case tk::MINUS:
                return binop(root->nodes[0]) - binop(root->nodes[1]);
            case tk::MULT:
                return binop(root->nodes[0]) * binop(root->nodes[1]);
            case tk::MOD:
                return (int)binop(root->nodes[0]) % (int)binop(root->nodes[1]);
            case tk::DIV_WQ:
                if(binop(root->nodes[1]) == 0) {std::cout << "cannot div by 0"; exit(1);}
                return (int)binop(root->nodes[0]) / (int)binop(root->nodes[1]);
            case tk::DIV_WOQ:
                if(binop(root->nodes[1]) == 0) {std::cout << "cannot div by 0"; exit(1);}
                return binop(root->nodes[0]) / binop(root->nodes[1]);
            case tk::INT:
                return std::atof(root->nodes[0]->attr);
            default: break;
        }
    }
    return 0;
}

bool condition(ast::AST *root){
    if(root == NULL) return 1;
    if(root->op == tk::LT
            || root->op == tk::GT){
        return boolop(root);
    }else{
        switch(root->op){
            case tk::AND:
                return condition(root->nodes[0]) && condition(root->nodes[1]);
            case tk::OR:
                return condition(root->nodes[0]) || condition(root->nodes[1]);
            default: break;
        }
    }
    return 0;
}
    
bool boolop(ast::AST *root){
    if(root == NULL) return 0;
    switch(root->op){
        case tk::LT:
            return binop(root->nodes[0]) < binop(root->nodes[1]);
        case tk::GT:
            return binop(root->nodes[0]) > binop(root->nodes[1]);
    }
    return 0;
}


}
