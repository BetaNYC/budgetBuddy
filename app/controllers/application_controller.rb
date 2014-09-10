class ApplicationController < ActionController::Base
  def default_url_options
    {:host => ENV["HOST"]}
  end
end
