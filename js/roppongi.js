/*** 設定 ***/
// jp.bygc.clubm
var senderID = "847766150620";
var roppongi_host	= "http://spynk.com/roppongi/reg.php";
var roppongi_member	= "http://spynk.com/roppongi/member.php";

var utility = {
    dataSet: function(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value));
	return;
   }
   ,dataGet: function(key) {
	var d = window.localStorage.getItem(key);
	return d ? JSON.parse(d) : null;
   }
}

var roppongi = {
   data: {}
  ,init: function() {
	document.addEventListener('deviceready', roppongi.onDeviceReady, true);
   }
  ,onDeviceReady: function() {
	var imgfile = null;
	roppongi.data = utility.dataGet("roppongi");
	postdata=roppongi.data;for (v in postdata) loginpage.showStatus(v +'::'+postdata[v]);
loginpage.showStatus('ID:'+roppongi.getID());
loginpage.showStatus('pass:'+roppongi.getAutopass());
	if (this.data != null && this.data.id != null) {
	  $('#button_1 img').attr('src', 'img/menu_syou.png');
	  $('#button_2 img').attr('src', 'img/menu_kaiin.png');
	} else {
	  $('#button_1 img').attr('src', 'img/menu_sinki.png');
	  $('#button_2 img').attr('src', 'img/menu_kisyu.png');
	}
	$('#button_1')
	.one('click touchdown',function(){
	  $.mobile.loading('show');
	  $('#button_1, #button_2').attr('disabled', 'disabled');
	  roppongi.submit();
	  return false;
	});
	$('#button_2')
	.one('click touchdown',function(){
	  $.mobile.loading('show');
	  $('#button_1, #button_2').attr('disabled', 'disabled');
	  roppongi.submit2();
	  return false;
	});
	//loginpage.showStatus('ボタンにアクションを登録しました。');
  }
  ,submit: function() {
	loginpage.getID(roppongi.set);
  }
  ,submit2: function() {
	//subpage.go(roppongi.set);
  }
  ,set: function(data) {
	roppongi.data = data;
	utility.dataSet("roppongi", data);
postdata=roppongi.data;for (v in postdata) loginpage.showStatus(v +'::'+postdata[v]);
	$('#button_1, #button_2').removeAttr('disabled');
	roppongi.showID();
  }
  ,showID: function() {
loginpage.showStatus('ID:' + this.data.id);
loginpage.showStatus('pass:' + this.data.autopass);
loginpage.showStatus('ID:'+roppongi.getID());
loginpage.showStatus('pass:'+roppongi.getAutopass());
return false;
	var url = roppongi_member
	  + '?id=' + this.data.id
//	  + '&uuid=' + this.data.uuid
	  + '&autopass=' + this.data.autopass
	  + '&mode=' + 'certificate'
	location.href = url;
  }
  ,getID: function() {
	if (roppongi.data) { return roppongi.data.id;
	} else { return null; }
  }
  ,getAutopass: function() {
	if (roppongi.data) { return roppongi.data.autopass;
	} else { return null; }
  }
}

