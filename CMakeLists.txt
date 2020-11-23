cmake_minimum_required(VERSION 2.10)

project(ibpcc)
file(GLOB SOURCES "src/*.cpp")
add_executable(ibpcc ${SOURCES})
