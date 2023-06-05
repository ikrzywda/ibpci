project('ibpci', 'cpp')

cpp = meson.get_compiler('cpp')

# Compiler settings, include paths, and flags
cpp_args = ['-Iinclude']
cpp.set_include_directories(cpp_args)

# Source files
sources = [
  'include/activation_record.hpp',
  'include/ast.hpp',
  'include/call_stack.hpp',
  'include/lexer.hpp',
  'include/parser.hpp',
  'include/reference.hpp',
  'include/runtime.hpp',
  'include/token.hpp',
  'src/activation_record.cpp',
  'src/ast.cpp',
  'src/call_stack.cpp',
  'src/lexer.cpp',
  'src/parser.cpp',
  'src/reference.cpp',
  'src/runtime.cpp',
  'src/token.cpp',
]

# Library target
ibpci_lib = library('ibpci', sources)

# Export the library for other targets to use
install_headers('include/*.hpp', subdir: 'ibpci')
install_library(ibpci_lib)

project('gtest', 'cpp', version : '1.10.0', license : 'bsd')

subdir('googletest')

subdir('googlemock')
