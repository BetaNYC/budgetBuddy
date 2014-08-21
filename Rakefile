
task :fetch_data  do
  `rm -rf data && git clone git@github.com:BetaNYC/budgetBuddyData.git data`
end

task :unzip_data  do
  `unzip data/processed/alladopted.csv.zip && mv alladopted* data/processed`
end

task :prepare_postgres  do
  `data/bin/csv2postgres.sh $(pwd)/data/processed/alladopted.csv`
end

task :start do
  system "shotgun config.ru -p 3000 --server=thin"
end

task :setup_dev => [:fetch_data, :unzip_data, :prepare_postgres]

task :default => :start
