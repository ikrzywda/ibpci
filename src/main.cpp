#include "Parser.h"
#include <fstream>
#include <iostream>

#include "Parser.h"
#include <iostream>

int main(int argc, char** argv){
	Parser parse(argv[1]);
	parse.expr();
	return 1;
}
