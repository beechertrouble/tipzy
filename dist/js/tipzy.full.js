if(!jQuery().inView){
	$.fn.inView=function(p){ 
		
		var r = false,
			a = $(window);
			
		if(this.length > 0){
		
			var t = this.offset() === null ? 0 : this.offset().top, // top of the $el
				b = t+this.height(); // bottom of the $el
			
			p = p === undefined ? a.height() : p; // padding for viewport, to consider things in view, default to 1 viewport height
			
			r = ((a.scrollTop() + a.height()) + p) >= t && (a.scrollTop() - p) <= b ? true : false;
		}
		
		return r;
	}
};
/**
* endedEvents
* adds events for when expensive evnts (like scroll and resize) have ended
*/
;(function($, W) {

	'use strict';

	/**
	 * for AMD, don't redefine this!  (need to maintain globals and plugins)
	 */
	if (W.endedEvents)
		return;
	
	$ = $;
	var D = document,
		endedEvents = {
			isScrollStopped : true,
			isResizedStopped : true,
			scrollTimer : undefined,
			resizeTimer : undefined
		},
		scrollStopped = function() {
			
			W.endedEvents.isScrollStopped = true;
			
			if($ !== undefined)
				$(W).trigger('scrollStopped');
							
		},
		resizeStopped =  function() {
			
			W.endedEvents.isResizedStopped = true;
			
			if($ !== undefined)
				$(W).trigger('resizeStopped');
							
		};
		
		endedEvents.init = function(throttle, $jquery) {
			
			if($jquery !== undefined)
				$ = $jquery;
			
			// you need support for addEventListener ....
			if(!D.addEventListener || typeof D.addEventListener == 'undefined') return;
			
			// how often should we chck to see if the event has stopped ? ...
			endedEvents.throttle = throttle === undefined ? 150 : throttle;
			
			W.addEventListener("scroll", function() {
				
				W.endedEvents.isScrollStopped = false;
				clearTimeout(W.endedEvents.scrollTimer);
				W.endedEvents.scrollTimer = setTimeout( scrollStopped , endedEvents.throttle );
					
			});
			
			W.addEventListener("resize", function() {
				
				W.endedEvents.isResizedStopped = false;
				clearTimeout(W.endedEvents.resizeTimer);
				W.endedEvents.resizeTimer = setTimeout( resizeStopped , endedEvents.throttle );
					
			});
			
			if($ !== undefined)
				$.event.props.push(['scrollStopped', 'resizeStopped']);
		
		};
		
	/**
	 * Apply the ikelos function to the supplied scope (window)
	 */
	W.endedEvents = endedEvents;

})(jQuery || $, window);

/**
 * Expose endedEvents as an AMD
 */
if (typeof define === "function") 
	define("endedEvents", [], function () { return endedEvents; } );

