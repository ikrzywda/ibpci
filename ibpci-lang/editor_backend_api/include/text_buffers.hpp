#ifndef TEXT_BUFFERS_HPP
#define TEXT_BUFFERS_HPP

#include <memory>
#include <parser.hpp>
#include <string>
#include <token.hpp>
#include <vector>

#include "autocomplete.hpp"
#include "trie.hpp"

class TextBuffers {
  std::unique_ptr<Trie::Node> text_trie;
  std::string text_buffer;

 public:
  TextBuffers();
  bool insert_new_token(std::string token);
  bool delete_token(std::string token);
  bool update_text_buffer(std::string text);
  std::string run_parser();
  std::vector<std::string> get_suggestions(std::string prefix);
};

#endif
