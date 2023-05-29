#ifndef TRIE_IBPCI_HPP
#define TRIE_IBPCI_HPP

#include <map>
#include <memory>
#include <string>

namespace Trie {

struct Node {
  std::map<char, Node *> children;
  bool is_end;

  Node() : is_end(false) {}
  ~Node() {
    for (auto &child : children) {
      delete child.second;
    }
  }
};

bool insert_node(Node *trie_node, std::string token);
bool delete_node(Node *trie_node, std::string token);
Node *get_prefix_node(Node *trie_node, std::string token);

}  // namespace Trie

#endif
