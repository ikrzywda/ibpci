#include "include/ibpci.hpp"

void throw_error(unsigned type, unsigned line_number, std::string message)
{
    std::string error;

    switch (type)
    {
        case LEXICAL_ERROR: 
        {
            error.append("Lexical Error at line ");
            break;
        }
        case PARSE_ERROR:
        {
            error.append("Parse Error at line ");
            break;
        }
        case RUN_TIME_ERROR:
        {
            error.append("Run-time Error at line ");
            break;
        }
    }

    error.append(std::to_string(line_number) + ": " + message);
    std::cout << error << std::endl;
    exit(1);
}

std::string get_buffer(char *filename)
{
    char c;
    std::string buffer;
    std::fstream file(filename);

    if(!file.good()){
        throw_error(FILE_NOT_FOUND, 0, 
                    "File \'" + std::string(filename) + "\' does not exist");
    }

    while(!file.eof()){
        file.get(c);
        buffer += c;
    }

    file.close();
    return buffer;
}

void interpret (char *filename, unsigned mode)
{
    std::string buffer = std::move(get_buffer(filename)); 

    switch (mode)
    {
        case INTERPRET:
        {
            run_interpreter(buffer, false);
            break;
        }
        case PRINT_TOKENS:
        {
            run_lexer(buffer);
            break;
        }
        case PRINT_AST:
        {   
            run_parser(buffer);
            break;
        }
        case PRINT_CALL_STACK:
        {
            run_interpreter(buffer, true);
            break;
        }
    }

}

void run_lexer(std::string buffer)
{
    lxr::Lexer lex(std::move(buffer));
    tk::Token token = lex.get_next_token();
    while(token.id != tk::END_FILE){
        std::cout << "line " << lex.line_num << ": ";
        tk::print_token(&token);
        token = lex.get_next_token();
    }
}

void run_parser(std::string buffer)
{
    prs::Parser parser(std::move(buffer)); 
    ast::AST *root = parser.parse();
    ast::print_tree(root, 0);
    ast::delete_tree(root);
}

void run_interpreter(std::string buffer, bool logging)
{
    prs::Parser parser(std::move(buffer)); 
    ast::AST *root = parser.parse();
    IBPCI::Interpreter ibpci(root, logging);
    ibpci.interpret();
}
