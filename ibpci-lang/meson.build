project('ibpci', 'cpp', default_options : ['cpp_std=c++17'], version: '0.1.0')

gtest_proj = subproject('gtest')
gtest_dep = gtest_proj.get_variable('gtest_dep')
gmock_dep = gtest_proj.get_variable('gmock_dep')

ibpci_include_dir = include_directories('ibpci/include')
ibpci_sources = [
  'ibpci/src/activation_record.cpp',
  'ibpci/src/ast.cpp',
  'ibpci/src/call_stack.cpp',
  'ibpci/src/lexer.cpp',
  'ibpci/src/parser.cpp',
  'ibpci/src/reference.cpp',
  'ibpci/src/runtime.cpp',
  'ibpci/src/token.cpp',
]

ibpci_lib = library('ibpci', ibpci_sources, include_directories: ibpci_include_dir)

interpreter_include_dir = include_directories('interpreter/include')
interpreter_sources = [
    'interpreter/src/ibpci.cpp',
    'interpreter/src/main.cpp',
]
# Define the target executable
executable('ibpci-test', interpreter_sources, include_directories: interpreter_include_dir, link_with: ibpci_lib)

# TESTS
# tests_src = files('src/trie.cpp', 'src/tests/test_trie.cpp')
# tests = executable('tests', test_sources,
#            include_directories: incldir,
#            dependencies: [
#                 gtest_dep,
#                 gmock_dep,
#             ])

# test('gtest tests', tests)
