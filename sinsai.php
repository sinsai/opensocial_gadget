<?php echo '<?xml version="1.0" encoding="UTF-8"?>'?>
<Module>
 <ModulePrefs title="震災復興支援sinsai.infoガジェット" 
    title_url="http://www.sinsai.info/" 
    author="Nachi Ueno" 
    author_email="nati.ueno@gmail.com">
<Locale messages="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/locale/ALL_ALL.xml"/>
<Locale lang="ja" messages="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/locale/ja_ALL.xml"/> 
<Require feature="dynamic-height" />
<Require feature="settitle" />
<Require feature="views" />
<Require feature="opensocial-0.8" />
</ModulePrefs>
<Content type="html" view="canvas,profile,home"><![CDATA[
<link rel="stylesheet" href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/openlayers.css" type="text/css"/> 
<link rel="stylesheet" href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/google.css" type="text/css"/> 
<link type="text/css" href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/south-street/jquery-ui-1.8.11.custom.css" rel="stylesheet" />
<link href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/jquery.loadmask.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/jquery.notifyBar.css" type="text/css" media="screen"  />
<link rel="stylesheet" href="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/css/style.css" type="text/css" media="screen"  />
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/opensocial-jquery.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/jquery-ui-1.8.11.custom.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/opensocial-jquery.autoHeight.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/opensocial-jquery.templates.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/jquery.json-2.2.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/jquery.loadmask.min.js"></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/jquery.loadmask.min.js"></script>
<script src="http://layout.jquery-dev.net/lib/js/jquery.layout-latest.js"></script>
<script src='http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6'></script>
<script src='http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAC99cU8JddvQOwYmQc58EvhTwkllQ1ylirtKWEj6gIkcaRzt0cxQ3dZF78whwStV1xjQiTdi4NnZ4eg'></script>
<script type="text/javascript" src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/js/jquery.pngFix.js"></script> 
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/OpenLayers.js"></script> 
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/timeline.js"></script>
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/opensocial-jquery.autoHeight.min.js"></script>
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/jquery.notifyBar.js"></script>
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/LargeLayerSwitcher.js"></script>
 
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/openlayers_opensocial.js"></script>
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/ushahidi_gadget.js"></script>
<script src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/js/sinsai.js"></script>
<script language="javascript">
$(function($,data) {
    var address = data.address || "気仙沼";
    var zoom = data.zoom || 6;
    //set up map
    ushahidi = $.ushahidi({"endpoint":endpoint,"limit":limit});
    initMap();
    initForm();
    $("#address").val(address);
    $("#zoom").val(zoom);
    initLayout();
    search();
});

</script> 
<div class="ui-layout-center">
    <ul>
        <li><a href="#incident-tab">__MSG_report__</a></li>
        <li><a href="#tabs-2">__MSG_post__</a></li>
        <li><a href="#comment">__MSG_new_comment__</a></li>
        <li><a href="#tabs-3">__MSG_mobile__</a></li>
    </ul>
    <div id="comment">
        <div id="comment_holder">
        </div>
        <input type="button" id="more_comment_button" value="__MSG_next__"/>
        <div id="comments_template" style="display:none;">
            <div repeat="${comments}" class="comments">
                <div class="comment">
                    <span class="date">${Cur.comment_date} </span>
                    <a href="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/reports/view/${Cur.incident_id}" class="dialog" target="_blank">${Cur.comment_description }
                   </a><br>
                </div>
            </div>
        </div>
    </div>
    <div id="incident-tab">
        <div id="incident_holder">
        </div>
        <input type="button" id="more_incident_button" value="__MSG_next__"/>
        <div id="incidents_template" style="display:none;">
            <div repeat="${incidents}" class="incidents">
                <div class="incident">
                    <span repeat="${Cur.incident.categories}" class="categories">
                        <img src="${Cur.url}"/>
                    </span>
                    <span class="date">${Cur.incident.incidentdate } </span>
                    <div class="title">${Cur.incident.incidenttitle } </div>
                    <div class="id">${Cur.incident.incidentid}</div>
                    <div class="lon">${Cur.incident.locationlongitude}</div>
                    <div class="lat">${Cur.incident.locationlatitude}</div>
                </div>
            </div>
        </div>
    </div>
    <div id="tabs-2">
        __MSG_how_to_post__
    </div>
    <div id="tabs-3">
		    <div class="mobile-box-qr">
		    <img src="http://chart.apis.google.com/chart?chs=100x100&amp;cht=qr&amp;chl=http://www.sinsai.info/">
		    </div>
		    <div class="mobile-box-description">
		    __MSG_mobile_apps__
			</div>
    </div>
    
</div>
<div class="ui-layout-north">

<form id="search">
<div id="logo">
<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/gadget/images/logo-wide.gif"/>
</div>
<div class="toggleMenu">
__MSG_switch_view__：<a id="pinWest">__MSG_search_option__</a><a id="pinEast">__MSG_map__</a><br style="clear:both;"/>
<a href="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/alerts" class="">新着レポートをメール/RSSで受信する</a>
</div>
<div class="basicForm">
<div class="field">
<label>__MSG_address__</label><input type="text"  id="address" value="気仙沼"/>×
</div>
<div class="field">
<label>__MSG_keyword__</label><input type="text" size="12" id="keyword"/>
</div>
<div class="field">
<input id="search_button" type="submit" value="__MSG_search__"/>
</div>
</div>

</div>
<input type="hidden" id="zoom" name="zoom"/>
<input type="hidden" value="0" name="catID" id="catID" />
</form>

<div class="ui-layout-south">
<div class="footer">
			<!-- footer credits --> 
			<div class="footer-credits"> 
				the &nbsp; <a href="http://www.ushahidi.com/"><img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi//media/img/footer-logo.png" alt="Ushahidi" style="vertical-align:middle" /></a>&nbsp; Platform
			</div> 
			<!-- / footer credits --> 
 
			<!-- footer menu --> 
			<div class="footermenu"> 
				<ul class="clearingfix"> 
				    __MSG_footer__ 
				</ul> 
  				</div> 
			<!-- / footer menu --> 
			<!-- footer credits links --> 
			<div class="footer-credits-links"> 
				<div class="footer-credit"> 
					Powered by
				</div> 
				<ul> 
					<li> 
						<a href="http://aws.amazon.com/" target="_blank"> 
							<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/img/Powered-by-Amazon-Web-Services.jpeg" alt="Amazon-Web-Services" style="vertical-align:middle" /> 
						</a> 
					</li> 
					<li> 
						<a href="http://heartbeats.jp/" target="_blank"> 
							<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/img/powered-by-heartbeats.gif" alt="heartbeats" style="vertical-align:middle" /> 
						</a> 
					</li> 
					<li> 
						<a href="http://www.gree.co.jp/" target="_blank"> 
							<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/img/powered-by-gree.gif" alt="gree" style="vertical-align:middle" /> 
						</a> 
					</li> 
					<li> 
						<a href="http://www.nttdata.co.jp/" target="_blank"> 
							<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/img/nttdata-gi.gif" alt="nttdata" style="vertical-align:middle" /> 
						</a> 
					</li> 
					<li> 
						<a href="http://www.yahoo.co.jp/" target="_blank"> 
							<img src="http://<?php echo $_SERVER["SERVER_NAME"];?>/ushahidi/media/img/logo_yahoo.gif" alt="yahoo" style="vertical-align:middle" /> 
						</a> 
					</li> 
				</ul> 
			</div> 
			<br style="clear:both;"/>
      		<div style="text-align:center;margin-top:10px;"><p class="copyright">Copyright&nbsp;&copy;&nbsp;sinsai.info&nbsp;All&nbsp;Rights&nbsp;Reserved.&nbsp;by <a href="http://openstreetmap.jp/crisis/">OpenStreetMap Japan - Crisis Mapping Project</a></p></div> 
	<!-- / footer --> 
</div>
<!-- <div id="debug"></div> --> 
</div>
<div class="ui-layout-east"><div id="map" class="smallmap"></div></div>
<div class="ui-layout-west">
<div id="categoryfield"></div>
</div>]]>
</Content>
</Module>
