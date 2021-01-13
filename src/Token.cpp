#include "include/Token.hpp"

namespace tk{

Token::Token(Token &tok) : id(tok.id), line(tok.line){
    if(id == NUM) 
        val_num = tok.val_num;
    else if(id >= PLUS && id <= COMMA)
        op = id;
    else
        val_str = tok.val_str;
}

Token::Token(Token *tok) : id(tok->id), line(tok->line){
    if(id == NUM) 
        val_num = tok->val_num;
    else if(id >= PLUS && id <= COMMA)
        op = id;
    else
        val_str = tok->val_str;
}

Token::Token(std::string val){
    id = tk::STRING;
    val_str = val;
}

Token::Token(double val){
    id = tk::NUM;
    val_num = val;
}

void Token::mutate(int id, std::string val, unsigned ln){
    this->id = id;
    val_str = val;
    line = ln;
}

void Token::mutate(int id, double val, unsigned ln){
    this->id = id;
    val_num = val;
    line = ln;
}

void Token::print(){
    if(id == NUM)
        std::cout << val_num;
    else if(id >= tk::PLUS && id <= tk::COMMA)
        std::cout << id_to_str(id);
    else
        std::cout << val_str;
}

std::string id_to_str(int id){
    std::string out;
    switch(id){
        case END_FILE: out = "EOF"; break;
        case PLUS: out = "+"; break;
        case MINUS: out = "-"; break;
        case MULT: out = "*"; break;
        case DIV_WOQ: out = "/"; break;
        case DIV_WQ: out = "div"; break;
        case MOD: out = "mod"; break;
        case LSQBR: out = "["; break;
        case RSQBR: out = "]"; break;
        case LPAREN: out = "("; break;
        case RPAREN: out = ")"; break;
        case QTMARK: out = "\""; break;
        case LT: out = "<"; break;
        case GT: out = ">"; break;
        case LEQ: out = "<="; break;
        case GEQ: out = ">="; break;
        case EQ: out = "="; break;
        case DNEQ: out = "!="; break;
        case IS: out = "=="; break;
        case DOT: out = "."; break;
        case COMMA: out = ","; break;
        case NUM: out = "NUM"; break;
        case STRING: out = "STRING"; break;
        case ID_VAR: out = "ID_VAR"; break;
        case ID_METHOD: out = "ID_METHOD"; break;
        case AND: out = "AND"; break;
        case OR: out = "OR"; break;
        case METHOD: out = "method"; break;
        case RETURN: out = "return"; break;
        case LOOP: out = "loop"; break;
        case FROM: out = "from"; break;
        case TO: out = "to"; break;
        case WHILE: out = "while"; break;
        case UNTIL: out = "until"; break;
        case IF: out = "if"; break;
        case THEN: out = "then"; break;
        case ELSE: out = "else"; break;
        case END: out = "end"; break;
        case OUTPUT: out = "output"; break;
        case INPUT: out = "intput"; break;
        case LENGTH: out = "length"; break;
        case GET_NEXT : out = "get_next"; break;
        case POP : out = "pop"; break;
        case DEQUEUE : out = "dequeue"; break;
        case HAS_NEXT : out = "has_next"; break;
        case PUSH : out = "push"; break;
        case ENQUEUE : out = "enqueue"; break;
        case IS_EMPTY: out = "is_empty"; break;
        default: out = "NULL"; break;
    }
    return out;
}

void print_token(Token *token){
    std::cout << "<" << id_to_str(token->id) << ",";
        if(token->id == tk::NUM) std::cout << token->val_num;
        else std::cout << token->val_str;
    std::cout << ">" << std::endl;
}

int lookup_keyword(std::string lexeme){
    if(RESERVED_KEYWORDS.find(lexeme) != RESERVED_KEYWORDS.end()){
        return RESERVED_KEYWORDS.at(lexeme);
    }else{
        return 0;
    }
}


}
