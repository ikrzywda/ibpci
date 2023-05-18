#include "include/Reference.hpp"

namespace rf {

Reference::Reference(Reference *ref) : token(ref->token) {
  s = ref->s;
  type = ref->type;
  for (auto &a : ref->adt) {
    adt.push_back(new tk::Token(a));
  }
}

Reference::Reference(double value) : token(value) { type = tk::NUM; }

Reference::Reference(std::string value) : token(value) { type = tk::STRING; }

Reference::Reference(tk::Token *t) : token(t) { type = t->id; }

Reference::Reference(int id) {
  s.push_back(0);
  type = id;
}

Reference::Reference(ast::AST *root) : token(&root->token) {
  type = root->token.id;
}

Reference::~Reference() {
  while (!adt.empty()) {
    delete adt.back();
    adt.pop_back();
  }
}

void Reference::set_value(ast::AST *terminal) {
  switch (terminal->id) {
    case ast::ARR:
      break;
    default:
      token = &terminal->token;
  }
}

void Reference::set_value(tk::Token *terminal) { token = terminal; }

void Reference::set_value(Reference *ref) {
  type = ref->type;
  s = ref->s;
  token = ref->token;
}

void Reference::mutate_array(unsigned address, rf::Reference *terminal) {
  delete adt[address];
  adt[address] = new tk::Token(terminal->token);
}

tk::Token *Reference::get_array_element(unsigned address) {
  return adt[address];
}

tk::Token *Reference::get_token() { return &token; }

int Reference::get_type() { return type; }

void Reference::push_contents(rf::Reference *element) {
  adt.push_back(new tk::Token(element->token));
  delete element;
}

void Reference::push_zero() { adt.push_back(new tk::Token(0.f)); }

void Reference::push_dimension(unsigned d) { s.push_back(d); }

Reference *Reference::pop() {
  Reference *out = new Reference(adt.front());
  s[0] -= 1;
  delete adt.front();
  adt.erase(adt.begin());
  return out;
}

Reference *Reference::dequeue() {
  Reference *out = new Reference(adt.back());
  s[0] -= 1;
  delete adt.back();
  adt.pop_back();
  return out;
}

void Reference::print() {
  if (s.size() == 0) {
    token.print();
  } else {
    for (auto &a : adt) {
      a->print();
      std::cout << " ";
    }
  }
}

}  // namespace rf
