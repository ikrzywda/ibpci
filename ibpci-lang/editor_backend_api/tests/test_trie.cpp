#include <gtest/gtest.h>

#include "../text_service/trie.hpp"

class TrieFixture : public ::testing::Test {
 protected:
  Trie::Node* root = new Trie::Node();

  void SetUp() override {
    Trie::insert_node(root, "apple");
    Trie::insert_node(root, "banana");
    Trie::insert_node(root, "car");
    Trie::insert_node(root, "cat");
    Trie::insert_node(root, "dog");
  }
};

TEST_F(TrieFixture, SearchExistingWord) {
  Trie::Node* result = Trie::get_prefix_node(root, "banana");
  EXPECT_NE(result, nullptr);
  result = Trie::get_prefix_node(root, "car");
  EXPECT_NE(result, nullptr);
  result = Trie::get_prefix_node(root, "dog");
  EXPECT_NE(result, nullptr);
}

TEST_F(TrieFixture, SearchNonExistingWord) {
  Trie::Node* result = Trie::get_prefix_node(root, "grape");
  EXPECT_EQ(result, nullptr);
  result = Trie::get_prefix_node(root, "elephant");
  EXPECT_EQ(result, nullptr);
}

TEST_F(TrieFixture, DeleteExistingWord) {
  bool deleted = Trie::delete_node(root, "car");
  EXPECT_TRUE(deleted);
  Trie::Node* result = Trie::get_prefix_node(root, "car");
  EXPECT_EQ(result, nullptr);
}

TEST_F(TrieFixture, DeleteNonExistingWord) {
  bool deleted = Trie::delete_node(root, "elephant");
  EXPECT_TRUE(deleted);
}

TEST_F(TrieFixture, InsertNewWord) {
  bool inserted = Trie::insert_node(root, "grape");
  EXPECT_TRUE(inserted);
  Trie::Node* result = Trie::get_prefix_node(root, "grape");
  EXPECT_NE(result, nullptr);
}

TEST_F(TrieFixture, InsertExistingWord) {
  bool inserted = Trie::insert_node(root, "dog");
  EXPECT_TRUE(inserted);
}
