#include "../include/autocomplete.hpp"

namespace Autocomplete {

bool get_suggestions(Trie::Node* root, std::string prefix, std::vector<std::string>& completion_list) {
  if (root == nullptr) {
    return false;
  }

  if (root->is_end) {
    completion_list.push_back(prefix);  // Add the complete word to the completion list
  }

  for (const auto& node : root->children) {
    std::string new_prefix = prefix + node.first;  // Update the prefix for the current child node
    get_suggestions(node.second, new_prefix, completion_list);
  }
  return true;
}


}
