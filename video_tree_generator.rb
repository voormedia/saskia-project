require 'pry'
require 'yaml'

VIDEO_FORMATS = ["mp4", "m4v"]

def generate_tree
  tree = YAML.load_file('tree_structure.yml')["level_0"]
  @decisions = []
  parse_tree(tree)
end

def parse_tree(tree)
  tree.map do |node|
    tes = format_decision(node)
    binding.pry
  end
  binding.pry
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
