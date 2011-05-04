/* Copyright (c) 2006-2010 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Events.js
 */

/**
 * Namespace: OpenLayers.RequestOpenSocial 
 * The OpenLayers.Request namespace contains convenience methods for working
 */
OpenLayers.RequestOpenSocial = {
    
    /**
     * Constant: DEFAULT_CONFIG
     * {Object} Default configuration for all requests.
     */
    DEFAULT_CONFIG: {
        method: "GET",
        url: window.location.href,
        async: true,
        user: undefined,
        password: undefined,
        params: null,
        proxy: OpenLayers.ProxyHost,
        headers: {},
        data: null,
        callback: function() {},
        success: null,
        failure: null,
        scope: null
    },
    
    /**
     * APIProperty: events
     * {<OpenLayers.Events>} An events object that handles all 
     *     events on the {<OpenLayers.Request>} object.
     *
     * All event listeners will receive an event object with three properties:
     * request - {<OpenLayers.Request.XMLHttpRequest>} The request object.
     * config - {Object} The config object sent to the specific request method.
     * requestUrl - {String} The request url.
     * 
     * Supported event types:
     * complete - Triggered when we have a response from the request, if a
     *     listener returns false, no further response processing will take
     *     place.
     * success - Triggered when the HTTP response has a success code (200-299).
     * failure - Triggered when the HTTP response does not have a success code.
     */
    events: new OpenLayers.Events(this, null, ["complete", "success", "failure"]),
    
    /**
     * APIMethod: issue
     * Create a new XMLHttpRequest object, open it, set any headers, bind
     *     a callback to done state, and send any data.  It is recommended that
     *     you use one <GET>, <POST>, <PUT>, <DELETE>, <OPTIONS>, or <HEAD>.
     *     This method is only documented to provide detail on the configuration
     *     options available to all request methods.
     *
     * Parameters:
     * config - {Object} Object containing properties for configuring the
     *     request.  Allowed configuration properties are described below.
     *     This object is modified and should not be reused.
     *
     * Allowed config properties:
     * method - {String} One of GET, POST, PUT, DELETE, HEAD, or
     *     OPTIONS.  Default is GET.
     * url - {String} URL for the request.
     * async - {Boolean} Open an asynchronous request.  Default is true.
     * user - {String} User for relevant authentication scheme.  Set
     *     to null to clear current user.
     * password - {String} Password for relevant authentication scheme.
     *     Set to null to clear current password.
     * proxy - {String} Optional proxy.  Defaults to
     *     <OpenLayers.ProxyHost>.
     * params - {Object} Any key:value pairs to be appended to the
     *     url as a query string.  Assumes url doesn't already include a query
     *     string or hash.  Typically, this is only appropriate for <GET>
     *     requests where the query string will be appended to the url.
     *     Parameter values that are arrays will be
     *     concatenated with a comma (note that this goes against form-encoding)
     *     as is done with <OpenLayers.Util.getParameterString>.
     * headers - {Object} Object with header:value pairs to be set on
     *     the request.
     * data - {String | Document} Optional data to send with the request.
     *     Typically, this is only used with <POST> and <PUT> requests.
     *     Make sure to provide the appropriate "Content-Type" header for your
     *     data.  For <POST> and <PUT> requests, the content type defaults to
     *     "application-xml".  If your data is a different content type, or
     *     if you are using a different HTTP method, set the "Content-Type"
     *     header to match your data type.
     * callback - {Function} Function to call when request is done.
     *     To determine if the request failed, check request.status (200
     *     indicates success).
     * success - {Function} Optional function to call if request status is in
     *     the 200s.  This will be called in addition to callback above and
     *     would typically only be used as an alternative.
     * failure - {Function} Optional function to call if request status is not
     *     in the 200s.  This will be called in addition to callback above and
     *     would typically only be used as an alternative.
     * scope - {Object} If callback is a public method on some object,
     *     set the scope to that object.
     *
     * Returns:
     * {XMLHttpRequest} Request object.  To abort the request before a response
     *     is received, call abort() on the request object.
     */
    issue: function(config) {        
        // apply default config - proxy host may have changed
        var defaultConfig = OpenLayers.Util.extend(
            this.DEFAULT_CONFIG,
            {proxy: OpenLayers.ProxyHost}
        );
        config = OpenLayers.Util.applyDefaults(config, defaultConfig);

        // create request, open, and set headers
        var url = config.url;
        if(config.params) {
            var paramString = OpenLayers.Util.getParameterString(config.params);
            if(paramString.length > 0) {
                var separator = (url.indexOf('?') > -1) ? '&' : '?';
                url += separator + paramString;
            }
        }
        if(config.proxy && (url.indexOf("http") == 0)) {
            if(typeof config.proxy == "function") {
                url = config.proxy(url);
            } else {
                url = config.proxy + encodeURIComponent(url);
            }
        }

        request = $.ajax({
            url: url,
            type:config.method,
            async:config.async,
            data:config.data,
            success: function(data, status) {
              config.success ? config.success(data, status) : config.callback(data, status) ;
            },
            error: function(xhr, status, e) {
              config.error ? config.error(xhr, status, e) : config.callback(xhr, status, ea) ;
            }
        });
        return request;
    },
    
    /**
     * APIMethod: GET
     * Send an HTTP GET request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to GET.
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.
     *     This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    GET: function(config) {
        config = OpenLayers.Util.extend(config, {method: "GET"});
        return OpenLayers.RequestOpenSocial.issue(config);
    },
    
    /**
     * APIMethod: POST
     * Send a POST request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to POST and "Content-Type" header set to "application/xml".
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.  The
     *     default "Content-Type" header will be set to "application-xml" if
     *     none is provided.  This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    POST: function(config) {
        config = OpenLayers.Util.extend(config, {method: "POST"});
        // set content type to application/xml if it isn't already set
        config.headers = config.headers ? config.headers : {};
        if(!("CONTENT-TYPE" in OpenLayers.Util.upperCaseObject(config.headers))) {
            config.headers["Content-Type"] = "application/xml";
        }
        return OpenLayers.RequestOpenSocial.issue(config);
    },
    
    /**
     * APIMethod: PUT
     * Send an HTTP PUT request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to PUT and "Content-Type" header set to "application/xml".
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.  The
     *     default "Content-Type" header will be set to "application-xml" if
     *     none is provided.  This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    PUT: function(config) {
        config = OpenLayers.Util.extend(config, {method: "PUT"});
        // set content type to application/xml if it isn't already set
        config.headers = config.headers ? config.headers : {};
        if(!("CONTENT-TYPE" in OpenLayers.Util.upperCaseObject(config.headers))) {
            config.headers["Content-Type"] = "application/xml";
        }
        return OpenLayers.RequestOpenSocial.issue(config);
    },
    
    /**
     * APIMethod: DELETE
     * Send an HTTP DELETE request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to DELETE.
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.
     *     This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    DELETE: function(config) {
        config = OpenLayers.Util.extend(config, {method: "DELETE"});
        return OpenLayers.RequestOpenSocial.issue(config);
    },
  
    /**
     * APIMethod: HEAD
     * Send an HTTP HEAD request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to HEAD.
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.
     *     This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    HEAD: function(config) {
        config = OpenLayers.Util.extend(config, {method: "HEAD"});
        return OpenLayers.RequestOpenSocial.issue(config);
    },
    
    /**
     * APIMethod: OPTIONS
     * Send an HTTP OPTIONS request.  Additional configuration properties are
     *     documented in the <issue> method, with the method property set
     *     to OPTIONS.
     *
     * Parameters:
     * config - {Object} Object with properties for configuring the request.
     *     See the <issue> method for documentation of allowed properties.
     *     This object is modified and should not be reused.
     * 
     * Returns:
     * {XMLHttpRequest} Request object.
     */
    OPTIONS: function(config) {
        config = OpenLayers.Util.extend(config, {method: "OPTIONS"});
        return OpenLayers.RequestOpenSocial.issue(config);
    }

};

