var map;
var proj_4326 = new OpenLayers.Projection('EPSG:4326');
var longitude = 143.48981665651;
var latitude = 36.609377136228;
var defaultZoom = 6;
var endpoint = "http://www.sinsai.info/ushahidi/";
var report_submit_url = endpoint + "reports/submit";
var southwest ;
var northeast ;
var layout;
var offset = 0;
var limit = 100;
var tabs;
if(!$.support.opacity){
    limit = 10;
}

var comment_offset = 0;

var ushahidi;
var searchLayer = "検索結果";
var searchMaker = new OpenLayers.Layer.Markers(searchLayer);
var selectedPoint;
var preventRefresh = true;
var popup;

$.log = function(msg){
   //$("#debug").html(msg + "<br>" +  $("#debug").html());
}

//overide openlayers request class to opensocial-jquery

OpenLayers.Request.issue = function(config) {        
        // apply default config - proxy host may have changed
        var defaultConfig = OpenLayers.Util.extend(
            this.DEFAULT_CONFIG,
            {proxy: OpenLayers.ProxyHost}
        );
        config = OpenLayers.Util.applyDefaults(config, defaultConfig);

        // create request, open, and set headers
        var request = new OpenLayers.Request.XMLHttpRequest();
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
        request.open(
            config.method, url, config.async, config.user, config.password
        );
        for(var header in config.headers) {
            request.setRequestHeader(header, config.headers[header]);
        }

        var events = this.events;

        // we want to execute runCallbacks with "this" as the
        // execution scope
        var self = this;
        
        request.onreadystatechange = function() {
            if(request.readyState == OpenLayers.Request.XMLHttpRequest.DONE) {
                var proceed = events.triggerEvent(
                    "complete",
                    {request: request, config: config, requestUrl: url}
                );
                if(proceed !== false) {
                    self.runCallbacks(
                        {request: request, config: config, requestUrl: url}
                    );
                }
            }
        };
        
        // send request (optionally with data) and return
        // call in a timeout for asynchronous requests so the return is
        // available before readyState == 4 for cached docs
        if(config.async === false) {
            request.send(config.data);
        } else {
            window.setTimeout(function(){
                if (request._aborted !== true) {
                    request.send(config.data);
                }
            }, 0);
        }
        return request;
    };


function addPopup(place,incident){
            if(popup != null){
                popup.hide();
            }
            popup = new OpenLayers.Popup.FramedCloud("featurePopup",
                 place,
                 new OpenLayers.Size(200,200),
                 '<span class="date">['+  incident.incidentdate +']</span>' + incident.incidenttitle + '<a href="http://www.sinsai.info/ushahidi/reports/view/'+ incident.incidentid+'" target="blank">more..</a>',
                 null, true, null);
        preventRefresh = true;
        map.addPopup(popup,true);
        return popup;
}

function renderComments(data){
    if(data != null){
        var clone = $("#comments_template").clone();
        clone.attr("id","comments" + comment_offset);
        $("#comment_holder").append(clone);
        $('#comments' + offset).render({ comments: data }).show();
        $('.comment').removeClass('odd');
        $('.comment:odd').addClass('odd');
    }
}

