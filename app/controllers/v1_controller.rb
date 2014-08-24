class V1Controller < ApplicationController
  include Pager
  include Swagger::Docs::ImpotentMethods

  swagger_controller :V1, "Budget year"

  swagger_api :budget do
    summary "All budget items in a year"
    notes "only 2014 available for now"
    param :path, :year, :integer, :required, "Budget year"
    param :query, :page, :integer, :optional, "Page number"
  end
  def budget
    statement = %Q{
      SELECT agency_id, agency_name, budget_period
      FROM  budgetbuddy.alladopted
      WHERE budget_period = 'ADOPTED BUDGET FY#{year}'
        AND inc_dec is null
        AND key = 'AMOUNT'
      ORDER BY value DESC
      LIMIT #{limit}
      OFFSET #{offset}
    }

    Adopted.cache do
      results = Adopted.find_by_sql(statement)
      render json: ActiveModel::ArraySerializer.new(results, each_serializer: BudgetSerializer)
    end
  end

  swagger_api :agency do
    summary "Agency summary"
    notes "only 2014 available for now"
    param :path, :year, :integer, :required, "Budget year"
    param :path, :agency, :string, :required, "Agency number"
    param :query, :page, :integer, :optional, "Page number"
  end
  def agency
    statement = %Q{
      SELECT agency_id, agency_name, budget_period, unit_of_appropriation_name, unit_of_appropriation_id, value
      FROM  budgetbuddy.alladopted
      WHERE budget_period = 'ADOPTED BUDGET FY#{year}'
        AND inc_dec is null
        AND agency_id = #{params[:agency]}
        AND key = 'AMOUNT'
      ORDER BY value DESC
      LIMIT #{limit}
      OFFSET #{offset}
    }

    Adopted.cache do
      results = Adopted.find_by_sql(statement)
      render json: ActiveModel::ArraySerializer.new(results, each_serializer: AgencySerializer)
    end
  end

  swagger_api :unit_of_appropriation do
    summary "Unit of appropriation summary"
    notes "only 2014 available for now"
    param :path, :year, :integer, :required, "Budget year"
    param :path, :agency, :string, :required, "Agency number"
    param :path, :uoa, :string, :required, "Unit of appropriation number"
    param :query, :page, :integer, :optional, "Page number"
  end
  def unit_of_appropriation
    statement = %Q{
      SELECT agency_id, agency_name, budget_period, unit_of_appropriation_name, unit_of_appropriation_id, responsibility_center_name, responsibility_center_id, value
      FROM budgetbuddy.alladopted
      WHERE  budget_period = 'ADOPTED BUDGET FY#{year}'
        AND  inc_dec is null
        AND  agency_id = #{params[:agency]}
        AND  unit_of_appropriation_id = #{params[:uoa]}
        AND  key = 'AMOUNT'
      ORDER BY value DESC
      LIMIT #{limit}
      OFFSET #{offset}
    }

    Adopted.cache do
      results = Adopted.find_by_sql(statement)
      render json: ActiveModel::ArraySerializer.new(results, each_serializer: UOASerializer)
    end
  end


  private

  def default_serializer_options
    {
      # totalCount: object.count,
      # page: object.page,
      # totalPages: object.total_pages,
      # results: object
    }
  end


  # Support for Swagger complex types:
  # https://github.com/wordnik/swagger-core/wiki/Datatypes#wiki-complex-types
  swagger_model :Adopted do
    description "Adopted Budget Item object."
    property :agency_id, :integer, :required, "Describe attribute"
    property :agency_name, :text, :required, "Describe attribute"
    property :unit_of_appropriation_id, :integer, :required, "Describe attribute"
    property :unit_of_appropriation_name, :text, :required, "Describe attribute"
    property :responsibility_center_id, :text, :required, "Describe attribute"
    property :responsibility_center_name, :text, :required, "Describe attribute"
    property :budget_code_id, :text, :required, "Describe attribute"
    property :budget_code_name, :text, :required, "Describe attribute"
    property :object_class, :text, :required, "Describe attribute"
    property :ic_ref, :text, :required, "Describe attribute"
    property :obj, :text, :required, "Describe attribute"
    property :description, :text, :required, "Describe attribute"
    property :budget_period, :text, :required, "Describe attribute"
    property :inc_dec, :text, :required, "Describe attribute"
    property :key, :text, :required, "Describe attribute"
    property :value, :text, :required, "Describe attribute"
    property :file_name, :text, :required, "Describe attribute"
    property :source_line, :text, :required, "Describe attribute"
    property :id, :integer, :required, "Describe attribute"
  end


end
