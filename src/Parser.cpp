#include "include/Parser.hpp"

namespace prs{
    
Parser::Parser(const lxr::Lexer &lexer) : lex(lexer){	
    tok_curr = lex.get_next_token();
}

void Parser::eat(int token_id){
    if(tok_curr->id == token_id){
        //delete tok_curr;
        tok_curr = lex.get_next_token();
    }else error(token_id);
}

void Parser::error(int token_id){
    std::cout << "SYNTAX ERROR at line " << lex.line_num << 
        ":\n\tunexpected token: " << *tk::id_to_str(tok_curr->id);
    if(token_id >= 0)
        std::cout << ", expected token: " << *tk::id_to_str(token_id);
    std::cout << std::endl;
    exit(1);
}

const char *Parser::attr_cpy(){
    const char *out;
    std::string *attr_cpy = new std::string(tok_curr->attr->c_str());
    out = attr_cpy->c_str();
    return out;
}

ast::AST *Parser::parse(){
    ast::AST *root = NewNode(ast::START, "0");
    while(tok_curr->id != tk::END_FILE){
        root->nodes.push_back(stmt());
    }
    return root;
}

ast::AST *Parser::stmt(){
    switch(tok_curr->id){
        case tk::ID_VAR: return assign();
        case tk::ID_METHOD: return method_call();
        case tk::METHOD: return method();
        case tk::IF: return if_stmt();
        case tk::RETURN: return ret();
        case tk::LOOP:
            eat(tk::LOOP);
            if(tok_curr->id == tk::WHILE) return loop_whl();
            else if(tok_curr->id == tk::ID_VAR
                    || tok_curr->id == tk::ID_METHOD) return loop_for();
        case tk::INPUT: return in_out();
        case tk::OUTPUT: return in_out();
        default: error(-1);
    }
    return NULL;
}

ast::AST *Parser::method(){
    eat(tk::METHOD);
    ast::AST *params = NULL;
    ast::AST *root = NewNode(ast::METHOD, attr_cpy());
    eat(tk::ID_METHOD);
    eat(tk::LPAREN);
    if(tok_curr->id == tk::ID_VAR){
        params = ast::NewNode(ast::PARAMS, "params");
        params->nodes.push_back(factor());
        while(tok_curr->id != tk::RPAREN){
            eat(tk::COMMA);
            params->nodes.push_back(factor());
        }
    }
    eat(tk::RPAREN);
    if(params != NULL) root->nodes.push_back(params);
    while(tok_curr->id != tk::END){
        root->nodes.push_back(stmt());
    }
    eat(tk::END); eat(tk::METHOD);
    return root;
}   

ast::AST *Parser::ret(){
    eat(tk::RETURN);
    ast::AST *root = ast::NewNode(ast::RETURN, "return");
    root->nodes.push_back(expr());
    return root;
}

ast::AST *Parser::loop_whl(){
    eat(tk::WHILE);
    ast::AST *root = ast::NewNode(ast::WHILE, "while");
    root->nodes.push_back(cond());
    while(tok_curr->id != tk::END){
        root->nodes.push_back(stmt());
    }
    eat(tk::END); eat(tk::LOOP);
    return root;
}

ast::AST *Parser::loop_for(){
    ast::AST *root = ast::NewNode(ast::FOR, "for");
    ast::AST *loop_range = factor();
    eat(tk::FROM);
    loop_range->nodes.push_back(expr());
    eat(tk::TO);
    loop_range->nodes.push_back(expr());
    root->nodes.push_back(loop_range);
    while(tok_curr->id != tk::END){
        root->nodes.push_back(stmt());
    }
    eat(tk::END); eat(tk::LOOP);
    return root;
}

ast::AST *Parser::if_stmt(){
    eat(tk::IF);
    ast::AST *root = ast::NewNode(ast::IF, "if");
    ast::AST *new_node = NULL;
    root->nodes.push_back(cond());
    eat(tk::THEN);
    while(tok_curr->id != tk::END){
        if(tok_curr->id == tk::ELSE){
            new_node = ast::NewNode(ast::ELSE, "else");
            eat(tk::ELSE);
            new_node->nodes.push_back(stmt());
        }
        if(new_node != NULL) root->nodes.push_back(new_node);
        else root->nodes.push_back(stmt());
    }
    eat(tk::END);
    eat(tk::IF);
    return root;
}

ast::AST *Parser::cond(){
    ast::AST *root, *new_node;
    root = cmp();
    while(tok_curr->id == tk::AND
            || tok_curr->id == tk::OR){
        new_node = ast::NewNode(ast::COND, attr_cpy());
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(cmp());
    }
    return root;
}

ast::AST *Parser::cmp(){
    ast::AST *root, *new_node;
    root = factor();
    if(tok_curr->id == tk::IS
            || tok_curr->id == tk::LT
            || tok_curr->id == tk::GT
            || tok_curr->id == tk::DNEQ
            || tok_curr->id == tk::GEQ
            || tok_curr->id == tk::LEQ){
        new_node = NewNode(ast::CMP, attr_cpy());  
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(expr());
    }
    return root;
}

ast::AST *Parser::assign(){
    ast::AST *root = ast::NewNode(ast::ASSIGN, "=");
    root->nodes.push_back(factor());
    root->op = tk::EQ;
    eat(tk::EQ);
    root->nodes.push_back(expr());
    return root;
}

ast::AST *Parser::method_call(){
    ast::AST *root = ast::NewNode(ast::METHOD_CALL, attr_cpy()); 
    eat(tk::ID_METHOD);
    eat(tk::LPAREN);
    if(tok_curr->id != tk::RPAREN){
        root->nodes.push_back(expr());
        while(tok_curr->id != tk::RPAREN){
            eat(tk::COMMA);
            root->nodes.push_back(expr());
        }
    }
    eat(tk::RPAREN);
    return root;
}

ast::AST *Parser::expr(){
    ast::AST *root, *new_node;
    root = term();
    while(tok_curr->id == tk::PLUS 
            || tok_curr->id == tk::MINUS){
        new_node = ast::NewNode(ast::BINOP, attr_cpy());
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(root);
        root = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(term());
    }
    return root;
}

ast::AST *Parser::term(){
    ast::AST *subroot, *new_node;
    subroot = factor();
    while(tok_curr->id == tk::MULT ||
            tok_curr->id == tk::DIV_WQ ||
            tok_curr->id == tk::DIV_WOQ ||
            tok_curr->id == tk::MOD){
        new_node = ast::NewNode(ast::BINOP, attr_cpy());
        new_node->op = tok_curr->id;
        new_node->nodes.push_back(subroot);
        subroot = new_node;
        eat(tok_curr->id);
        new_node->nodes.push_back(factor());
    }
    return subroot;
}

ast::AST *Parser::factor(){
    ast::AST *new_node;
    switch(tok_curr->id){
        case tk::INT:
            new_node = ast::NewNode(ast::NUM, attr_cpy());
            eat(tk::INT);
            return new_node;
        case tk::FLOAT:
            new_node = ast::NewNode(ast::NUM, attr_cpy());
            eat(tk::FLOAT);
            return new_node;
        case tk::MINUS:
            new_node = ast::NewNode(ast::UN_MIN, attr_cpy());
            eat(tk::MINUS);
            if(tok_curr->id == tk::LPAREN){
            eat(tk::LPAREN);
            new_node->nodes.push_back(expr());
            eat(tk::RPAREN);
            }else new_node->nodes.push_back(factor());
            return new_node;
        case tk::STRING:
            new_node = NewNode(ast::STRING, attr_cpy());
            eat(tk::STRING);
            return new_node;
        case tk::ID_VAR:
            new_node = ast::NewNode(ast::ID_VAR, attr_cpy());
            eat(tk::ID_VAR);
            while(tok_curr->id == tk::LSQBR){
                eat(tk::LSQBR);
                new_node->nodes.push_back(expr());
                eat(tk::RSQBR);
            }
            if(tok_curr->id == tk::DOT){ 
                new_node->nodes.push_back(std_method());
                return new_node;
            }
            if(!new_node->nodes.empty()) new_node->id = ast::ARR_ACC;
            return new_node;
        case tk::ID_METHOD:
            return method_call();
        case tk::LPAREN:
            eat(tk::LPAREN);
            new_node = expr();
            eat(tk::RPAREN);
            return new_node;
        case tk::LSQBR: return arr();
        case tk::NEW_ARR: return arr_dyn();
        case tk::NEW_STACK: 
            eat(tk::NEW_STACK); eat(tk::LPAREN); eat(tk::RPAREN);
            new_node = ast::NewNode(ast::STACK, "stack");
            return new_node;
        case tk::NEW_QUEUE:
            eat(tk::NEW_QUEUE); eat(tk::LPAREN); eat(tk::RPAREN);
            new_node = ast::NewNode(ast::QUEUE, "queue");
            return new_node;
        case tk::INPUT: return in_out();
        case tk::OUTPUT: return in_out();
        case tk::END_FILE: std::cout << "END";
        default: error(-1);
    }
    return 0; 
}

ast::AST *Parser::arr(){
    ast::AST *root = NewNode(ast::ARR, "arr");
    eat(tk::LSQBR);
    if(tok_curr->id == tk::INT
            || tok_curr->id == tk::FLOAT
            || tok_curr->id == tk::STRING
            || tok_curr->id == tk::LSQBR){
        root->nodes.push_back(factor());
        while(tok_curr->id != tk::RSQBR){
            eat(tk::COMMA);
            root->nodes.push_back(factor());
        }
    }
    eat(tk::RSQBR);
    return root;
}

ast::AST *Parser::arr_dyn(){
    eat(tk::NEW_ARR);
    ast::AST *root = NewNode(ast::ARR_DYN, "arr_dyn");
    eat(tk::LPAREN);
    root->nodes.push_back(expr());
    while(tok_curr->id != tk::RPAREN){
        eat(tk::COMMA);
        root->nodes.push_back(expr());
    }
    eat(tk::RPAREN);
    return root;
}

ast::AST *Parser::std_method(){
    eat(tk::DOT);
    ast::AST *root;
    if(tok_curr->id == tk::LENGTH
            || tok_curr->id == tk::ADD_ITEM
            || tok_curr->id == tk::GET_NEXT
            || tok_curr->id == tk::RESET_NEXT
            || tok_curr->id == tk::HAS_NEXT
            || tok_curr->id == tk::PUSH
            || tok_curr->id == tk::POP
            || tok_curr->id == tk::ENQUEUE
            || tok_curr->id == tk::DEQUEUE
            || tok_curr->id == tk::IS_EMPTY
            || tok_curr->id == tk::OUTPUT
            || tok_curr->id == tk::INPUT){
        root = NewNode(ast::STANDARD_METHOD, attr_cpy());
        eat(tok_curr->id);
        eat(tk::LPAREN);
        if(tok_curr->id != tk::RPAREN){
            root->nodes.push_back(expr());
            while(tok_curr->id != tk::RPAREN){
                eat(tk::COMMA);
                root->nodes.push_back(expr());
            }
        }
        eat(tk::RPAREN);
    }
    return root;
}

ast::AST *Parser::in_out(){
    ast::AST *root;
    if(tok_curr->id == tk::INPUT) root = NewNode(ast::INPUT, "input");
    else if(tok_curr->id == tk::OUTPUT) root = NewNode(ast::OUTPUT, "output");
    eat(tok_curr->id); eat(tk::LPAREN);
    root->nodes.push_back(expr());
    while(tok_curr->id != tk::RPAREN){
        eat(tk::COMMA);
        root->nodes.push_back(expr());
    }
    eat(tk::RPAREN);
    return root;
}

}
