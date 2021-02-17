cmake_minimum_required(VERSION 2.10)

project(ibpci)
file(GLOB SOURCES "src/*.cpp")
add_executable(ibpcc ${SOURCES})
