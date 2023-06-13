CXX := clang++
CXXFLAGS := -std=c++17

#Directory paths
API_DIR := $(CURDIR)
IBPCI_DIR := $(CURDIR)/../ibpci

#Source files
API_SOURCES := $(wildcard bindings/wasm/*.cpp) $(wildcard src/*.cpp)
INTERPRETER_SOURCES := $(wildcard src/*.cpp)

# Include directories
INCLUDE_DIRS := -Iinclude -I$(IBPCI_DIR)/include

# Library path and flags
LIB_PATH := -L$(IBPCI_DIR)
LIB := -libpci

# Output file
OUTPUT_FILE := interpreter

# Build target
api: $(API_SOURCES)
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -I$(IBPCI_DIR)/include $(LIB_PATH) -o $(OUTPUT_FILE) $^ $(LIB)


.PHONY: api
