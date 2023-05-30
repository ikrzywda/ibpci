#include <gtest/gtest.h>
#include <memory>

#include "../include/autocomplete.hpp"
#include "../include/trie.hpp"


class AutocompleteFixture : public ::testing::Test {
  protected:
    std::unique_ptr<Trie::Node> root = std::make_unique<Trie::Node>();
    std::vector<std::string> word_list = {"apple", "banana", "car", "cat", "dog", "applepie"};

    void SetUp() override {
      for (auto word : word_list) {
        Trie::insert_node(root.get(), word);
      }
    }
};

TEST_F(AutocompleteFixture, AutocompletePrefixFinding) {
  std::string prefix = "app";
  std::vector<std::string> suggestions_list;
  Trie::Node *prefix_root = Trie::get_prefix_node(root.get(), prefix);

  bool result = Autocomplete::get_suggestions(prefix_root, prefix, suggestions_list);
  std::cerr << "Suggestions for prefix: " << prefix << std::endl;
  EXPECT_TRUE(result);
  EXPECT_TRUE(suggestions_list.size() == 2);
  for (auto suggesion : suggestions_list) {
    std::cerr << suggesion << std::endl;
    bool is_substr = suggesion.find(prefix) != std::string::npos;
    EXPECT_TRUE(is_substr);
  }
}
