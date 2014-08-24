require File.expand_path('../boot', __FILE__)

# Pick the frameworks you want:
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
# require "action_mailer/railtie"
require "action_view/railtie"
# require "sprockets/railtie"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module BudgetBuddy
  class Application < Rails::Application
    config.generators do |g|
      g.test_framework :rspec
      g.view_specs false
      g.request_specs false
      g.routing_specs false
      g.factories false
      g.template_engine false
      g.helper false
      g.stylesheets false
      g.javascripts false
    end
    config.autoload_paths += %W(#{config.root}/lib)
    
    config.assets.append_path 'vendor/assets/components'

    # This needs to be set here because the named urls don't work from serializers if we set the host from the application controller
    Rails.application.routes.default_url_options[:host] = ENV["HOST"]

    # We don't want the default of everything that isn't js or css, because it pulls too many things in
    # config.assets.precompile.shift

    config.assets.initialize_on_precompile = false


    config.middleware.use Rack::Cors do
      allow do
        origins '*'
        resource '*', headers: :any, methods: [ :get, :post, :put, :delete, :options ]
      end
    end
  end
end
