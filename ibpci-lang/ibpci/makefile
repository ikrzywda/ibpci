CXX := clang++
WASMXX := em++
CXXFLAGS := -std=c++17 -Iinclude
LIB := libibpci.a
WASM_LIB := libibpciwasm.a

#Source files
SOURCES := $(wildcard src/*.cpp)
OBJECTS := $(patsubst src/%.cpp, obj/%.o, $(SOURCES))
WASM_OBJECTS := $(patsubst src/%.cpp, obj/wasm/%.o, $(SOURCES))

# Directory paths
INCLUDE_DIR := include
OBJ_DIR := obj
WASM_OBJ_DIR := obj/wasm

# Build rules
all: $(LIB) $(WASM_LIB)

$(LIB): $(OBJECTS)
	ar rcs $@ $^

$(WASM_LIB): $(WASM_OBJECTS)
	emar rcs $@ $^

$(OBJ_DIR)/%.o: src/%.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@ -I$(INCLUDE_DIR)

$(WASM_OBJ_DIR)/%.o: src/%.cpp
	$(WASMXX) $(CXXFLAGS) -c $< -o $@ -I$(INCLUDE_DIR)

clean:
	rm -f $(LIB) $(OBJECTS) $(WASM_LIB) $(WASM_OBJECTS)

.PHONY: all clean
