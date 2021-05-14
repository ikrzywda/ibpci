#include "include/Lexer.hpp"

bool IBPCI::is_upcase(char c)
{
    return (c >= 'A' && c <= 'Z') ? 1 : 0;
}

void IBPCI::Lexer::error()
{
    std::cout << "Unexpected character at line " 
              << line_num << ": '"
              << c << '\n';
    exit(1);
}

void IBPCI::Lexer::advance()
{
    if(pos < buffer_len - 1) { c = input_buffer.at(++pos); }
    else { c = '\0'; }
}

void IBPCI::Lexer::skip_whitespace()
{
    while(c == ' '
          || c == '\t'
          || c == '\v'
          || c == '\f') advance();
}


void IBPCI::Lexer::skip_comment()
{
    while(c != '\n') advance();
}

IBPCI::Token IBPCI::Lexer::number()
{
    bool is_int = true;
    std::string buffer;

    while(std::isdigit(c) 
          || (c == '.' && is_int))
    {
        if(c == '.') is_int = false;

        buffer.push_back(c);
        advance();
    }

    return Token{line_num, NUM, std::stod(buffer)};
}   

IBPCI::Token IBPCI::Lexer::id()
{
    bool is_variable = true;
    unsigned id;
    std::string buffer;


    while(std::isalnum(c) 
          || c == '_')
    {
        if(!is_upcase(c)) is_variable = false;

        buffer.push_back(c);
        advance();
    }

    if(!is_variable)
    {
        if((id = lookup_keyword(buffer)) < -1) { id = ID_METHOD; }
    }
    else { id = ID_VAR; }

    return Token{line_num, id, buffer};
}   

IBPCI::Token IBPCI::Lexer::string()
{
    advance();
    std::string buffer;

    while(c != '\"' && c != EOF)
    {
        buffer.push_back(c);
        advance();
    }

    advance();
    return Token{line_num, STR, buffer};
}

IBPCI::Token IBPCI::Lexer::op_eq(char ch)
{
    advance();

    if(c == '=')
    {
        switch(ch)
        {
            case '=': advance(); return Token{line_num, IS, "=="};
            case '<': advance(); return Token{line_num, LEQ, ">="};
            case '>': advance(); return Token{line_num, GEQ, "<="};
            case '!': advance(); return Token{line_num, DNEQ, "!="};
        }
    }
    else
    {
        switch(ch)
        {
            case '=': return Token{line_num, EQ, "="};
            case '<': return Token{line_num, LT, "<"};
            case '>': return Token{line_num, GT, ">"};
        }
    }

    return Token{0,0,0};
}

IBPCI::Token IBPCI::Lexer::get_next_token()
{
    c = input_buffer.at(pos);

    while(1)
    {
        skip_whitespace();

        if(std::isdigit(c)) { return number(); }
        else if(std::isalnum(c)) { return id(); }
        else
        {
            switch(c)
            {
                case '+': advance(); return Token{line_num, PLUS, "+"};
                case '-': advance(); return Token{line_num, MINUS, "-"}; 
                case '*': advance(); return Token{line_num, MULT, "*"};
                case '%': advance(); return Token{line_num, MOD, "%"};
                case '[': advance(); return Token{line_num, LSQBR, "["};
                case ']': advance(); return Token{line_num, RSQBR, "]"};
                case '(': advance(); return Token{line_num, LPAREN, "("};
                case ')': advance(); return Token{line_num, RPAREN, ")"};
                case '.': advance(); return Token{line_num, DOT, "."};
                case ',': advance(); return Token{line_num, COMMA, ","};
                case '\"': return string();
                case '=': return op_eq('=');
                case '>': return op_eq('>');
                case '<': return op_eq('<');
                case '!': return op_eq('!');
                case '/': 
                {
                    advance();
                    if(c == '/')
                    { 
                        skip_comment();
                        break;   
                    }
                    else { return Token{line_num, DIV_WOQ, "/"}; }
                }
                case '\n': advance(); ++line_num; break;
                case '\0': return Token{line_num, END_OF_FILE, "EOF"};
                default: error();
            }
        }
    }

    return Token{line_num, END_OF_FILE, "EOF"};
}

void IBPCI::Lexer::print_all_tokens()
{
    Token t;

    while((t = get_next_token()).ID != END_OF_FILE)
    {
        t.print();
    }
}
