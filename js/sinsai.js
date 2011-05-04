var map;
var proj_4326 = new OpenLayers.Projection('EPSG:4326');
var longitude = 143.48981665651;
var latitude = 36.609377136228;
var defaultZoom = 6;
var endpoint = "http://nati.sinsai.info/ushahidi/";
var report_submit_url = endpoint + "reports/submit";
var southwest ;
var northeast ;
var offset = 0;
var limit = 50;
if(!$.support.opacity){
    limit = 10;
}

var ushahidi;
var searchLayer = "検索結果";
var searchMaker = new OpenLayers.Layer.Markers(searchLayer);
var selectedPoint;
var preventRefresh = true;
var popup;

$.log = function(msg){
   $("#debug").html(msg + "<br>" +  $("#debug").html());
}

//overide openlayers request class to opensocial-jquery

OpenLayers.Request.issue = function(config) {        
        // apply default config - proxy host may have changed
        $.log("READ!");
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
        $("#holder").append(clone);
        $('#incidents' + offset).render({ incidents: data }).show();
        $(".description").hide();
        $(".incident").each(function () {
            var flip = 0;
            var description = $(".description",this);
            var data = {
                incidenttitle:$(".title",this).text(),
                incidentdate: $(".date",this).text(),
                incidentid:$(".id",this).text()
            };
            var title = $(".title",this).text();
            var date = $(".date",this).text();
            var place = ushahidi.lonlat4326($(".lon",this).text(),$(".lat",this).text());
            var body = description.html() ;
            var popup;
            body = body.replace(/\r\n/g, "<br/>");
            body = body.replace(/(\n|\r)/g, "<br/>");
            description.html(body);
            //for IE6
                $("img",this).each(function(){
                    $(this).attr("src",$(this).attr("src").replace(/http:\/\/(.+).googleusercontent.com\/gadgets\//,""));
                });
            $(".title",this).click(function(){
                if(flip++ % 2 == 0){
                    description.show();
                   preventRefresh = true;
                    if(popup == null){
                        popup = addPopup(place,data);
                    }else{
                        popup.show();
                    }
                }else{
                    description.hide();
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
        "c":$("input[name=catID]:checked").val() ? $("input[name=catID]:checked").val()  : 0,
        "offset":offset
    },renderIncidents);
    saveHistory();
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
   $("#holder").empty();
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
        }
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
        })
 
    map.addLayers([osm,virtualearth_hybrid,google_hybrid,kml]);
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();
    var click = new OpenLayers.Control.Click();
    map.addControl(click);
    click.activate();
    $("#OpenLayers_Control_MaximizeDiv").append("<div style='color:black;'>地図の切り替え</div>");
    map.addLayer(searchMaker);
   // var lonlat = ushahidi.lonlat4326(longitude,latitude);
   // map.setCenter(lonlat, defaultZoom);
}

function search(){
        $("body").mask("読み込み中...");
        ushahidi.address2Lonlat($("#address").val(),function(lonlat){
            if(lonlat == null){
                 $("body").unmask();
                 error("住所の読み込みに失敗しました");
                return;
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
    var options = ""
    $.each(ushahidi.zoomLevel, function(key){
        var value = this;
        var selected = key == defaultZoom ? "selected" : "" ;
        options += "<option value='"+ key +"' " + selected +  " >" + ushahidi.zoom2DistanceLabel(key) + "</option>";
    });
    $("#zoom").append(options);
    //$("#zoom").val(defaultZoom);
    ushahidi.category(function(json){
        var index = 2;
        var num = Math.floor($(window).width()/180); //label width
        var radio = '<input type="radio" value="0" name="catID" id="0" /><label for="0" ><img src="http://www.sinsai.info/ushahidi/media/img/all.png" alt="すべて"/>全て</label>';
        $("#categoryfield").append(radio);
        $.each(json,function(){
            var radio = '<input type="radio" value="' + this.category.id + '" name="catID" id="'+ this.category.id +'" /><label for="'+ this.category.id +'" ><img src="' + this.category.image_thumb + '" alt="' + this.category.title + '"/>'+this.category.title+'</label>';
            $("#categoryfield").append(radio);
            if( index % num == 0 ){
                $("#categoryfield").append("<br style='clear:both;'/>");
            }
            index++;
            ushahidi.catICON[this.category.id] = this.category.image_thumb;
        });
        
        $(".category").addClass("ui-corner-all");
    });
    
    $("#search").submit(function(){
        search();
        return false;
    });
    
    $("#more_button").click(function(){
        $("body").mask("読み込み中...");
        offset += limit;
        $.log("search" + offset);
        refreshIncidents();
    });
}

function initLayout(){
    //set up layout
    var layout = $('body').layout({
        applyDefaultStyles: true,
        resizable:  true,
        slidable: true,
        north__size:230,
        south__size:50,
        east__size:Math.floor($(window).width() / 2)
    });
    $( "#tabs" ).tabs();
    $(".ui-layout-center").tabs().find(".ui-tabs-nav").sortable({ axis: 'x', zIndex: 2 })
    $(".ui-layout-center").removeClass("ui-corner-all");
    $(".ui-layout-center").css("padding","0px");
    $(".ui-layout-south").css("background-color","#A8A8A8");
    layout.resizeAll();
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
            $("input[name=catID]").val([data.c]);
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
    if($("input[name=catID]:checked").val()){
        data.c = $("input[name=catID]:checked").val();
    }
    if($("#keyword").val()){
        data.keyword = $("#keyword").val();
    }
    $.post('/appdata/@viewer/@self', data, function() {}, 'data');
}

$(function($,data) {
    //set up map
    ushahidi = $.ushahidi({"endpoint":endpoint,"limit":limit});
    initMap();
    initForm();
    initLayout();
    search();
});