/**
 * @requires OpenLayers/Protocol.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Filter/Spatial.js
 * @requires OpenLayers/Filter/Comparison.js
 * @requires OpenLayers/Filter/Logical.js
 * @requires OpenLayers/Request/XMLHttpRequest.js
 */

/**
 * Class: OpenLayers.Protocol.HTTPOpenSocial
 * A basic HTTP protocol for vector layers.  Create a new instance with the
 *     <OpenLayers.Protocol.HTTPOpenSocial> constructor.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol>
 */

OpenLayers.Protocol.HTTPOpenSocial = OpenLayers.Class(OpenLayers.Protocol.HTTP, {
    /**
     * APIMethod: read
     * Construct a request for reading new features.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Valid options:
     * url - {String} Url for the request.
     * params - {Object} Parameters to get serialized as a query string.
     * headers - {Object} Headers to be set on the request.
     * filter - {<OpenLayers.Filter>} Filter to get serialized as a
     *     query string.
     * readWithPOST - {Boolean} If the request should be done with POST.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} A response object, whose "priv" property
     *     references the HTTP request, this object is also passed to the
     *     callback function when the request completes, its "features" property
     *     is then populated with the the features received from the server.
     */
    read: function(options) {
        var self = this;
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = OpenLayers.Util.applyDefaults(options, this.options);
        options.params = OpenLayers.Util.applyDefaults(
            options.params, this.options.params);
        if(options.filter) {
            options.params = this.filterToParams(
                options.filter, options.params);
        }
        var readWithPOST = (options.readWithPOST !== undefined) ?
                           options.readWithPOST : this.readWithPOST;
        var resp = new OpenLayers.Protocol.Response({requestType: "read"});
        if(readWithPOST) {
            resp.priv = OpenLayers.RequestOpenSocial.POST({
                url: options.url,
                callback: function(data, status) {
                    resp.features = self.format.read(data);
                    resp.code = OpenLayers.Protocol.Response.SUCCESS;
                    options.callback.call(options.scope, resp);
                },
                data: OpenLayers.Util.getParameterString(options.params),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        } else {
            resp.priv = OpenLayers.RequestOpenSocial.GET({
                url: options.url,
                callback: function(data, status) {
                    resp.features = self.format.read(data);
                    resp.code = OpenLayers.Protocol.Response.SUCCESS;
                    options.callback.call(options.scope, resp);
                },
                params: options.params,
                headers: options.headers
            });
        }
        return resp;
    }
});

