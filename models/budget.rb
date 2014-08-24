class Budget < ActiveRecord::Base
  self.table_name = "budgetbuddy.alladopted"
  paginates_per 50
end
