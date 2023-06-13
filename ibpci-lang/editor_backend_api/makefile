CXX := em++
CXXFLAGS := --bind -s ENVIRONMENT=web -s MODULARIZE=1 -s SINGLE_FILE=1 -s "EXPORTED_FUNCTIONS=['_malloc', '_free']" -s "EXPORT_NAME='ibpci'"

#Directory paths
API_DIR := $(CURDIR)
IBPCI_DIR := $(CURDIR)/../ibpci

#Source files
API_SOURCES := $(wildcard bindings/wasm/*.cpp) $(wildcard src/*.cpp)

# Include directories
INCLUDE_DIRS := -Ibindings/wasm -Iinclude -I$(IBPCI_DIR)/include

# Library path and flags
LIB_PATH := -L$(IBPCI_DIR)
LIB := -libpci

# Output file
OUTPUT_FILE := wrapper.js

# Build target
api: $(API_SOURCES)
	$(CXX) $(CXXFLAGS) $(INCLUDE_DIRS) -I$(IBPCI_DIR)/include $(LIB_PATH) -o $(OUTPUT_FILE) $^ $(LIB)


.PHONY: api
