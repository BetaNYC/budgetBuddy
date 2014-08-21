require "grape"
require "pg"
require "grape/kaminari"
require "active_record"
require "figaro"
require "yaml"





class API < ::Grape::API
  version 'v1', using: :path
  format :json
  include Grape::Kaminari

  cnf = YAML::load_file(File.join(File.dirname(File.expand_path(__FILE__)), 'config.yml'))[ENV['RACK_ENV']]

  ActiveRecord::Base.establish_connection(cnf['database'])


  perPage = 30

  get '/year/:year/budget/op/summary.:format' do
    year = params[:year].to_i - 2000
    page = params[:page] || 1
    statement = "select agency_id, agency_name, value  from budgetbuddy.alladopted  where  budget_period = 'ADOPTED BUDGET FY" + year.to_s + "' and  inc_dec is null and  key = 'AMOUNT'  group by agency_id, agency_name, value order by value DESC";

    results = ActiveRecord::Base.connection.execute(statement)
    res = Kaminari.paginate_array(results.to_a).page(page).per(perPage)
    res.map{|item| item['more'] = "#{cnf['host']}/v1/year/#{params[:year]}/budget/op/agency/#{item['agency_id']}/summary.json"}
    {
      totalCount: results.count,
      page: page,
      totalPages: res.total_pages,
      results: res
    }
  end

  get '/year/:year/budget/op/agency/:agency/summary.:format' do
    year = params[:year].to_i - 2000
    page = params[:page] || 1
    statement = "select unit_of_appropriation_name, unit_of_appropriation_id, value from budgetbuddy.alladopted where budget_period = 'ADOPTED BUDGET FY#{year}' and inc_dec is null and agency_id = #{params[:agency]} and key = 'AMOUNT' order by value DESC "

    results = ActiveRecord::Base.connection.execute(statement)
    res = Kaminari.paginate_array(results.to_a).page(page).per(perPage)
    {
      totalCount: results.count,
      page: page,
      totalPages: res.total_pages,
      results: res
    }
  end

  get '/year/:year/budget/op/agency/:agency/uoa/:uoa/summary.:format' do
    year = params[:year].to_i - 2000
    page = params[:page] || 1
    statement = "select responsibility_center_name, responsibility_center_id, value  from budgetbuddy.alladopted  where  budget_period = 'ADOPTED BUDGET FY#{year}' and  inc_dec is null and  agency_id = #{params[:agency]} and  unit_of_appropriation_id = #{params[:unitOfAppropriation]} and  key = 'AMOUNT' order by value DESC "

    results = ActiveRecord::Base.connection.execute(statement)
    res = Kaminari.paginate_array(results.to_a).page(page).per(perPage)
    {
      totalCount: results.count,
      page: page,
      totalPages: res.total_pages,
      results: res
    }
  end
end


run API
