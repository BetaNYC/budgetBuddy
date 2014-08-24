require "grape"
require "pg"
require "grape/kaminari"
require "active_record"
require "yaml"
require "sinatra/base"
require 'grape-swagger'
require 'rack/cors'
require "rack-timeout"

use Rack::Timeout
Rack::Timeout.timeout = 15

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: [ :get, :post, :put, :delete, :options ]
  end
end

class Frontend < Sinatra::Base
  set :public_folder, Proc.new { File.join(root, "public") }
  root = ::File.dirname(__FILE__)
  set :root,  root

  get "/" do
    erb :home
  end
end


class API < ::Grape::API

  desc "Budget summary", nickname: "budgetSummary"
  params do
    optional :page, type: Integer, desc: "Page number"
    requires :year, type: Integer, desc: "Budget year (only 2014 available for now)."
  end

  desc "Agency summary", nickname: "agencySummary"
  params do
    optional :page, type: Integer, desc: "Page number"
    requires :year, type: Integer, desc: "Budget year (only 2014 available for now)."
    requires :agency, type: String, desc: "Agency number"
  end


  desc "Unit of appropriation summary", nickname: "agencySummary"
  params do
    optional :page, type: Integer, desc: "Page number"
    requires :year, type: Integer, desc: "Budget year (only 2014 available for now)."
    requires :agency, type: String, desc: "Agency number"
    requires :uoa, type: String, desc: "Unit of appropriation number"
  end

  add_swagger_documentation base_path: "/api", mount_path: "doc", hide_documentation_path: true, api_version: "v1"
end

run Rack::URLMap.new("/" => Frontend.new,  "/api" => API.new)
