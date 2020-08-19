#include <fstream>
#include <iostream>

#ifndef PARSER_H
#define PARSER_H

class Parser{
	public:
		Parser(char* filename);
		void expr();
	private:
		char* filename;
		unsigned long pos;
		int lookahead;
		char get_next_char();
		void term();
		void match(int c);
};

#endif
