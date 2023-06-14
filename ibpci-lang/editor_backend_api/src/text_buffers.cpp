#include "../include/text_buffers.hpp"

TextBuffers::TextBuffers() {
  text_trie = std::make_unique<Trie::Node>();
  for (auto &keyword : tk::RESERVED_KEYWORDS) {
    Trie::insert_node(text_trie.get(), keyword.first);
  }
}

bool TextBuffers::insert_new_token(std::string token) {
  return Trie::insert_node(text_trie.get(), token);
}

bool TextBuffers::delete_token(std::string token) {
  return Trie::delete_node(text_trie.get(), token);
}

bool TextBuffers::update_text_buffer(std::string text) {
  text_buffer = text;
  return true;
}

std::string TextBuffers::run_parser() {
  prs::Parser parser(text_buffer);
  ast::AST *ast = parser.parse();
  if (ast == nullptr) {
    return parser.get_error().message;
  }
  ast::delete_tree(ast);
  return "dupa";
}

std::vector<std::string> TextBuffers::get_suggestions(std::string prefix) {
  std::vector<std::string> suggestions_list;
  Trie::Node *prefix_root = Trie::get_prefix_node(text_trie.get(), prefix);
  bool result =
      Autocomplete::get_suggestions(prefix_root, prefix, suggestions_list);
  return suggestions_list;
}
