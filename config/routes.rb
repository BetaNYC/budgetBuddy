Rails.application.routes.draw do
  scope "/api/v1" do
    controller :v1 do
      get '/year/:year/budget/op' => :budget
      get '/year/:year/budget/op/agency/:agency' => :agency, as: :agency
      get '/year/:year/budget/op/agency/:agency/uoa/:uoa' => :unit_of_appropriation, as: :uoa
    end
  end

  # root to: "pages#home"
end
