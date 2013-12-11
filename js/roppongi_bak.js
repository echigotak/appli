/*** 設定 ***/
// jp.bygc.roppongiclub
var senderID = "847766150620";
var pushNotification;
var timerID;

var roppongi_DB = {
    uuid	: null
   ,regid	: null
   ,act_code	: null
}

var utility = {
    dataSet: function(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
	return;
   }
   ,dataGet: function(key) {
	var d = localStorage.getItem(key);
	return d ? JSON.parse(d) : null;
   }
}

var roppongi = {
    // メンバー変数
    isOnline: false,
    
    // コンストラクタ
    initialize: function() {
	roppongi.bindEvents();
    },
    
    bindEvents: function() {
	document.addEventListener('deviceready', roppongi.onDeviceReady, true);
    },
    
    onDeviceReady: function () {
	navigator.splashscreen.hide();
	console.log('Application start...');	
	if (navigator.onLine) {
	    //code
	    getNotificationID();
	    doLogin();
	} else {
	    console.log('Device is offline.');
	    $("#app-status-ul").append('<li>接続できません。ネットワーク状況を確認してください。</li>');
	    $('#loginbutton').button('disable');
	    //document.addEventListener('online', getNotificationID, true);
	    onlineCheck();
	}
	
	roppongi.loadData();
	$('#loginform').submit(roppongi.onLoginformSubmit);
//	$('#settings').bind('dialogcreate', roppongi.loadSettings);
    },

    
    /**
     *  Local Storageからデータを読み込む
     */
    loadData: function() {
	roppongi_DB.uuid	= device.uuid;
	roppongi_DB.regid	= utility.dataGet("regid");
	roppongi_DB.act_code	= utility.dataGet("act_code");
    },

    /**
     *  ログインボタン押下時の処理
     */
    onLoginformSubmit: function() {
	$('#loginbutton').button('disable');
	$.mobile.loading('show',{text:'ログイン中', textVisible:true} );
	window.localStorage.setItem("loginID",	$('#id').val());
	window.localStorage.setItem("loginPass",	$('#pass').val());
	window.localStorage.setItem("platform",	$('#platform').val());
	window.localStorage.setItem("regID",	$('#regID').val());
	timerID = setTimeout('offlineProcess',4000);	// 4秒経っても動かなかったらオフラインと判断
    },
    
    /**
     * ローカルストレージにID/passが保存されていたら
     * 自動でログインをする
     */
    autologin: function() {
	console.log('autologin...');
	var loginID   = window.localStorage.getItem("loginID");
	var loginPass = window.localStorage.getItem("loginPass");
	if (history.length < 2
	    && loginID != null && (loginID.match(/\S/g))
	    && loginPass!= null && (loginPass.match(/\S/g))) {
	    $('#id').val(loginID);
	    $('#pass').val(loginPass);
	    $('#loginform').submit();
	}
        }
}

    function onlineCheck() {
	if (navigator.onLine) {
	    getNotificationID();
	    doLogin();
	} else {
	    //console.log('checking connection state..');
	    setTimeout(onlineCheck, 1500);
	}
    }

    /*** プッシュ通知関連 ***/
    function getNotificationID() {
	// ログインボタンを一時的に使用不可に
	$('#loginbutton').button('disable');
	$.mobile.loading('show');
        
	//$("#app-status-ul").append('<li>アプリケーションを起動しました。</li>');
	    try 
	    { 
	      pushNotification = window.plugins.pushNotification;
	      if (device.platform == 'android' || device.platform == 'Android') {
		    $("#app-status-ul").append('<li>GCMからNotification IDを取得しています。</li>');
		    pushNotification.register(successHandler, errorHandler, {"senderID":senderID,"ecb":"onNotificationGCM"});
	      } else {
		    $("#app-status-ul").append('<li>APNSからNotification IDを取得しています。</li>');
		    pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
	      }
	    }
	    catch(err) 
	    { 
		    txt="ページ内でエラーが発生しました。.\n\n"; 
		    txt+="エラー: " + err.message + "\n\n"; 
		    alert(txt); 
	    } 
    }
    
    // handle APNS notifications for iOS
    function onNotificationAPN(e) {
	if (e.alert) {
	    //$("#app-status-ul").append('<li>プッシュ通知: ' + e.alert + '</li>');
	    navigator.notification.alert(
	      e.alert,
	      alertDismissed,
	      '通知',
	      'OK'
	    );
	}
	if (e.sound) {
	    //var snd = new Media(e.sound);
	    //snd.play();
	    //new Media("notif.wav").play();
	}
	if (e.badge) {
	    pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
	}
    }
    
    // handle GCM notifications for Android
    function onNotificationGCM(e) {
	$("#app-status-ul").append('<li>イベントを受信:' + e.event + '</li>');
	
	switch( e.event )
	{
	    case 'registered':
		    if ( e.regid.length > 0 )
		    {
			    // Your GCM push server needs to know the regID before it can push to this device
			    // here is where you might want to send it the regID for later use.
			    registrationSuccess( e.regid, 'android');
		    }
		    break;
	    
	    case 'message':
		    // if this flag is set, this notification happened while we were in the foreground.
		    // you might want to play a sound to get the user's attention, throw up a dialog, etc.
		    if (e.foreground)
		    {
			    //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
    
			    // if the notification contains a soundname, play it.
			    //var my_media = new Media("/android_asset/www/"+e.soundname);
			    //my_media.play();
			    //new Media("notif.wav").play();
    
			    // 通知ダイアログを表示
			    navigator.notification.alert(
			      e.payload.message,
			      alertDismissed,
			      '通知',
			      '確認'
			    );
		    }
		    else
		    {	// otherwise we were launched because the user touched a notification in the notification tray.
			    if (e.coldstart) {
				    //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
			    } else {
				    //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
			    }
		    }
    
		    //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
		    //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
	    break;
	    
	    case 'error':
		    $("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
	    break;
	    
	    default:
		    $("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
	    break;
	}
    }
    
    function tokenHandler (result) {
	// Your iOS push server needs to know the token before it can push to this device
	// here is where you might want to send it the token for later use.
	registrationSuccess( result, 'iOS');
    }
    
    function successHandler (result) {
	$("#app-status-ul").append('<li>success:'+ result +'</li>');
    }
    
    function errorHandler (error) {
	$("#app-status-ul").append('<li>error:'+ error +'</li>');
    }
    
    function alertDismissed () {
    }
    
    function registrationSuccess( regID, platform) {
	clearTimeout(timerID);
	var tokenname = (platform=='android') ? 'レジスタID' : 'トークン' ;
	$("#app-status-ul").append('<li>' + tokenname +'を取得しました:' + regID + "</li>");
	$("#regid").val( regID );
	localStorage.regID = regID;
	$("#platform").val( platform );
	$('#loginbutton').button('enable');
	$.mobile.loading('hide');
        console.log('Get RegID: ' + regID);
	roppongi.autologin();
    }
    
    /*** プッシュ通知関連ここまで ***/

    /*** オフライン時の処理 ***/
    function offlineProcess() {
	$("#app-status-ul").append('<li>接続できません。ネットワーク状況を確認してください。</li>');
	$('#loginbutton').button('enable');
	$.mobile.loading('hide');	
    }


/*** エラー時に出力 ***/
window.onerror = function (e, file, num) {
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    console.log(e);
    console.log('Error on ' + file + ' at Line: ' + num);
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
};

//$(document).ready(function() {   roppongi.onDeviceReady(); });
//$(document).ready(function() { roppongi.autologin();});