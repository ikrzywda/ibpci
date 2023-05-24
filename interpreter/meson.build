project('myproject', 'cpp', default_options : ['cpp_std=c++17'], version: '0.1.0')

gtest_proj = subproject('gtest')
gtest_dep = gtest_proj.get_variable('gtest_dep')
gmock_dep = gtest_proj.get_variable('gmock_dep')


incldir = include_directories('src/include')

# Define the target executable
executable('ibpci',
           ['src/main.cpp',
            'src/AST.cpp',
            'src/ActivationRecord.cpp',
            'src/CallStack.cpp',
            'src/Interpreter.cpp',
            'src/Lexer.cpp',
            'src/Parser.cpp',
            'src/Reference.cpp',
            'src/Token.cpp',
            'src/ibpci.cpp',
            'src/trie.cpp'],
           include_directories: incldir,
           dependencies: [
                gtest_dep,
                gmock_dep,
                # dependency('libjsonrpccpp-common'),
                # dependency('libjsonrpccpp-client'),
                # subproject('jsoncpp').get_variable('jsoncpp_dep'),
            ]
        )

tests_src = files('src/trie.cpp', 'src/tests/test_trie.cpp')
tests = executable('tests', tests_src,
           include_directories: incldir,
           dependencies: [
                gtest_dep,
                gmock_dep,
                # dependency('libjsonrpccpp-common'),
                # dependency('libjsonrpccpp-client'),
                # subproject('jsoncpp').get_variable('jsoncpp_dep'),
            ])
test('gtest tests', tests)
