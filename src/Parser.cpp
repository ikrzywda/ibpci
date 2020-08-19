#include "Parser.h"
#include <fstream>
#include <iostream>

Parser::Parser(char* filename){
	Parser::filename = filename;
	pos = 0;
	lookahead = get_next_char();
}

char Parser::get_next_char(){
	char c;
	std::ifstream f;
	f.open(filename);
	f.seekg(pos);
	f >> c;
	pos = f.tellg();
	f.close();
	return c;
}

void Parser::expr(){
	term();
	while(true){
		if(lookahead == '+'){
			match('+');
			term();
			std::cout << '+'; 
		}else if(lookahead == '-'){
			match('-');
			term();
			std::cout << '-';
		}else{
			break;
		}
	}
}

void Parser::term(){
	if(isdigit((char)lookahead)){
		std::cout << (char)lookahead;
		match(lookahead);
	}
}

void Parser::match(int c){
	if(lookahead == c){
		lookahead = get_next_char();
	}else{
		std::cout << "syntax error";
	}
}
