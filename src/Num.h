#ifndef NUM_H
#define NUM_H

#include "Token.h"
#include "Tag.h"

class Num : public Token{
	public:
		int val;
		explicit Num(int val);
};

#endif
