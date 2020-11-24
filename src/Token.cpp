#include "include/Token.hpp"

namespace tk{

Token::Token(int id, std::string *attr){
    Token::id = id;
    Token::attr = attr;
}

std::string *id_to_str(int id){
    std::string *out = new std::string;
    switch(id){
        case END: *out = "END"; break;
        case PLUS: *out = "PLUS"; break;
        case MINUS: *out = "MINUS"; break;
        case MULT: *out = "MULT"; break;
        case DIV: *out = "DIV"; break;
        case MOD: *out = "MOD"; break;
        case LSQBR: *out = "LSQBR"; break;
        case RSQBR: *out = "RSQBR"; break;
        case LPAREN: *out = "LPAREN"; break;
        case RPAREN: *out = "RPAREN"; break;
        case LT: *out = "LT"; break;
        case GT: *out = "GT"; break;
        case LEQ: *out = "LEQ"; break;
        case GEQ: *out = "GEQ"; break;
        case EQ: *out = "EQ"; break;
        case IS: *out = "IS"; break;
        case DOT: *out = "DOT"; break;
        case COMMA: *out = "COMMA"; break;
        case ID_VAR: *out = "ID_VAR"; break;
        case ID_METHOD: *out = "ID_METHOD"; break;
        case INT: *out = "INT"; break;
        case FLOAT: *out = "FLOAT"; break;
        default: *out = "NULL"; break;
    }
    return out;
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
