class V1Controller < ApplicationController

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

  def year
    params[:year].to_i - 2000
  end

  def limit
    if params[:all] == "true"
      "ALL"
    else
      30
    end
  end

  def offset
    return 0 if limit.respond_to?(:*)

    (params[:page] || 1).to_i * limit
  end

  def default_serializer_options
    {
      # totalCount: object.count,
      # page: object.page,
      # totalPages: object.total_pages,
      # results: object
    }
  end

end
