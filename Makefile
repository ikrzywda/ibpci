make:
	g++ -o ibpci -std=c++17 src/*.cpp

debug:
	g++ -o ibpci -std=c++17 -fsanitize=address src/*.cpp
