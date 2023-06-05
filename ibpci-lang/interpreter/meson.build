project('interpreter', 'cpp')

cpp = meson.get_compiler('cpp')

# Compiler settings, include paths, and flags
cpp_args = ['-Iinclude']
cpp.set_include_directories(cpp_args)

# Source files
sources = [
  'include/ibpci.hpp',
  'src/ibpci.cpp',
  'src/main.cpp',
]

# Executable target
executable('interpreter', sources, dependencies: ibpci_lib)
