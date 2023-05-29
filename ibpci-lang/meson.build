project('ibpci', 'cpp', default_options : ['cpp_std=c++17'], version: '0.1.0')

gtest_proj = subproject('gtest')
gtest_dep = gtest_proj.get_variable('gtest_dep')
gmock_dep = gtest_proj.get_variable('gmock_dep')

ibpci_include_dir = include_directories('src/ibpci/include', 'src/include')
ibpci_sources = [
  'src/ibpci.cpp',
  'src/ibpci/src/activation_record.cpp',
  'src/ibpci/src/ast.cpp',
  'src/ibpci/src/call_stack.cpp',
  'src/ibpci/src/lexer.cpp',
  'src/ibpci/src/parser.cpp',
  'src/ibpci/src/reference.cpp',
  'src/ibpci/src/runtime.cpp',
  'src/ibpci/src/token.cpp',
  'src/main.cpp',
]


# Define the target executable
executable('ibpci',
           ibpci_sources,
           include_directories: ibpci_include_dir,
        )

# TESTS
# tests_src = files('src/trie.cpp', 'src/tests/test_trie.cpp')
# tests = executable('tests', test_sources,
#            include_directories: incldir,
#            dependencies: [
#                 gtest_dep,
#                 gmock_dep,
#             ])

# test('gtest tests', tests)
