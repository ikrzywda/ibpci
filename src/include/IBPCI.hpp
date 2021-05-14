#ifndef IBPCI_HPP
#define IBPCI_HPP

#include <string>
#include <fstream>
#include <iostream>

namespace IBPCI
{

bool file_exists(const char *filename);

struct RunTime
{
    const char *filename;
    std::string input_buffer; 
    unsigned long buffer_len;

    RunTime(const char *filepath);
};

}
#endif
