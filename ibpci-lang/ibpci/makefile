CXX := clang++
CXXFLAGS := -std=c++17 -Iinclude
LIB := libibpci.a

#Source files
SOURCES := $(wildcard src/*.cpp)
OBJECTS := $(patsubst src/%.cpp, obj/%.o, $(SOURCES))

# Directory paths
INCLUDE_DIR := include
OBJ_DIR := obj

# Build rules
all: $(LIB)

$(LIB): $(OBJECTS)
	emar rcs $@ $^

$(OBJ_DIR)/%.o: src/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ -I$(INCLUDE_DIR)

clean:
	rm -f $(LIB) $(OBJECTS)

.PHONY: all clean
