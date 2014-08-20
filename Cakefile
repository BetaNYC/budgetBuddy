{spawn, exec} = require 'child_process'

task 'fetch_data', 'fetch data from repo', ->
  shell 'rm -rf data && git clone git@github.com:BetaNYC/budgetBuddyData.git data'
  shell "cake unzip_data"

task 'unzip_data', 'unzip data', ->
  shell 'unzip data/processed/alladopted.csv.zip && mv alladopted* data/processed'

task 'prepare_postgres', 'prepare postgres', ->
  shell 'python data/bin/csv2postgres.sh $(pwd)/data/processed/alladopted.csv'

task 'test', 'run tests', ->
  shell 'NODE_ENV=test ./node_modules/.bin/mocha'


###
* Execute a shell command
* @param {String}   command
* @param {Function} callback
###

shell = (command, callback=null) ->
  exec command, (err, stdout, stderr) ->
    console.log trimStdout if trimStdout = stdout.trim()
    console.log stderr.trim() if err
    callback() if callback

