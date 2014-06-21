_   = require("underscore")
_s  = require('underscore.string')

module.exports = (app) ->
  class app.Open311Adapter
    constructor: (responseBody)->
      @response = _s.trim responseBody

    # Transform Socrata data into Open311 JSON
    # @returns {String}
    toJSON: ->
      head = (/^\[/).test(@response)
      middle = (/^,/).test(@response)
      if head
        obj = JSON.parse(@response.slice(1))
        @response = "[" + JSON.stringify(@_buildObj(obj))
      else if middle
        obj = JSON.parse(@response.slice(1))
        @response = "," + JSON.stringify(@_buildObj(obj))
      @response

    # Transform Socrata data into Open311 XML
    # @returns {String}
    toXML: (rootElement="service_requests")->
      xmlout = require("easyxml")
      xmlout.configure
        manifest: false
        rootElement: "request"

      head = (/^\[/).test(@response)
      middle = (/^,/).test(@response)
      if head
        obj = JSON.parse(@response.slice(1))
        manifest  = "<?xml version='1.0' encoding='utf-8'?>"
        @response = "#{manifest}\n<#{rootElement}>\n" + xmlout.render(@_buildObj(obj))
      else if middle
        obj = JSON.parse(@response.slice(1))
        @response = xmlout.render(@_buildObj(obj))
      else
        @response = "</#{rootElement}>"
      @response

    _buildObj: (obj)->
      address = @_formatAddress(obj)
      {
        service_request_id: obj.unique_key
        status: obj.status.toLowerCase()
        status_notes: null
        service_name: obj.complaint_type + ": " + obj.descriptor
        service_code: null
        description: obj.complaint_type + ": " + obj.descriptor
        agency_responsible: obj.agency_name
        service_notice: null
        requested_datetime: obj.created_date #ISO 8601
        updated_datetime: obj.resolution_action_updated_date or null
        expected_datetime: obj.due_date or null
        address: address
        address_id: null
        zipcode: obj.incident_zip or null
        lat: obj.latitude or null
        long: obj.longitude or null #quoted because long is a JS type
        media_url: null
      }

    _formatAddress: (obj)->
      address = undefined
      switch obj.address_type
        when "ADDRESS"
          address = obj.incident_address + " " + obj.city + " NY"
        when "INTERSECTION"
          address = obj.intersection_street_1 + " @ " + obj.intersection_street_2 + ", " + obj.borough + " NY"
        when "PLACENAME"
          address = null #TODO
        else
          address = null
      address
