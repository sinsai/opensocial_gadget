/*
 * jQuery Ushahidi API Library 0.0.1
 * http://sinsai.info
 *
 * Copyright 2011, Nachi Ueno <nati.ueno@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
 
var proj_4326 = new OpenLayers.Projection('EPSG:4326');
var proj_900913 = new OpenLayers.Projection('EPSG:900913');
var markerRadius = 4;
var markerOpacity = "0.8";

$.ushahidi = function(options) {
    var defaults = {
        'endpoint':'', //EndPoint of ushahidi API,
        
        'limit':300,
    };
    var setting = $.extend(defaults, options);
    var ushahidiAPI = function(){
        return this;
    };
    
    var self = new ushahidiAPI();
    var zoomLevel = {17 : 20,
		       16 : 100,
		       15 : 200,
		       14 : 500,
		       13 : 1000,
		       12 : 2000,
		       11 : 5000,
		       10 : 10000,
		       9 : 20000,
		       8 : 50000,
		       7 : 100000,
		       6 : 200000};
		       
		       
    ushahidiAPI.prototype.zoomLevel = zoomLevel;
    ushahidiAPI.prototype.lonlat4326 = function(lon,lat){
        return new OpenLayers.LonLat(lon,lat).transform(proj_4326, map.getProjectionObject());
    }
    
    ushahidiAPI.prototype.allIncidents = function(callback){
        var API = setting.endpoint + 'api?task=incidents&by=all&limit=' + setting.limit;
        $.getJSON(API, {}, function(json) {
            callback(json.payload.incidents);
        });
    }
    
    ushahidiAPI.prototype.category = function(callback){
        var API = setting.endpoint + 'api?task=categories';
        $.getJSON(API, {}, function(json) {
            callback(json.payload.categories);
        });
    }
    
    ushahidiAPI.prototype.incidentsByLonLat = function(lonlat,distance,callback){
        var lonlat = lonlat.transform(map.getProjectionObject(),proj_4326);
        var API = setting.endpoint + 'api?task=incidents&by=dist&orderfield=incidentdate&limit=' + setting.limit + "&distance=" + lonlat.lon + "," + lonlat.lat + "," + distance;
        $.getJSON(API, {}, function(json) {
            callback(json.payload.incidents);
        });
    }
    
    ushahidiAPI.prototype.incidentsByKeyword = function(lonlat,distance,keyword,catID,callback){
        if(!catID){
            catID = 0;
        }
        if(!keyword){
            keyword = "";
        }else{
            keyword  = encodeURI(keyword);
        }
        var lonlat = lonlat.transform(map.getProjectionObject(),proj_4326);
        var API = setting.endpoint + 'api?task=incidents&by=keyword&orderfield=incidentdate&limit=' + setting.limit + "&distance=" + lonlat.lon + "," + lonlat.lat + "," + distance + "&keyword=" + keyword + "&c=" + catID;
        $.log(API);
        $.getJSON(API, {}, function(json) {
            callback(json.payload.incidents);
        });
    }

    ushahidiAPI.prototype.lonlat2Address = function(lonlat,callback){
        var lonlat = lonlat.transform(map.getProjectionObject(),proj_4326);
        var API = 'http://www.finds.jp/ws/rgeocode.php?json&lat=' + lonlat.lat + '&lon=' + lonlat.lon;
        $.getJSON(API, {}, function(json) {
            var address = "";
            if(json.result){
                var result = json.result;
                if(result.prefecture && result.prefecture.pname){
                        address += result.prefecture.pname;
                }
                if(result.municipality && result.municipality.mname){
                        address += result.municipality.mname;
                }
                if(result.local && result.local.section){
                        address += result.local.section;
                }
            }
            callback(address);
        });
    }
    ushahidiAPI.prototype.address2Lonlat = function(address,callback){
        var API =  'http://www.geocoding.jp/api/?q=' + encodeURI(address);
        $.get(API, {}, function(xml) {
            callback(self.lonlat4326($(xml).find("lng").text(),$(xml).find("lat").text()));
        });
    }
    
	ushahidiAPI.prototype.addMarkers = function(catID,startDate,endDate, currZoom, currCenter,
			mediaType, thisLayerID, thisLayerType, thisLayerUrl, thisLayerColor)
		{
			return $.timeline({categoryId: catID,
			                   startTime: new Date(startDate * 1000),
			                   endTime: new Date(endDate * 1000),
							   mediaType: mediaType
							  }).addMarkers(
								startDate, endDate, map.getZoom(),
								map.getCenter(), thisLayerID, thisLayerType, 
								thisLayerUrl, thisLayerColor,setting.endpoint);
	}
    
    ushahidiAPI.prototype.zoom2Distance = function(zoom){
        return self.zoomLevel[zoom];
    }
    
    ushahidiAPI.prototype.zoom2DistanceLabel = function(zoom){
        return zoomLevel[zoom] > 1000 ? Math.floor(zoomLevel[zoom]/1000) + "km" : zoomLevel[zoom] + "m";
    }
    
    ushahidiAPI.prototype.catICON = {};
    
    ushahidiAPI.prototype.lonlat = function(lon,lat){
        return new OpenLayers.LonLat(lon,lat);
    }
    ushahidiAPI.prototype.icon = function(url){
       var sz = new OpenLayers.Size(21, 25);
       var calculateOffset = function(size) {
            return new OpenLayers.Pixel(-(size.w/2), -size.h);
       };
       return new OpenLayers.Icon(url, sz, null, calculateOffset);
    }
    return self;
};

OpenLayers.Layer.GMLOpenSocial = OpenLayers.Class(OpenLayers.Layer.GML, {
    loadGML: function() {
        var self = this;
        if (!this.loaded) {
            this.events.triggerEvent("loadstart");
            $.ajax({
                url: this.url,
                timeout: 20000, 
                success: function(doc) {
                        var options = {};
                        OpenLayers.Util.extend(options, self.formatOptions);
                        if (self.map && !self.projection.equals(self.map.getProjectionObject())) {
                            options.externalProjection = self.projection;
                            options.internalProjection = self.map.getProjectionObject();
                        }    
                        var gml = self.format ? new self.format(options) : new OpenLayers.Format.GML(options);
                        self.addFeatures(gml.read(doc));
                        self.events.triggerEvent("loadend");
                },
                error : this.requestFailure,
            });
            this.loaded = true;
        }    
    },
    requestFailure: function(XMLHttpRequest, textStatus, errorThrown) {
        this.events.triggerEvent("loadend");
    },

    CLASS_NAME: "OpenLayers.Layer.GMLOpenSocial"
});

