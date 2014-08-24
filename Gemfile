source 'https://rubygems.org'
ruby '2.1.1'

gem 'rails', '4.1.5'
gem 'rails-api'
gem 'spring', :group => :development
gem 'pg'
gem 'rack-cors'
gem 'rack-timeout'
gem 'active_model_serializers'
gem 'figaro'
gem 'swagger-docs'

group :development do
  gem 'better_errors', '>= 1.1.0'
  gem 'binding_of_caller', '>= 0.7.2' #, :platforms => [:mri_19, :rbx]
end

group :development, :test do
  gem "pry-rails"
end

group :production do
  gem "rails_12factor"
end
