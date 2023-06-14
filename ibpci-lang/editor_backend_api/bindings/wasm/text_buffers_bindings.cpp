#include <emscripten/bind.h>

#include <iostream>
#include <memory>
#include <parser.hpp>
#include <string>
#include <vector>

#include "../../include/text_buffers.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(StringVector) {
  register_vector<std::string>("StringVector");
}

EMSCRIPTEN_BINDINGS(TextBuffersWrapper) {
  class_<TextBuffers>("TextBuffers")
      .constructor()
      .function("insertNewToken", &TextBuffers::insert_new_token)
      .function("deleteToken", &TextBuffers::delete_token)
      .function("updateTextBuffer", &TextBuffers::update_text_buffer)
      .function("runParser", &TextBuffers::run_parser)
      .function("getSuggestions", &TextBuffers::get_suggestions);
}
