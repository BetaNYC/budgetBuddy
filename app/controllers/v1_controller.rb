class V1Controller < ApplicationController
  include Swagger::Docs::ImpotentMethods
  include Pager

  swagger_controller :V1, "Budget year"

  swagger_api :budget do
    summary "All budget items in a year"
    notes "only 2014 available for now"
    param :query, :page, :integer, :optional, "Page number"
    param :path, :year, :integer, :optional, "Budget year"
  end


  # Support for Swagger complex types:
  # https://github.com/wordnik/swagger-core/wiki/Datatypes#wiki-complex-types
  swagger_model :Adopted do
    description "Adopted Budget Item object."
    property :agency_id, :integer
    property :agency_name, :text
    property :unit_of_appropriation_id, :integer
    property :unit_of_appropriation_name, :text
    property :responsibility_center_id, :text
    property :responsibility_center_name, :text
    property :budget_code_id, :text
    property :budget_code_name, :text
    property :object_class, :text
    property :ic_ref, :text
    property :obj, :text
    property :description, :text
    property :budget_period, :text
    property :inc_dec, :text
    property :key, :text
    property :value, :text
    property :file_name, :text
    property :source_line, :text
    property :id, :integer
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

end
