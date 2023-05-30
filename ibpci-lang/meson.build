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

editor_backend_api_include_dir = include_directories('editor_backend_api/include')
editor_backend_api_sources = [
    'editor_backend_api/src/trie.cpp',
    'editor_backend_api/src/text_buffers.cpp',
    'editor_backend_api/src/autocomplete.cpp',
]

editor_backend_api_lib = library('editor_backend_api', editor_backend_api_sources, include_directories: editor_backend_api_include_dir)

tests_sources = [
  'editor_backend_api/tests/test_trie.cpp',
  'editor_backend_api/tests/test_autocomplete.cpp',
  'editor_backend_api/tests/run_all.cpp'
] + editor_backend_api_sources

tests = executable('editor_backend_tests', tests_sources,
           include_directories: editor_backend_api_include_dir,
           dependencies: [
                gtest_dep,
                gmock_dep,
            ])

test('gtest editor_backend_tests', tests)


# EDITOR

