class BudgetSerializer < ActiveModel::Serializer
  attributes :agency_id, :agency_name, :agency_detail, :value
  include Rails.application.routes.url_helpers

  def agency_detail
    agency_url(year,object.agency_id)
  end

  def year
    y = object.budget_period.match("ADOPTED BUDGET FY(.*)")[1].to_i
    "20#{y}"
  end
end
