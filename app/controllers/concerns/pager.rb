module Pager

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
end
