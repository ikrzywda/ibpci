#ifndef AUTOCOMPLETE_IBPCI_HPP
#define AUTOCOMPLETE_IBPCI_HPP

#include <string>
#include <vector>
#include "trie.hpp"
#include "Token.hpp"

namespace Autocomplete {
  bool get_suggestions(Trie::Node *root, std::string prefix, std::vector<std::string> &completion_list);
}


#endif
