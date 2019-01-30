require 'pry'
require 'yaml'
VIDEO_FORMATS = ["mp4", "m4v"]

def generate_tree
  tree = YAML.load_file('tree_structure.yml')["level_0"]

  tree = parse_array(tree)
  binding.pry
  File.write('./source/testTree.js', tree)
  @decisions = []
  # parse_tree(tree)
end

def parse_array(tree)
  tree = tree.map do |node|
   "{ video: #{node[:video]}, decisions: #{node[:decisions] ? parse_array(node[:decisions]) : []}}"
  end
  return tree
end


def format_decision(decision)
  x = {}
  decision["decision"].map do |node|
    puts x
    if node["video"]
      x[:video] = node["video"]
    elsif node["condition"]
      x[:condition] = node["condition"]
    elsif node["decisions"]
      binding.pry
      x[:decisions] = node["decisions"] ? parse_tree(node["decisions"]) : []
    end
  end
  return x
end


def fetch_video_names
  Dir.entries("source/videos").select {|f| f.include?("mp4")}
end

generate_tree()

# binding.pry
