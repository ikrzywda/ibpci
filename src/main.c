#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>

#define NUM 0x00
#define PLUS 0x01
#define MINUS 0x02

typedef struct token{
	int val;
	int type;
}token;

int isnumber(char* str){
	int i = 0;
	char c;
	while((c = *(str + i++)) != '\0'){
		if(c < '0' || c > '9')
			return 0;
	}
	return 1;
}

token* tokenize(char* in){
	token *tk = malloc(sizeof(token));
	if(isnumber(in)){
		tk ->val = atoi(in);
		tk->type = NUM;
	} else if(*in == '+'){
		tk->val = '+';
		tk->type = PLUS;
	} else if(*in == '-'){
		tk->val = '-';
		tk->type = MINUS;
	} else {
		printf("errno 1: invalid type");
		exit(EXIT_FAILURE);	
	}
	return tk;
}

void store_token(token tk, token* tk_buf){
	
}

void read_file(char* filename, token* tokenBuffer){
	FILE* fp = fopen(filename,"r");
	char* in = malloc(sizeof(char) * 10);
	int c, i = 0;
	printf("Hello read_file");
	while((c = getc(fp)) != EOF){
		if(c == ' ' || c == '\n'){
			tokenize(in);
			printf("%s\n",in);
			printf("<%d,%d>\n", tokenize(in) -> type, tokenize(in) -> val);
			memset(in,0,i);
			i = 0;
		} else {
			*(in + i++) = c;	
		}
	}
	
}

int main(){
	token* tokenBuffer = malloc(sizeof(token));
	token** tk_ptr;
	read_file("test.ib", tokenBuffer);
}


