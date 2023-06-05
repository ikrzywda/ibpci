#include "../include/trie.hpp"

namespace Trie {

bool insert_node(Node *node, std::string token) {
  Node *current_node = node;
  for (auto c : token) {
    if (current_node->children.find(c) == current_node->children.end()) {
      current_node->children[c] = new Node();
    }
    current_node = current_node->children[c];
  }
  current_node->is_end = true;
  return true;
}

bool delete_node(Node *node, std::string token) {
  if (token == "") {
    node->is_end = false;
    return true;
  }
  char key = token[0];
  if (node->children.find(key) == node->children.end()) {
    return true;
  }
  Node *current_node = node->children[key];
  if (delete_node(current_node, token.substr(1)) && !current_node->is_end) {
    node->children.erase(key);
    delete current_node;
    return true;
  }
  return false;
}

Node *get_prefix_node(Node *node, std::string token) {
  Node *current_node = node;
  if (token == "") {
    return current_node->is_end ? current_node : nullptr;
  }

  for (auto c : token) {
    if (current_node->children.find(c) == current_node->children.end()) {
      return nullptr;
    }
    current_node = current_node->children[c];
  }
  return current_node;
}

}  // namespace Trie
