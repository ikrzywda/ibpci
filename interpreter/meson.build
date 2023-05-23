project('myproject', 'cpp', default_options : ['cpp_std=c++17'])
incldir = include_directories('src/include')

# Define the target executable
executable('mytarget',
           ['src/main.cpp',
            'src/AST.cpp',
            'src/ActivationRecord.cpp',
            'src/CallStack.cpp',
            'src/Interpreter.cpp',
            'src/Lexer.cpp',
            'src/Parser.cpp',
            'src/Reference.cpp',
            'src/Token.cpp',
            'src/ibpci.cpp'],
           include_directories: incldir,
           dependencies: [
                dependency('jsoncpp'),
                dependency('libjsonrpccpp-common'),
                dependency('libjsonrpccpp-client'),
            ])
