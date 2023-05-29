#include "autocomplete.hpp"

namespace Autocomplete {

bool get_suggestions(Trie::Node *root, std::string prefix, std::vector<std::string> &completion_list) {
  if (root == nullptr) {
    return false;
  }

  std::string current_token = prefix;
  for (auto const &node : root->children) {
    current_token.push_back(node.first);
    if (node.second->is_end) {
      completion_list.push_back(current_token);
    }
    get_suggestions(node.second, current_token, completion_list);
  }
  return true;
}

}
