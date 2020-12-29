#ifndef SYMTAB_HPP
#define SYMTAB_HPP

#include "Token.hpp"
#include "AST.hpp"
#include <unordered_map>
#include <vector>
#include <string>
#include <memory>
#include <utility>

namespace sym{

enum types{
    INT, FLOAT, STRING,
    ARR_N, ARR_STR, STACK, 
    QUEUE, METHOD
};

class Base{
};

template<class T>
class Symbol : Base{
private:

public:
    Symbol(){}

    std::vector<unsigned> dimensions;
    std::vector<T> contents;

    void push_dimensions(unsigned d){
        dimensions.push_back(d);
    }

    void push_contents(T c){
        contents.push_back(c);
    }

    void print_symbol(){
        std::cout << "\nDIMENSIONS:\n";
        for (unsigned i = 0; i < dimensions.size(); ++i){
            std::cout << dimensions[i] << " ";
        }
        std::cout << "\n\nCONTENTS:\n";
        for (unsigned i = 0; i < contents.size(); ++i){
            std::cout << contents[i] << " ";
        }
    }
};

class Symtab{
private:
    std::string scope_name; 
    std::unordered_map<std::string, std::pair<int, std::unique_ptr<Base>>> table;
public:
    Symtab(std::string name);
    
    template<class T> 
    T lookup(std::string){
    }

    template<class T> 
    bool new_sym(std::string key, int type, std::unique_ptr<Symbol<T>> sym){
        if(table.insert(key, std::make_pair(type, sym))){
            return true;
        }else{
            return false;
        }
    }

    void print_table();
};

void test_table();

}

#endif
