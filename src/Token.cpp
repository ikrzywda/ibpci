#include "include/Token.hpp"

namespace tk{

Token::Token(int id, std::string *attr){
    Token::id = id;
    Token::attr = attr;
}

std::string *id_to_str(int id){
    std::string *out = new std::string;
    switch(id){
        case tk::END: *out = "END"; break;
        case tk::PLUS: *out = "PLUS"; break;
        case tk::MINUS: *out = "MINUS"; break;
        case tk::MULT: *out = "MULT"; break;
        case tk::DIV: *out = "DIV"; break;
        case tk::MOD: *out = "MOD"; break;
        case tk::LSQBR: *out = "LSQBR"; break;
        case tk::RSQBR: *out = "RSQBR"; break;
        case tk::LPAREN: *out = "LPAREN"; break;
        case tk::RPAREN: *out = "RPAREN"; break;
        case tk::LT: *out = "LT"; break;
        case tk::GT: *out = "GT"; break;
        case tk::LEQ: *out = "LEQ"; break;
        case tk::GEQ: *out = "GEQ"; break;
        case tk::EQ: *out = "EQ"; break;
        case tk::IS: *out = "IS"; break;
        case tk::DOT: *out = "DOT"; break;
        case tk::COMMA: *out = "COMMA"; break;
        case tk::ID_VAR: *out = "ID_VAR"; break;
        case tk::ID_METHOD: *out = "ID_METHOD"; break;
        case tk::NUM: *out = "NUM"; break;
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
