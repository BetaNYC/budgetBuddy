class ApplicationController < ActionController::API
  def default_url_options
    {:host => ENV["HOST"]}
  end
end
