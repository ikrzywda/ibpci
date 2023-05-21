#ifndef REFERENCE_HPP
#define REFERENCE_HPP

#include <iostream>
#include <string>
#include <vector>

#include "AST.hpp"
#include "Token.hpp"

namespace rf {

typedef std::vector<unsigned> size;

class Reference {
 private:
 public:
  // contents
  int type;
  size s;
  tk::Token token;
  std::vector<tk::Token *> adt;
  // methods
  Reference(Reference *ref);
  Reference(double value);
  Reference(std::string value);
  Reference(tk::Token *t);
  Reference(int id);
  Reference(ast::AST *root);
  Reference() = default;
  ~Reference();
  void set_value(ast::AST *terminal);
  void set_value(tk::Token *terminal);
  void set_value(Reference *ref);
  void mutate_array(unsigned address, rf::Reference *terminal);
  tk::Token *get_array_element(unsigned address);
  tk::Token *get_token();
  int get_type();
  void push_contents(rf::Reference *element);
  void push_zero();
  void push_dimension(unsigned d);
  Reference *pop();
  Reference *dequeue();
  void print();
  int id_to_ref_id(int id);
};

}  // namespace rf

#endif