var loginpage = {
  timer:	null
 ,cb:		null
 ,getID: function (cb) {
	this.cb = cb;
	// オンラインチェック
	if (navigator.onLine) {
	    loginpage.doLogin();
	} else {
	    loginpage.showStatus('端末がオフラインです。');
		var checkOnline = function() {
			if (navigator.onLine) {
			    loginpage.doLogin();
			} else {
			    loginpage.timer
				 = setTimeout(checkOnline,1500);
			}
	    }
	    loginpage.timer
		 = setTimeout(checkOnline,1500);
	}
  }
 ,doLogin: function() {
	loginpage.showStatus('オンラインであることを確認しました。');
	loginpage.showStatus('RegIDを取得します。');

	// GCM or APNSに問い合わせてRegIDを取得
	notif.getNotificationID(function( regid, platform) {
		// RegIDの取得完了
		loginpage.showStatus('RegIDを取得しました。');
				loginpage.showStatus(roppongi.getID());
				loginpage.showStatus(roppongi.getAutopass());

		// RegIDをサーバーに保存
		postdata = {
			 'id'		: roppongi.getID() ? roppongi.getID() : 0
			,'autopass'	: roppongi.getAutopass() ? roppongi.getAutopass() : 0
			,'regid'	: regid
			,'platform'	: platform
		}
		//console.log(postdata);
		//for (v in postdata) loginpage.showStatus(v +'::'+postdata[v]);
		$.ajax({
		   url	: roppongi_host
		  ,cache: false
		  ,data	: postdata
		  ,beforeSend: function() {
			//loginpage.showStatus(roppongi_host);
			loginpage.showStatus('サーバーにRegIDを保存しています。');
		  }
		  ,success: function(data) {
			//loginpage.showStatus('サーバーとの通信を解析しています。');
			//for (v in data) loginpage.showStatus(v +'::'+data[v]);
			switch (data.code) {
			  case 'success':
				//loginpage.showStatus('サーバーにRegIDを保存しました。');
				loginpage.cb({
				   'id'		: data.id
				  ,'autopass'	: data.autopass
				  ,'regid'	: regid
				  ,'platform'	: platform
				});
				break;
			  case 'error':
			  default:
				loginpage.showStatus('サーバーエラー');
			}
		  }
		  ,error: function(XMLHttpRequest, textStatus, errorThrown) {
			loginpage.showStatus('サーバーとの通信に失敗しました。');
			//data = XMLHttpRequest;
			//for (v in data) loginpage.showStatus(v +'::'+data[v]);
			loginpage.showStatus(textStatus);
			//data = errorThrown;
			//for (v in data) loginpage.showStatus(v +'::'+data[v]);
			//console.log('Ajax Error:');
			//console.log(data);
		  },complete: function(data) {
		  }
		})

	});
  }
 ,showStatus: function(status) {
	$('#app-status-ul').append(
	  $('<li>').html(status)
	);
  }
}

var notif = {
   successCB: null
  ,getNotificationID: function(cb) {
	notif.successCB = cb;
    try 
    { 
      pushNotification = window.plugins.pushNotification;
      if (device.platform == 'android' || device.platform == 'Android') {
	    pushNotification.register(notif.successHandler, notif.errorHandler, {"senderID":senderID,"ecb":"notif.onNotificationGCM"});
      } else {
	    pushNotification.register(notif.tokenHandler, notif.errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"notif.onNotificationAPN"});	// required!
      }
    }
    catch(err) 
    { 
	loginpage.showStatus('ページ内でエラーが発生しました。');
	loginpage.showStatus("エラー: " + err.message);
    } 
  } // getNotificationID
 ,onNotificationGCM: function(e) {
	//loginpage.showStatus('GCMからの通知を取得しました。');
	//loginpage.showStatus(e.event);
	//loginpage.showStatus('GCMからの通知を解析しています。');
	//for (v in e) loginpage.showStatus(v +'::'+e[v]);
	switch( e.event )
	{
	    case 'registered':
		if ( e.regid.length > 0 ) {
			notif.successCB( e.regid, 'android');
		}
		break;
	    case 'message':
		loginpage.showStatus("メッセージを取得しました。");
		loginpage.showStatus(e.payload.message);
		// debug
		alert(e.payload.message);
		break;
	    case 'error':
		loginpage.showStatus('エラーが発生しました。');
		loginpage.showStatus("エラー: " + e.msg);
		break;
	    default:
		loginpage.showStatus('不明なイベントを取得しました。');
	    break;
	}
  }
 ,onNotificationAPN: function(e) {}
 ,tokenHandler: function(result) {
	loginpage.showStatus('APNSからの通知を取得しました。');
	notif.successCB( result, 'iOS');
  }
 ,successHandler: function(result) {
	loginpage.showStatus('通信成功。');
	loginpage.showStatus(result);
  }
 ,errorHandler: function(error) {
	loginpage.showStatus('通信失敗。');
	loginpage.showStatus(error);
  }
}


/*** エラー時に出力 ***/
window.onerror = function (e, file, num) {
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    console.log(e);
    console.log('Error on ' + file + ' at Line: ' + num);
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    loginpage.showStatus('Error on ' + file + ' at Line: ' + num);
};

//$(document).ready(function() {   roppongi.onDeviceReady(); });
//$(document).ready(function() { loginpage.registerWithServer(1,10);});