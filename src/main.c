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

token** tokenize(char* in, token** buffer){
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
	
	buffer = realloc(tk,sizeof(token));
	free(tk);
	return buffer;
}



void read_file(char* filename, token** buffer){
	FILE* fp = fopen(filename,"r");
	char* in = malloc(sizeof(char) * 10);
	int c, i = 0;
	while((c = getc(fp)) != EOF){
		if(c == ' ' || c == '\n'){
			tokenize(in,buffer);
			printf("%s\n",in);
			memset(in,0,i);
			i = 0;
		} else {
			*(in + i++) = c;	
		}
	}
	
}

int main(){
	token** buffer = NULL;
	read_file("test.ib", buffer);
	token (*tk_ptr)[];
	tk_ptr = &buffer;
	for(int i = 0; (*tk_ptr)[i] != NULL; ++i){
		
	}
}


