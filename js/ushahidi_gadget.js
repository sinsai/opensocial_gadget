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
    UshahidiAPI = function(){
        return this;
    };
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
    
    UshahidiAPI.prototype = {
        zoomLevel:zoomLevel,
        lonlat4326:function(lon,lat){
            return new OpenLayers.LonLat(lon,lat).transform(proj_4326,map.getProjectionObject());
        },
        category :function(callback){
            var API = setting.endpoint + 'api?task=categories';
            $.getJSON(API, {}, function(json) {
                callback(json.payload.categories);
            });
        },
        //incidentsByBounds = function(lonlat,sw,ne,keyword,catID,offset,callback){
        incidents: function(options,callback){
            var defaults = {
                task:"incidents",
                by:"bounds",
                orderfield:"incidentdate",
                limit:setting.limit,
                offset:0
            };
            var data = $.extend(defaults, options);
            var API = setting.endpoint  +"api" ;
            $.getJSON(API, data, function(json,status) {
                $.log($.toJSON(json));
                callback(json.payload.incidents,offset);
            });
        },
        lonlat2Address:function(lonlat,callback){
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
         },
         address2Lonlat:function(address,callback){
            var API =  'http://www.geocoding.jp/api/?q=' + encodeURI(address);
            $.get(API, {}, function(xml) {
                callback(self.lonlat4326($(xml).find("lng").text(),$(xml).find("lat").text()));
            });
        },
        zoom2Distance:function(zoom){
            return self.zoomLevel[zoom];
        },
        zoom2DistanceLabel:function(zoom){
            return zoomLevel[zoom] > 1000 ? Math.floor(zoomLevel[zoom]/1000) + "km" : zoomLevel[zoom] + "m";
        },
        catICON:{},
        lonlat:function(lon,lat){
            return new OpenLayers.LonLat(lon,lat);
        },
        icon:function(url){
            var sz = new OpenLayers.Size(21, 25);
            var calculateOffset = function(size) {
                return new OpenLayers.Pixel(-(size.w/2), -size.h);
            };
            return new OpenLayers.Icon(url, sz, null, calculateOffset);
        }
    };
    return new UshahidiAPI();
};