/**
* TipZy : accessible ToolTips 
* - default to a title attr
* - mind your arias
* - animations with css
* - js for positioning & class swappings
*
* requires: 
* - jquery 
* - inView
* - endedEvents 
*/
var _tipzy = (function(W, $) {
	
	var _tipzy = {
			_tips : [], //array to contain references to all tooltips on the page
			pageStats : {}
		},
		padWindow = 10, // this is as close as we want to get to the top of the window
		percToPX = function(fullPX, perc, round) {
			return round === undefined || round === true ? Math.round( (fullPX * perc) / 100) : (fullPX * perc) / 100;
		}, // percToPX()
		pxToPerc = function(fullPX, px) {
			return ((100 * px) / fullPX);
		}, // pxToPerc()
		makeUID = function() {
			var UID = '_tipzy-' + Math.round(Math.random() * 100000);
			return $("#" + UID).length <= 0 ? UID : makeUID();
		}
		;

	
	/**
	* the tip thingy
	*/	
	var _tip = function($anchor) {
		
		var _me = {
				$anchor : $anchor,
				$tip : '',
				anchorDims : {},
				tipDims : {}
			}
			;
		
		_me.position = function() {
											
			_me.tipDims.x = _me.anchorDims.x + _me.tipDims.tipxOffset - (_me.tipDims.w *0.5);
			_me.tipDims.y = _me.anchorDims.y - _me.tipDims.tipyOffset - _me.tipDims.h;
	
			var arrowLeft = 50,
				arrowV = 'bottom';
	
			switch(true) {
				
				// left edge
				case(_me.tipDims.x <= 0): 
					_me.tipDims.x = 0;
					arrowLeft = Math.floor(pxToPerc(_me.tipDims.x + _me.tipDims.w, (_me.anchorDims.x + (_me.anchorDims.w *0.5))) /5) * 5; // fullPX, px
					break;
				
				// right edge	
				case((_me.tipDims.x + _me.tipDims.w - _tipzy.pageStats.L) >= _tipzy.pageStats.W): 
					_me.tipDims.x = _tipzy.pageStats.W - (_me.tipDims.w - _tipzy.pageStats.L) ;
					arrowLeft = Math.floor(pxToPerc(_me.tipDims.w,  ((_me.anchorDims.x + (_me.anchorDims.w *0.5)) - _me.tipDims.x) ) /5) * 5; // fullPX, px
					break;
				
			}
			
			// put it on top of the anchor
			if(_me.tipDims.y < padWindow || _me.tipDims.y < _tipzy.pageStats.T) {
				arrowV = 'top';
				_me.tipDims.y = _me.anchorDims.y + _me.anchorDims.h + _me.tipDims.tipyOffset;
			}
			
			console.log('_me.anchorDims', _me.anchorDims);
			console.log('_me.tipDims', _me.tipDims);
									
			_me.$tip
				.css({
					left: _me.tipDims.x, 
					top: _me.tipDims.y 
				})
				.attr({
					'data-tipzyleft': Math.abs(arrowLeft) + '%', 
					'data-tipzyv' : arrowV 
				});
			
		}; // position()
		
		_me.updateTipDims = function(){
			_me.tipDims = {
				w : _me.$tip.outerWidth(),
				h : _me.$tip.outerHeight(),
				tipxOffset : _me.anchorDims.w *0.5,
				tipyOffset : 5
			};
		}; // updateTipDims()
		
		_me.updateAnchorDims= function(){
			_me.anchorDims = {
				w : $anchor[0].offsetWidth, 
				h : $anchor[0].offsetHeight, 
				x : $anchor.offset().left, 
				y : $anchor.offset().top
			};
		}; // updateAnchorDims()
		
		_me.show = function() {
			_me.position();
			_me.$tip.attr('aria-hidden', 'false');
		}; // 	show()
		
		_me.hide = function() {
			_me.$tip.attr('aria-hidden', 'true');
		}; // 	hide()
		
		_me.parse = function() {
			
			$anchor.addClass('_tipzy_bound');
			
			_me.updateAnchorDims();
			
			var UID = makeUID();
			
			// make the tip element
			_me.$tip = $('<div id="' + UID + '" class="_tipzy">');
						
			$("body").append(_me.$tip);
			
			_me.$tip
				.attr({
					'role' : "tooltip",
					'aria-hidden' : 'true'
				})
				.on('touchstart', function(e){
					e.stopPropagation();
				})
				.on('mouseover focus', function(e){
					_me.show();
				})
				.on('mouseleave blur', function(e){
					_me.hide();
				})
				.append('<div class="_tipzy_content">' + $anchor.data('tipzycontent') + '</div>');
				
			_me.updateTipDims();
			
			$anchor
				.attr({
					'aria-describedby' : UID,
					'data-tipzytitle' : $anchor.attr('title')
				})
				.removeAttr('title')
				.on('focus mouseover', function(e){ //onMouseover element
					console.log('anchor mouseover');
					_me.updateAnchorDims();
					// _tipzy.hardhidetips();
					_me.show();
				})
				.on('blur mouseout',  function(e){ //onMouseout element
					_me.hide();
				});
			
		}; // parse()
		
		_me.parse();
		
		return _me;
		
	}; // _tip()
	
	//
	// !tipZy methods 
	//
		
	// @todo : consider 	padWindow on these ...
	_tipzy.updatePageStats = function() {

		_tipzy.pageStats = {
			W : W.innerWidth,
			H : W.innerHeight,
			L : W.pageXOffset,
			T : W.pageYOffset 
		};
		
	}; // updatePageStats();	
	
	_tipzy.hideAll = function() {
		
		$.each(_tipzy._tips, function(tip, b) {
			_tipzy._tips[tip].hide();
		});
		
	}; // hideAll();
	
	_tipzy.updateAllAnchors = function() {
		
		$.each(_tipzy._tips, function(tip, b) {
			_tipzy._tips[tip].updateAnchorDims();
		});
		
	}; // updateAllAnchors();

	
	_tipzy.parseTips = function() {
				
		$("._tipzy_anchor:not('._tipzy_bound')").each(function(){
			
			var anchor = $(this);
			
			if(anchor.inView(0)) {
				var tip = new _tip(anchor);
				console.log('parse : ', tip);
				_tipzy._tips.push(tip);
			}
			
		});
		
	}; // parseTips()
	
	
	_tipzy.init = function() {
				
		_tipzy.updatePageStats();
		_tipzy.parseTips();
		
		$(document).ready(function() {
			
			$(window)
				.on('touchstart', function(e){
					_tipzy.hideAll();
				})
				.on('scrollStopped', function(e){ 
					_tipzy.updatePageStats();
					_tipzy.parseTips();
				})
				.on('resizeStopped', function(e){ 
					_tipzy.updatePageStats();
					_tipzy.parseTips();
				});

		});
	
	}; // init()
	
	
	return _tipzy;
		
})(window, jQuery);