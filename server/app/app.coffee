express = require 'express'
http = require 'http'
partials = require 'express-partials'
app = express()
swagger = require('swagger-jack')
yaml = require('js-yaml')

# Boot setup
require("#{__dirname}/../config/boot")(app)

configureSwagger = (env)->
  basePath = if env is "production"
                'http://open311.herokuapp.com'
              else
                'http://localhost:3000'
  descriptor = {apiVersion: '1.0', basePath: basePath}
  resources = [{
      api: require("#{__dirname}/../schema/requests.yml")
      controller: app.RequestsController
    }]
  app.use(swagger.generator(app, descriptor, resources))
  app.use(swagger.validator(app))
  app.use(swagger.errorHandler())

# Configuration
app.configure ->
  port = process.env.PORT || 3000
  if process.argv.indexOf('-p') >= 0
    port = process.argv[process.argv.indexOf('-p') + 1]

  app.set 'port', port
  app.use express.static("#{__dirname}/../public")
  app.use express.favicon()
  app.use express.logger('dev')
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use partials()
  app.use require('connect-assets')(src: "#{__dirname}/assets")
  app.use app.router
  configureSwagger(app.currentEnv)


app.configure 'development', ->
  app.use express.errorHandler()

# Routes
require("#{__dirname}/routes")(app)

# Server
http.createServer(app).listen app.get('port'), ->
  console.log "Express server listening on port #{app.get 'port'} in #{app.settings.env} mode"