function renderIncidents(data){

    if(data != null){
        $.log("Data in");
        searchMaker.clearMarkers();
        $.each(data,function(){ 
            var incident = this.incident;
            var place = ushahidi.lonlat4326(incident.locationlongitude,incident.locationlatitude);
            var icon = ushahidi.icon(ushahidi.catICON[this.categories[0].category.id]);
            var marker = new OpenLayers.Marker(place, icon);
            incident.categories = [];

            marker.events.register("mousedown", marker, function(){
                addPopup(place,incident);
            });
            searchMaker.addMarker(marker);
            $.each(this.categories,function(){
                incident.categories.push({url:ushahidi.catICON[this.category.id]});
            });
        });
        var clone = $("#incidents_template").clone();
        clone.attr("id","incidents" + offset);
        $.log(offset);
        $("#incident_holder").append(clone);
        $('#incidents' + offset).render({ incidents: data }).show();
        $('.incident').removeClass('odd');
        $('.incident:odd').addClass('odd');
        $(".incident").each(function () {
            var flip = 0;
            
            var data = {
                incidenttitle:$(".title",this).text(),
                incidentdate: $(".date",this).text(),
                incidentid:$(".id",this).text()
            };
            var title = $(".title",this).text();
            var date = $(".date",this).text();
            var place = ushahidi.lonlat4326($(".lon",this).text(),$(".lat",this).text());
   
            var popup;
            
            //for IE6
                $("img",this).each(function(){
                    $(this).attr("src",$(this).attr("src").replace(/http:\/\/(.+).googleusercontent.com\/gadgets\//,""));
                });
            $(".title",this).click(function(){
                if(flip++ % 2 == 0){
                   preventRefresh = true;
                    if(popup == null){
                        popup = addPopup(place,data);
                    }else{
                        popup.show();
                    }
                }else{
                    popup.hide();
                }
            });
        });
    }else{
        error("レポートはありませんでした");
    }
    $("body").unmask();
}

function refreshIncidents(){
    ushahidi.incidents({
        "sw":southwest,
        "ne":northeast,
        "keyword":$("#keyword").val(),
        "c":$("#catID").val() ? $("#catID").val()  : 0,
        "offset":offset
    },renderIncidents);
    saveHistory();
}

function refreshComments(){
    ushahidi.comments({
        "offset":comment_offset
    },renderComments);
}

function mapEvent(event) {
    var center = map.getCenter();
    var zoom = map.zoom;
    $("#zoom").val(zoom);
    ushahidi.lonlat2Address(center,function(address){
            $("#address").val(address);
            if(address){
                saveHistory();
            }
    });
    if(preventRefresh){
        preventRefresh = false;
        return;
    }
    
    var bound = map.getExtent().transform(map.getProjectionObject(),
        new OpenLayers.Projection("EPSG:4326"));
    southwest = bound .left+','+bound .bottom;
    northeast = bound.right+','+bound .top;
    offset = 0;
   $("#incident_holder").empty();
    refreshIncidents();
}

function message(msg){
  $.notifyBar({
    html: msg,
    close:true
  });
}



function error(msg){
  $.notifyBar({
    html: msg,
    cls: "error",
    close:true
  });
}



function initMap(){
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
        defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 10,
            'stopSingle': false,
            'stopDouble': false
        },

        initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend(
                {}, this.defaultHandlerOptions
            );
            OpenLayers.Control.prototype.initialize.apply(
                this, arguments
            ); 
            this.handler = new OpenLayers.Handler.Click(
                this, {
                    'click': this.trigger
                }, this.handlerOptions
            );
        }, 

        trigger: function(e) {
            var lonlat900913 = map.getLonLatFromViewPortPx(e.xy);
            var lonlat = ushahidi.lonlat900913(lonlat900913.lon,lonlat900913.lat);
            
            var link = "<a href='" + report_submit_url + "?lon=" +  lonlat.lon + "&lat=" +  lonlat.lat + "&zoom=" + map.zoom + "' target='_blank'>この地点にレポートを追加する</a>";
            message(link);
        }
    });
            
    map = new OpenLayers.Map({
        div: "map",
        allOverlays: false,
        eventListeners: {
            "moveend": mapEvent
            //"zoomend": mapEvent,
        },
        controls:[],
        projection: proj_900913,
        'displayProjection': proj_4326
    });

    var osm = new OpenLayers.Layer.OSM("地図 (by OSM)");
    var virtualearth_hybrid = new OpenLayers.Layer.VirtualEarth("地図&衛星写真 (by Bing)", { 
 type: VEMapStyle.Hybrid,
 sphericalMercator: true,
 maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)});
    var google_hybrid = new OpenLayers.Layer.Google("地図&衛星写真  (by Google Map)", { 
 type: G_HYBRID_MAP,
 sphericalMercator: true,
 maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)});
    var google_hybrid = new OpenLayers.Layer.Google("地図&衛星写真  (by Google Map)", { 
 type: G_HYBRID_MAP,
 sphericalMercator: true,
 maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34)});
 
    var kml = new OpenLayers.Layer.Vector("福島原発からの距離", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTPOpenSocial({
                url: "http://www.sinsai.info/ushahidi/media/uploads/1300166973fukushima2.kml",
                format: new OpenLayers.Format.KML({
                    extractStyles: true, 
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
        });

    var takidasi = new OpenLayers.Layer.Vector("炊き出しマップ", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTPOpenSocial({
                url: "http://maps.google.co.jp/maps/ms?hl=ja&ie=UTF8&brcurrent=3,0x5f8a281688bb7435:0x5a71ac24ed513392,1,0x5f8a2815e538e245:0xb1632cc050d2f733&t=h&msa=0&output=nl&msid=216614052816461214939.00049e49594f07450fe63",
                format: new OpenLayers.Format.KML({
                    extractStyles: true, 
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
        });

    map.addLayers([osm,virtualearth_hybrid,google_hybrid,kml,takidasi]);
    map.addControl(new OpenLayers.Control.LargeLayerSwitcher());
    map.addControl(new OpenLayers.Control.Navigation());
    map.addControl(new OpenLayers.Control.PanZoomBar());
    map.addControl(new OpenLayers.Control.ScaleLine());
    map.zoomToMaxExtent();
    var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();
    map.addLayer(searchMaker);
   // var lonlat = ushahidi.lonlat4326(longitude,latitude);
   // map.setCenter(lonlat, defaultZoom);
}

function search(){
        $("body").mask("読み込み中...");
        ushahidi.address2Lonlat($("#address").val(),function(lonlat){
            if(lonlat == null){
                 //$("body").unmask();
                 //error("住所の読み込みに失敗しました");
                //return;
                lonlat = map.getCenter();
            }
            var center = map.getCenter();
            var newCenter = ushahidi.lonlat(lonlat.lon,lonlat.lat);
            if(center.lat == newCenter.lat && center.lon == newCenter.lon && $("#zoom").val() == map.zoom){
                 offset = 0;
                 refreshIncidents();
            }
            map.setCenter(ushahidi.lonlat(lonlat.lon,lonlat.lat), $("#zoom").val());
           
        });
}

function initForm(){
    //set up form    
    $("#zoom").val(defaultZoom);
    var selectCategory = function(catID,radio){
        radio.click(function(){
            $("#categoryfield label").removeClass("selected");
            radio.addClass("selected");
            $("#catID").val(catID);
            search();
        });
    }
    
    ushahidi.category(function(json){
        var index = 2;
        var radio = $('<label class="selected"><img src="http://www.sinsai.info/ushahidi/media/img/all.png" alt="すべて"/>全て</label><br style="clear:both;"/>');
        $("#catID").val(0);
        selectCategory(0,radio);
        $("#categoryfield").append(radio);
        $.each(json,function(){
            var radio = $('<label><img src="' + this.category.image_thumb + '" alt="' + this.category.title + '"/>'+this.category.title+'</label><br style="clear:both;"/>');
            selectCategory(this.category.id,radio);
            $("#categoryfield").append(radio);
            index++;
            ushahidi.catICON[this.category.id] = this.category.image_thumb;
        });
        
        $(".category").addClass("ui-corner-all");
    });
    
    $("#search").submit(function(){
        $("#zoom").val(13);
        search();
        return false;
    });
    
    $("#more_incident_button").click(function(){
        $("body").mask("読み込み中...");
        offset += limit;
        refreshIncidents();
        
    });
    
    $("#more_comment_button").click(function(){
        comment_offset += limit;
        refreshComments();
    });
    refreshComments();
}

function initLayout(){
    //set up layout
    var north_size = 80;

    
    layout = $('body').layout({
        applyDefaultStyles: true,
        resizable:  true,
        slidable: true,
        north__size:$(window).width() < 500 ? 150 : 80,
        south__size:50,
        west__size:140,
        east__size:$(window).width() < 500 ? Math.floor($(window).width()) /1.2 : Math.floor($(window).width()) /2
    });



    tabs = $( "#tabs" ).tabs();
    $(".ui-layout-center").tabs().find(".ui-tabs-nav").sortable({ axis: 'x', zIndex: 2 })
    $(".ui-layout-center").removeClass("ui-corner-all");
    $(".ui-layout-center").css("padding","0px");
    $(".ui-layout-center").css("overflow-x","hidden");
    $(".ui-layout-south").css("background-color","#A8A8A8");
    
    layout.addPinBtn( "#pinWest", "west" );
	layout.addPinBtn( "#pinEast", "east" )
    
    layout.resizeAll();
    
    if($(window).width() < 500){
        layout.close("west");
        layout.close("east");
        $(window).adjustHeight();
    }
}

function loadHistory(){
    $.getData('/appdata/@viewer/@self', {}, function(data) {
        $.each(data, function(userId, data) {
            $.log($.toJSON(data));
            if( data.address == null ){
                message("住所を入力してください");
            }
            $("#address").val(data.address);
            $("#keyword").val(data.keyword ? data.keyword : "");
            $("#catID").val([data.c]);
            $("#zoom").val(data.zoom);
            search();
        });
    });
}

function saveHistory(){
    var data = {
        "sw":southwest,
        "ne":northeast
    };
    if($("#address").val()){
        data.address =  $("#address").val()
    }
    if($("#zoom").val()){
        data.zoom =  $("#zoom").val()
    }
    if($("#catID").val()){
        data.c = $("#catID").val();
    }
    if($("#keyword").val()){
        data.keyword = $("#keyword").val();
    }
    $.post('/appdata/@viewer/@self', data, function() {}, 'data');
}


