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
			windowPadding : 10, // this is as close as we want to get to the edges of the window
			_tips : {}, // to contain references to all tooltips on the page, also for accessing by UID
			pageStats : {}
		},
		percToPX = function(fullPX, perc, round) {
			return round === undefined || round === true ? Math.round( (fullPX * perc) / 100) : (fullPX * perc) / 100;
		}, // percToPX()
		pxToPerc = function(fullPX, px) {
			return ((100 * px) / fullPX);
		}, // pxToPerc()
		makeUID = function() {
			var UID = '_tipzy-' + Math.round(Math.random() * 100000);
			return $("#" + UID).length <= 0 ? UID : makeUID();
		},
		getCoords = function(e) {
			
			switch(true) {
				
				case(e.pageX !== undefined):
					return  { x : e.pageX, y : e.pageY };
				
				case(e.originalEvent !== undefined && e.originalEvent.pageX !== undefined):
					return  { x : e.originalEvent.pageX, y : e.originalEvent.pageY };
				
				case(e.touches !== undefined && e.touches[0] !== undefined):
					return  { x : e.touches[0].pageX, y : e.touches[0].pageY };
					
				case(e.originalEvent !== undefined && e.originalEvent.touches !== undefined):
					return  { x : e.originalEvent.touches[0].pageX, y : e.originalEvent.touches[0].pageY };
					
				default:
					return {x : 0, y : 0};
				
			}
					
		}
		;

	
	/**
	* the tip thingy
	*/	
	var _tip = function($anchor, content) {
		
		var _tip = {
				UID : makeUID(),
				$anchor : $anchor,
				$tip : $('<div class="_tipzy">'),
				content : '',
				anchorDims : {},
				tipDims : {},
				state : {
					parsed : false
				}
			}
			;
			
		_tip.setContent = function(content, update) {
			
			update = update !== undefined ? update : false;

			switch(true) {
				
				case(content !== undefined):
					_tip.content = content;
					break;
				
				case($anchor.data('tipzycontent') !== undefined):
					_tip.content = $anchor.data('tipzycontent');
					break;
				
				case($anchor.attr('title') !== undefined):
					_tip.content = $anchor.attr('title');
					break;
					
			}
			
			_tip.$tip.html('<div class="_tipzy_content">' + _tip.content + '</div>');
			
			if(update) {
				if(!_tip.state.parsed) _tip.parse(_tip.content);
				_tip.updateTipDims();
				_tip.position();
			}
			
		}; // setContent();
		
		_tip.parse = function(content) {
			
			if(_tip.state.parsed) return;
			_tip.state.parsed = true;
			
			$anchor.addClass('_tipzy_bound');
			
			_tip.setContent(content);
						
			_tip.$tip
				.attr({
					'id' : _tip.UID,
					'role' : "tooltip",
					'aria-hidden' : 'true'
				})
				.on('touchstart', function(e){
					e.stopPropagation();
				})
				.on('mouseover focus', function(e){
					_tip.show(undefined, false);
				})
				.on('mouseleave blur', function(e){
					_tip.hide();
				});
			
			$("body").append(_tip.$tip);
			
			$anchor
				.attr({
					'aria-describedby' : _tip.UID,
					'data-tipzytitle' : $anchor.attr('title')
				})
				.removeAttr('title')
				.on('focus mouseover', function(e){ //onMouseover element
					_tip.updateAnchorDims();
					_tip.show(e);
				})
				.on('blur mouseout',  function(e){ //onMouseout element
					_tip.hide();
				});
			
			_tip.updateAnchorDims();	
			_tip.updateTipDims();
			_tip.position();
			
		}; // parse()
		
		_tip.position = function(e) {
			
			e = e === undefined ? false : getCoords(e);
			
			// default target to center of anchor - unless we have pointer info ...
			var anchorCenter = _tip.anchorDims.x + (_tip.anchorDims.w *0.5),
				target = !e ? anchorCenter :  e.x,
				arrowLeft = 50,
				arrowV = 'bottom';
				
			_tip.tipDims.x = target - (_tip.tipDims.w *0.5); // center tip over target
			_tip.tipDims.y = _tip.anchorDims.y - _tip.tipDims.tipyOffset - _tip.tipDims.h;
	
			switch(true) {
				
				// left edge of window
				case(_tip.tipDims.x <= _tipzy.pageStats.L): 
					_tip.tipDims.x = _tipzy.pageStats.L;
					arrowLeft = Math.floor(pxToPerc(_tip.tipDims.x + _tip.tipDims.w, (_tip.anchorDims.x + (_tip.anchorDims.w *0.5))) /5) * 5; // fullPX, px
					break;
				
				// right edge of window	
				case((_tip.tipDims.x + _tip.tipDims.w - _tipzy.pageStats.L) >= _tipzy.pageStats.R): 
					_tip.tipDims.x = _tipzy.pageStats.R - _tip.tipDims.w ;
					arrowLeft = Math.floor(pxToPerc(_tip.tipDims.w,  ((_tip.anchorDims.x + (_tip.anchorDims.w *0.5)) - _tip.tipDims.x) ) /5) * 5; // fullPX, px
					break;
				
			}
			
			// put it on top of the anchor
			if(_tip.tipDims.y < _tipzy.pageStats.T) {
				arrowV = 'top';
				_tip.tipDims.y = _tip.anchorDims.y + _tip.anchorDims.h + _tip.tipDims.tipyOffset;
			}
									
			_tip.$tip
				.css({
					left: _tip.tipDims.x, 
					top: _tip.tipDims.y 
				})
				.attr({
					'data-tipzyleft': Math.abs(arrowLeft) + '%', 
					'data-tipzyv' : arrowV 
				});
			
		}; // position()
		
		_tip.updateTipDims = function(){
			_tip.tipDims = {
				w : _tip.$tip.outerWidth(),
				h : _tip.$tip.outerHeight(),
				tipxOffset : _tip.anchorDims.w *0.5,
				tipyOffset : 5
			};
		}; // updateTipDims()
		
		_tip.updateAnchorDims= function(){
			_tip.anchorDims = {
				w : $anchor[0].offsetWidth, 
				h : $anchor[0].offsetHeight, 
				x : $anchor.offset().left, 
				y : $anchor.offset().top
			};
		}; // updateAnchorDims()
		
		_tip.show = function(e, position) {
			position = position != undefined ? position : true;
			_tip.updateTipDims();
			if(position)
				_tip.position(e);
			_tip.$tip.attr('aria-hidden', 'false');
		}; // 	show()
		
		_tip.hide = function() {
			_tip.$tip.attr('aria-hidden', 'true');
		}; // 	hide()
		
		_tip.parse(content);
		
		return _tip;
		
	}; // _tip()
	
	//
	// !tipZy methods 
	//
		
	_tipzy.updatePageStats = function() {

		_tipzy.pageStats = {
			T : W.pageYOffset + _tipzy.windowPadding,
			R : W.innerWidth - _tipzy.windowPadding,
			B : W.innerHeight - _tipzy.windowPadding,
			L : W.pageXOffset + _tipzy.windowPadding,
			W : W.innerWidth - (_tipzy.windowPadding *2),
			H : W.innerHeight - (_tipzy.windowPadding *2)
		};
		
	}; // updatePageStats();	
	
	_tipzy.hideAll = function() {
		$.each(_tipzy._tips, function(UID, tip) {
			tip.hide();
		});
	}; // hideAll();
	
	_tipzy.updateAllAnchors = function() {
		$.each(_tipzy._tips, function(UID, tip) {
			tip.updateAnchorDims();
		});
	}; // updateAllAnchors();
	
	
	_tipzy.addTip = function($anchor, tipContent) {
		
		if($anchor.length <= 0) return;
		
		var tip = new _tip($anchor, tipContent);
		console.log('parse : ', tip);
		_tipzy._tips[tip.UID] = tip;
		
		
	}; // addTip()
	
	_tipzy.parseTips = function() {
				
		$("._tipzy_anchor:not('._tipzy_bound')").each(function(){
			
			var $anchor = $(this);
			
			if($anchor.inView(0)) {
				_tipzy.addTip($anchor);
			}
			
		});
		
	}; // parseTips()
	
	
	_tipzy.init = function(args) {
		
		args = args !== undefined ? args : {};
		
		_tipzy.windowPadding = args.windowPadding !== undefined ? args.windowPadding : _tipzy.windowPadding;
				
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