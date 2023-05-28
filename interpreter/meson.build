project('myproject', 'cpp', default_options : ['cpp_std=c++17'], version: '0.1.0')

gtest_proj = subproject('gtest')
gtest_dep = gtest_proj.get_variable('gtest_dep')
gmock_dep = gtest_proj.get_variable('gmock_dep')


incldir = include_directories('src/include')
sources = files('src/main.cpp',
                'src/AST.cpp',
                'src/ActivationRecord.cpp',
                'src/CallStack.cpp',
                'src/Interpreter.cpp',
                'src/Lexer.cpp',
                'src/Parser.cpp',
                'src/Reference.cpp',
                'src/Token.cpp',
                'src/ibpci.cpp',
                'src/trie.cpp')
test_sources = files(
    'src/AST.cpp',
    'src/ActivationRecord.cpp',
    'src/CallStack.cpp',
    'src/Interpreter.cpp',
    'src/Lexer.cpp',
    'src/Parser.cpp',
    'src/Reference.cpp',
    'src/Token.cpp',
    'src/trie.cpp',
    'src/autocomplete.cpp',
    'src/tests/run_all.cpp',
    'src/tests/test_trie.cpp',
    'src/tests/test_autocomplete.cpp')

# Define the target executable
executable('ibpci',
           sources, 
           include_directories: incldir,
        )

tests_src = files('src/trie.cpp', 'src/tests/test_trie.cpp')
tests = executable('tests', test_sources,
           include_directories: incldir,
           dependencies: [
                gtest_dep,
                gmock_dep,
            ])

test('gtest tests', tests)
