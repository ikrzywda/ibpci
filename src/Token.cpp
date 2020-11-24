#include "include/Token.hpp"

namespace tk{

Token::Token(int id, std::string *attr){
    Token::id = id;
    Token::attr = attr;
}

std::string *id_to_str(int id){
    std::string *out = new std::string;
    switch(id){
        case END_FILE: *out = "EOF"; break;
        case PLUS: *out = "+"; break;
        case MINUS: *out = "-"; break;
        case MULT: *out = "*"; break;
        case DIV_WOQ: *out = "/"; break;
        case DIV_WQ: *out = "div"; break;
        case MOD: *out = "mod"; break;
        case LSQBR: *out = "["; break;
        case RSQBR: *out = "]"; break;
        case LPAREN: *out = "("; break;
        case RPAREN: *out = ")"; break;
        case QTMARK: *out = "\""; break;
        case LT: *out = "<"; break;
        case GT: *out = ">"; break;
        case LEQ: *out = "<="; break;
        case GEQ: *out = ">="; break;
        case EQ: *out = "="; break;
        case IS: *out = "=="; break;
        case DOT: *out = "."; break;
        case COMMA: *out = ","; break;
        case INT: *out = "INT"; break;
        case FLOAT: *out = "FLOAT"; break;
        case STRING: *out = "STRING"; break;
        case ID_VAR: *out = "ID_VAR"; break;
        case ID_METHOD: *out = "ID_METHOD"; break;
        case AND: *out = "AND"; break;
        case OR: *out = "OR"; break;
        case NOT: *out = "NOT"; break;
        case METHOD: *out = "method"; break;
        case RETURN: *out = "return"; break;
        case LOOP: *out = "loop"; break;
        case FROM: *out = "from"; break;
        case TO: *out = "to"; break;
        case WHILE: *out = "while"; break;
        case UNTIL: *out = "until"; break;
        case IF: *out = "if"; break;
        case THEN: *out = "then"; break;
        case ELSE: *out = "else"; break;
        case END: *out = "end"; break;
        case OUTPUT: *out = "output"; break;
        default: *out = "NULL"; break;
    }
    return out;
}

int lookup_keyword(std::string lexeme){
    if(RESERVED_KEYWORDS.count(lexeme) > 0){
        return RESERVED_KEYWORDS.at(lexeme);
    }else{
        return 0;
    }
}

std::string *tok_to_str(tk::Token *token){
    std::string *out = new std::string;
    out->append("<");
    out->append(*id_to_str(token->id));
    out->append(",");
    out->append(*token->attr);
    out->append(">\n");
    return out;
}

}
