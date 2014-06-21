_       = require("underscore")
moment  = require("moment")
request = require("request")
JSONStream = require("JSONStream")
es      = require("event-stream")
module.exports = (app) ->
  class app.Socrata
    constructor: (res, req)->
      @res = res
      @req = req
      @basePath = "/resource/erm2-nwe9.json"

    fetchData: (requestOptions)->
      format  = @req.params.format
      out     = @res
      counter = 0
      # Streams data as it arrives. Fast.
      request(requestOptions)
        .pipe(JSONStream.parse("*"))
        .pipe(JSONStream.stringify())
        .pipe(es.mapSync((data)->
          adapter   = new app.Open311Adapter(data)
          ret       = ""
          counter++
          if counter is 1
            # Set the response type as first order of business.
            switch format
              when "json"
                out.type("application/json")
              when "xml"
                out.type("text/xml; charset=utf-8")

          switch format
            when "json"
              adapter.toJSON()
            when "xml"
              adapter.toXML()

        )).pipe(out)

    callWith: (requestOptions)->
      if @_noIdsGiven and requestOptions is null
        # Return early
        @res.send 404
        return
      else
        # Proceed to fetch the data.
        @fetchData requestOptions

    buildRequest: (ids=[], opts={})->
      @_noIdsGiven      = ids.length is 0

      single_quoted_ids = _.map ids, (id)-> "'#{id}'"
      unique_keyed_ids  = _.map single_quoted_ids, (id)->"unique_key=#{id}"
      joined_keys       = unique_keyed_ids.join(' OR ')

      params            = if @_noIdsGiven
                            @_parseOpts(opts)
                          else joined_keys

      encoded_params    = encodeURI(params)

      if params
        query           = "$where=" + encoded_params
        path            = "#{@basePath}?#{query}"
        @_request(path)
      else
        null


    #### Private #####
    _parseOpts: (opts)->
      return "" unless opts
      sql_opts  =  _.map opts, (value, key)=>
                      switch key
                        when "service_code", "status"
                          "#{key} IS #{value}"
                        when "start_date", "end_date"
                          @_parseDates(key, value, opts)
      sql_opts  = _.uniq(sql_opts)
      joined_opts   = sql_opts.join(" AND ")

    _parseDates: (key, value, opts)->
      start_date = opts['start_date']
      end_date   = opts['end_date']
      if !end_date
        end_date   = moment(start_date)
          .add("days", 90)
          .format("YYYY-MM-DDT00:00:00")+"Z"
      else if !start_date
        start_date = moment(end_date)
          .subtract("days", 90)
          .format("YYYY-MM-DDT00:00:00")+"Z"
      else
        # TODO: make sure the dates are 90 days apart from each other
      "created_date >= '#{start_date}' AND created_date <= '#{end_date}'"

    _request: (path)->
      hostname = "data.cityofnewyork.us"
      {
        port: 80
        uri: "http://#{hostname}#{path}"
        method: "GET"
      }

