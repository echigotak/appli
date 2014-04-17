// jp.bygc.clubm
var GCMsenderID = "847766150620";  // Android GCM ID
var roppongi_host	= "http://spynk.com/roppongi/reg.php";
var roppongi_member	= "http://spynk.com/roppongi/member.php";
var pushNotification;

var app = {
    data    : {},
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(function(){app.onDeviceReady()}); // for debug
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        var isLoginTried = false;

        // Load the data
        app.data    = utility.dataGet('clubm');
        if (! app.data) app.data = {};
        
        // Show DOM
        if (app.data.registered) {
            // Already registered (or tried to register)
            $('#button_1').show().find('img').attr('src', 'img/menu_kaiin.png');
            if (!isLoginTried) app.login();
        } else {
            $('#button_1').show().find('img').attr('src', 'img/menu_sinki.png');
        }
        
        // Bind event listeners to button
        $('#button_1')
        .one('click touchdown',function(){
              $.mobile.loading('show');
              $('#button_1, #button_2').attr('disabled', 'disabled');
              app.login();
              return false;
        });
        // Get RegID
        app.getRegID();
    },
    // Login
    login   : function() {
    	if (!navigator.onLine) {
    	    app.showState('インターネットに接続できません。<br>Wifi設定などを確認してください。');
            app.loginFailed();
            return false;
    	}
        if (!app.data.RegID) {
    	    app.showState('RegIDが取得できません。');
            app.loginFailed();
            return false;
        }
        // Save the state
        app.data.registered = true;
        utility.dataSet('clubm', app.data);
        // Go to the member page
        app.showState('サーバーに接続します。');
        var url = roppongi_member
          + '?id='       + app.data.id
          + '&autopass=' + app.data.autopass
          + '&regid='    + app.data.RegID
          + '&mode='     + 'certificate'
          + '&goto='     + 'memberpage'
        location.href = url;
    },
    // Show state
    showState  : function(state) {
        $('#app-status-ul').append(
          $('<li>').html(status)
        );
    },
    // Login Failed
    loginFailed : function() {
        $.mobile.loading('hide');
        $('#button_1, #button_2').removeAttr('disabled');
    },
    // Get Reg ID
    getRegID : function() {
    	if (!navigator.onLine) {
    	    setTimeout(app.getRegID, 1500);
    	    return false;
        }
        try 
        { 
        	if (!pushNotification) pushNotification = window.plugins.pushNotification;
        	if (device.platform == 'android' || device.platform == 'Android') {
        	    app.showState('Android用RegIDを取得しています。');
            	pushNotification.register(successHandler, errorHandler, {"senderID":GCMsenderID,"ecb":"onNotificationGCM"});		// required!
        	} else {
        	    app.showState('iOS用RegIDを取得しています。');
            	pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
        	}
        }
        catch(err) 
        { 
        	txt="ページ内でエラーが発生しました。\n\n"; 
        	txt+="エラー: " + err.message + "\n\n"; 
        	alert(txt);
        }
    },
    // Update RegID
    updateRegID : function(regid) {
        // Save the RegID in the server
		postdata = {
			 'id'		: app.data.id
			,'autopass'	: app.data.autopass
			,'regid'	: regid
			,'platform'	: device.platform
		}
	    app.showState('RegIDをサーバーに保存しています。');
		$.ajax({
		   url	: roppongi_host
		  ,cache: false
		  ,data	: postdata
		  ,success: function(data) {
			switch (data.code) {
			  case 'success':
				app.showState('サーバーにRegIDを保存しました。');
                // Save the state in local
                app.data.id         = data.id;
                app.data.autopass   = data.autopass;
                app.data.RegID      = regid;
                utility.dataSet('clubm', app.data);
				break;
			  case 'error':
			  default:
				app.showState('サーバーエラー:'+data);
				console.log(data);
				break;
			}
		  }
		  ,error: function(XMLHttpRequest, textStatus, errorThrown) {
			loginpage.showStatus('サーバーとの通信に失敗しました。');
			app.showState(textStatus);
			console.log('Ajax Error:');
			console.log(errorThrown);
		  }
		});
    }
};

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



/*** Push Notification Handlers ***/
// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        app.showState('通知: ' + e.alert);
         navigator.notification.alert(e.alert);
    }
        
    if (e.sound) {
        var snd = new Media(e.sound);
        snd.play();
    }
    
    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
    app.showState('イベント通知: ' + e.event);
    
    switch( e.event )
    {
        case 'registered':
    		if ( e.regid.length > 0 )
    		{
                app.showState('RegID: ' + e.regid);
    			// Your GCM push server needs to know the regID before it can push to this device
    			// here is where you might want to send it the regID for later use.
    			app.updateRegID(e.regid);
    			//console.log("regID = " + e.regid);
    		}
            break;
        
        case 'message':
        	// if this flag is set, this notification happened while we were in the foreground.
        	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
        	if (e.foreground)
        	{
                app.showState('INLINE : 通知を受信しました');
				
				// if the notification contains a soundname, play it.
				if (e.soundname) {
    				var my_media = new Media("/android_asset/www/"+e.soundname);
    				my_media.play();
                }
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				if (e.coldstart)
                    app.showState('COLDSTART : 通知を受信しました');
				else
                    app.showState('BACKGROUND : 通知を受信しました');
			}
				
            app.showState('メッセージ: ' + e.payload.message);
            app.showState('カウント　: ' + e.payload.msgcnt);
        break;
        
        case 'error':
            app.showState('エラー: ' + e.msg);
        break;
        
        default:
            app.showState('イベントを受信しました: ' + e.event);
        break;
    }
}

function tokenHandler (result) {
    app.showState('トークン: ' + result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
	app.updateRegID(result);
}

function successHandler (result) {
    app.showState('受信成功: ' + result);
    //$("#app-status-ul").append('<li>success:'+ result +'</li>');
}

function errorHandler (error) {
    app.showState('エラー: ' + error);
    //$("#app-status-ul").append('<li>error:'+ error +'</li>');
}

/*** Error ***/
window.onerror = function (e, file, num) {
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    console.log(e);
    console.log('Error on ' + file + ' at Line: ' + num);
    console.log('/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
    app.showState('Error on ' + file + ' at Line: ' + num);
};
