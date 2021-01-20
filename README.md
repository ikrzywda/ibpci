# IBPCI - IB PseudoCode Interpreter
IBPCI is a simple interpreter made to be used by students and teachers to develop and practice pseudocode in IB CS program. It is not an ideal replication of the paper version as it maintains the syntax but it has more constraints than its paper counterpart. (see the [wiki](https://github.com/ikrzywda/ibpci/wiki) for details)

## Compiling
You need a C++14 compiler and optionally cmake.
### Using cmake
```shell
mkdir build
cd build
cmake ..
make
```
### Using g++
```
g++ -o ibpci -std=c++14 src/*.cpp 
```

## Features
  * code execution - IBPCC can execute pseudocode, see the [wiki](https://github.com/ikrzywda/ibpci/wiki) for details on grammar and scoping
  * error detection - IBPCC can detect and throw lexical, syntactic and run-time errors
  * outputting difference phases of interpretation - IBPCC allows for peeking under its hood hopefully to some educational merit:
      - token stream - output of lexical analysis
      - abstract syntax tree (AST) - output of parser
      - call stack - used during execution

## State of the project and goals
IBPCI is in its very early infancy plus a first time building an interpreter for me, so it is riddled with errors. Because I am making this project as my Internal Assessment for IB Computer Science, I cannot open it for other contributors, but as soon as this project gets assessed, I welcome the interested. Other goal than making a working interpreter is to make an unofficial standard. All of the grammar is based on two PDF's that only describe basic use cases. I would like this project to be a starting point for a unofficial standard that will describe all features of the language in detail and evolve with the IB CS curriculum. 
- [Pseudocode Agenda](https://ib.compscihub.net/wp-content/uploads/2015/04/IB-Pseudocode-rules-more.pdf)
- [Exam handout](https://ib.compscihub.net/wp-content/uploads/2015/04/IB-Pseudocode-rules.pdf)

## Goals for development
* ### Nearest future
  - getting rid of all bugs
  - passing arguments by reference
  - consistent error messages
  - syntax error output correct grammar
  - binary packages for Linux, Windows and MacOS
  
* ### IB Studio
  I would like for IBPCC to become a back-end for a bigger suite of educational tools used for teaching basic computer science concepts. Here are some of the rough ideas for features and development:
  * GUI build using Qt
  * text editor with syntax highlighting
  * live error detection
  * boolean algebra calculator
    - mini interpreter computing and displaying results
  * available as binary package on every platform 
