  $(function(){
	var wWidth, wHeight, iWidth, iHeight, mWidth, mHeight,
	    ratio, margin;
	wWidth	= window.innerWidth;
	wHeight	= window.innerHeight;
	iWidth	= $('.bg')[0].width;
	iHeight	= $('.bg')[0].height;
	ratio	= wWidth / iWidth;
	mWidth	= iWidth  * ratio;
	mHeight	= iHeight * ratio;

	var pageResize = function(){
		if (mHeight < wHeight) {
		  margin = (wHeight - mHeight) / 2;
		  $('.bg').css({
			 'position'	: 'absolute'
			,'top'		: margin + 'px'
			,'left'		: 0
			,'width'	: mWidth + 'px'
			,'height'	: mHeight + 'px'
		  })
		  $('.ui-content').css({
			 'position'	: 'absolute'
			,'top'		: margin + 'px'
			,'left'		: 0
			,'width'	: mWidth + 'px'
			,'height'	: mHeight + 'px'
		  })
		} else {
		  ratio		= wHeight / iHeight;
		  mWidth	= iWidth  * ratio;
		  mHeight	= iHeight * ratio;
		  margin	= (wWidth - mWidth) / 2;
		  $('.bg').css({
			 'position'	: 'absolute'
			,'top'		: 0
			,'left'		: margin + 'px'
			,'width'	: mWidth + 'px'
			,'height'	: mHeight + 'px'
		  })
		  $('.ui-content').css({
			 'position'	: 'absolute'
			,'top'		: 0
			,'left'		: margin + 'px'
			,'width'	: mWidth + 'px'
			,'height'	: mHeight + 'px'
		  })
		}
		var cssResize = function( obj, keys) {
		    keys.forEach(function(key) {
			before = obj.css(key);
			if (before.indexOf('px') == -1) return;
			before = parseInt(before);
			obj.css( key, before*ratio + 'px');
		    });
		}
		$('.ui-content').find('img, div, a').each(function(){
		   cssResize( $(this), ['left','top','width','height','font-size'] );
		});
	}
	$('div[data-role="page"]').on('pageinit', function(){
	  pageResize();
	});
	pageResize();
  });
