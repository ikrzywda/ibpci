
SOURCE = src/main.cpp src/Token.cpp src/IBPCI.cpp src/Lexer.cpp

debug:
	clang++ -o ibpci -fsanitize=address -std=c++17 $(SOURCE)

prod:
	clang++ -o build/ibpci -std=c++17 src/*.cpp
