project('your_project', 'cpp')

# Compiler settings
cpp = meson.get_compiler('cpp')
cpp_args = ['-Iinclude']

# API source files
api_sources = [
  'bindings/wasm/text_buffers_bindings.cpp',
  'include/autocomplete.hpp',
  'include/text_buffers.hpp',
  'include/trie.hpp',
  'src/autocomplete.cpp',
  'src/text_buffers.cpp',
  'src/trie.cpp',
  'main.cpp',
]

# API target
api_target = executable('api', api_sources, include_directories: 'include')

# Include the sibling directory
ibpci_dir = join_paths(meson.project_build_root(), '..', 'ibpci')

# ibpci library
ibpci_lib = meson.get_compiler('cpp').find_library('ibpci', dirs: ibpci_dir)

# Link the API with ibpci library
api_target.link_with(ibpci_lib)

# Link the API with ibpci library
api_target.link_with(ibpci_lib)

# Output the API executable or JavaScript file
if meson.is_cross_build()
  configure_file(output: 'api.js', input: api_target)
else
  executable('api', api_sources, include_directories: 'include')
endif
