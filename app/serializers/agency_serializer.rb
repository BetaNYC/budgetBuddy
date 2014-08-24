class AgencySerializer < ActiveModel::Serializer
  attributes :agency_id, :agency_name, :unit_of_appropriation_name, :unit_of_appropriation_id, :uoa_detail
  include Rails.application.routes.url_helpers

  def uoa_detail
    uoa_url(year,object.agency_id,object.unit_of_appropriation_id)
  end

  def year
    y = object.budget_period.match("ADOPTED BUDGET FY(.*)")[1].to_i
    "20#{y}"
  end

end
