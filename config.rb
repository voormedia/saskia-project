require 'sprockets/es6'
activate :sprockets do |s|
  s.supported_output_extensions << '.es6'
end

# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# Set specific Template Languages
set :haml, { :format => :html5 }

set :fonts_dir,  'fonts'

# Activate pry
activate :pry

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# Activate livereload
activate :livereload

::Rack::Mime::MIME_TYPES['.vtt'] = 'text/vtt'
