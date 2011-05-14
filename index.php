<?php 
require_once('Net/UserAgent/Mobile.php');
function is_keitai()
{
    $agent = Net_UserAgent_Mobile::singleton(); 
    switch( true )
    {
      case ($agent->isDoCoMo()):   // DoCoMoかどうか
        return true;
        if( $agent->isFOMA() )
          return true;
        break;
      case ($agent->isVodafone()): // softbankかどうか
        return true;
        if( $agent->isType3GC() )
          return true;
        break;
      case ($agent->isEZweb()):    // ezwebかどうか
        return true;
        if( $agent->isWIN() )
          return true;
        break;
      default:
        return false;
        break;
    }
}

function is_mobile()
{
	// check if the user agent value claims to be windows but not windows mobile
	if(stristr($_SERVER['HTTP_USER_AGENT'],'windows') AND !stristr($_SERVER['HTTP_USER_AGENT'],'windows ce'))
	{
		return false;
	}
	// check if the user agent gives away any tell tale signs it's a mobile browser
#		if(preg_matcH('/up.browser|up.link|windows ce|iemobile|mini|iphone|ipod|android|danger|blackberry|mmp|symbian|midp|wap|phone|pocket|mobile|pda|psp/i',$_SERVER['HTTP_USER_AGENT']))
           if(preg_matcH('/windows ce|iemobile|mini|iphone|ipod|android|danger|blackberry|mmp|symbian|midp|phone|pocket|mobile|pda|psp/i',$_SERVER['HTTP_USER_AGENT']))
	{
		return true;
	}
	// check the http accept header to see if wap.wml or wap.xhtml support is claimed
	if (isset($_SERVER['HTTP_ACCEPT']))
	{
		if(stristr($_SERVER['HTTP_ACCEPT'],'text/vnd.wap.wml')||stristr($_SERVER['HTTP_ACCEPT'],'application/vnd.wap.xhtml+xml'))
		{
			return true;
		}
	}
	// check if there are any tell tales signs it's a mobile device from the _server headers
	if(isset($_SERVER['HTTP_X_WAP_PROFILE'])||isset($_SERVER['HTTP_PROFILE'])||isset($_SERVER['X-OperaMini-Features'])||isset($_SERVER['UA-pixels']))
	{
		return true;
	}
	// build an array with the first four characters from the most common mobile user agents
	$a = array('acs-','alav','alca','amoi','andr','audi','aste','avan','benq','bird','blac','blaz','brew','cell','cldc','cmd-','dang','doco','eric','hipt','inno','ipaq','ipho','java','jigs','kddi','keji','leno','lg-c','lg-d','lg-g','lge-','maui','maxo','midp','mits','mmef','mobi','mot-','moto','mwbp','nec-','newt','noki','opwv','palm','pana','pant','pdxg','phil','play','pluc','port','prox','qtek','qwap','sage','sams','sany','sch-','sec-','send','seri','sgh-','shar','sie-','siem','smal','smar','sony','sph-','symb','t-mo','teli','tim-','tosh','tsm-','upg1','upsi','vk-v','voda','w3c','wap-','wapa','wapi','wapp','wapr','webc','winw','winw','xda','xda-');
	// check if the first four characters of the current user agent are set as a key in the array
	if(isset($a[substr($_SERVER['HTTP_USER_AGENT'],0,4)]))
	{
		return true;
	}
	}

if(is_mobile()){	
    header("Location: http://".$_SERVER["SERVER_NAME"]."/ushahidi/mobile");
}else if(is_keitai()){
    header("Location: http://".$_SERVER["SERVER_NAME"]."/ushahidi/keitai");
}else{
?>
<!DOCTYPE html>
<html>
	<head>
<title>sinsai.info 東日本大震災  |  みんなでつくる復興支援プラットフォーム</title> 
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> 
<meta name="keywords" content="東日本大震災,被災地,震災,地震,復興,支援,津波,災害,救援,物資,情報,shinsai,インフォ,311,ボランティア" /> 
<meta name="description" content="sinsai.infoでは、2011年3月11日に発生した東日本大震災の被災地周辺情報を収集し公開しています。インターネットを活用して、みなさまからの投稿だけでなく、twitterのつぶやきなどをピックアップして、幅広いカテゴリの情報を提供しています。ボランティアスタッフ一同、被災地の皆様の1日でも早い復興をお祈りしております。" /> 
<style type="text/css">
<!--

body{
    margin:0px;
    padding:0px;
    overflow:hidden;
}

-->
</style>
	</head>
	<body>
<!-- Include the Google Friend Connect javascript library. -->
<script type="text/javascript" src="http://www.google.com/friendconnect/script/friendconnect.js"></script>
<script src="http://www.sinsai.info/gadget/js/opensocial-jquery.min.js"></script>
<script type="text/javascript" src="http://www.sinsai.info/gadget/js/jquery.query-1.2.3.js"></script>
<!-- Define the div tag where the gadget will be inserted. -->
<div id="div-5324086401361857576" style="width:100%;height:100%;border:none;"></div>
<!-- Render the gadget into a div. -->
<script type="text/javascript">
google.friendconnect.container.setParentUrl('/' /* location of rpc_relay.html and canvas.html */);
//google.friendconnect.container.setNoCache(1);
google.friendconnect.container.renderOpenSocialGadget(
 { id: 'div-5324086401361857576',
   url:'http://www.sinsai.info/gadget/sinsai.php',
   presentation :'canvas',
   'view-params': {
        'address':$.query.get("address"),
        'zoom':$.query.get("zoom")
   },
   height:$(window).height(),
   site: '05994095657403771775' });
</script>
<script type="text/javascript"> 
		var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
		document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script> 
		<script type="text/javascript"> 
		var pageTracker = _gat._getTracker("UA-22075443-1");
		pageTracker._trackPageview();
</script>
</body>
</html>
<?php
}
?>




