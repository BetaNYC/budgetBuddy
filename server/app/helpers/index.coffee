fs = require 'fs'

# Recursively require a folder’s files
exports.autoload = autoload = (dir, app) ->
  fs.readdirSync(dir).forEach (file) ->
    path = "#{dir}/#{file}"
    stats = fs.lstatSync(path)

    # Go through the loop again if it is a directory
    if stats.isDirectory()
      autoload path, app
    else
      require(path)?(app)

# Return last item of an array
# ['a', 'b', 'c'].last() => 'c'
Array::last = ->
  this[this.length - 1]

# Capitalize a string
# string => String
String::capitalize = () ->
    this.replace /(?:^|\s)\S/g, (a) -> a.toUpperCase()

# Classify a string
# application_controller => ApplicationController
String::classify = (str) ->
  classified = []
  words = str.split('_')
  for word in words
    classified.push word.capitalize()

  classified.join('')

# Output a response
exports.output = (obj, rootElement, res, format)->
  # if obj has no elements then return a 404 error!
  if obj.length is 0
    res.send 404, "not found"
  else
    switch format
      when "json"
        res.type("application/json")
        res.send obj
      when "xml"
        xmlout        = require("easyxml")
        xmlout.configure
          manifest: true
          rootElement: rootElement
          objectRoot: "request"
        res.setHeader "Content-Type", "text/xml; charset=utf-8"
        res.send xmlout.render(obj)
      else
        res.send 404, ".xml or .json expected"