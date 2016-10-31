/**
* tipzy
* v1.0.0
* 2016-10-31 03:01:38 PM 
*/ 

/**
* amd stylez
*/
define('_tipzy', ['jquery', 'endedEvents'], function($, endedEvents) { 
	
	
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
var _tipzy = (function() {
		
	if($ === undefined)
		var $ = typeof jquery !== 'undefined' ? jquery : jQuery;
				
	var W = window,
		_tipzy = {
			inited : false,
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
				
				case(typeof e !== 'object'):
				case(e.originalEvent !== undefined && e.originalEvent.type == 'focus'):
					return false;
				
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
	var _tip = function($anchor, content, args) {
					
		var _tip = {
				UID : makeUID(),
				$anchor : $anchor,
				$tip : $('<div class="_tipzy">'),
				content : '',
				anchorDims : {},
				tipDims : {},
				hideTimeout : null,
				state : {
					parsed : false
				},
				args : typeof args === 'object' ? args : {}
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
			
			if(_tip.args.addClass !== undefined) _tip.$tip.addClass(_tip.args.addClass);
			
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
				.on('blur mouseout',  function(e){ //onMouseout element
					_tip.hide();
				});
			
			if(_tip.args.showOnFocus === undefined || _tip.args.showOnFocus) {
				
				$anchor
					.on('focus', function(e){ 
						_tip.updateAnchorDims();
						_tip.show(e);
					});
				
			}	
				
			
			if(_tip.args.followMouse === undefined || _tip.args.followMouse) {
				
				$anchor
					.on('mouseover mousenter', function(e){ 
						_tip.updateAnchorDims();
						_tip.show(e);
					});
				
			}	
				
			
			_tip.updateAnchorDims();	
			_tip.updateTipDims();
			_tip.position();
			
		}; // parse()
		
		_tip.position = function(e) {
			
			e = getCoords(e);
												
			// default target to center of anchor - unless we have pointer info ...
			var anchorCenter = _tip.anchorDims.x + (_tip.anchorDims.w *0.5),
				target = !e || e.x === 0 ? anchorCenter :  e.x,
				arrowLeft = 50,
				arrowV = 'bottom';
								
			_tip.tipDims.x = target - (_tip.tipDims.w *0.5); // center tip over target
			_tip.tipDims.y = _tip.anchorDims.y - _tip.tipDims.tipyOffset - _tip.tipDims.h;
	
			switch(true) {
				
				// left edge of window
				case(_tip.tipDims.x <= _tipzy.pageStats.L): 
					_tip.tipDims.x = _tipzy.pageStats.L;
					_tip.updateTipDims();
					arrowLeft = Math.floor(pxToPerc(_tip.tipDims.x + _tip.tipDims.w, (_tip.anchorDims.x + (_tip.anchorDims.w *0.5))) /5) * 5; // fullPX, px
					break;
				
				// right edge of window	
				case((_tip.tipDims.x + _tip.tipDims.w - _tipzy.pageStats.L) >= _tipzy.pageStats.R): 
					_tip.tipDims.x = _tipzy.pageStats.R - _tip.tipDims.w ;
					_tip.updateTipDims();
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
			_tip.tipDims.w = _tip.$tip.outerWidth();
			_tip.tipDims.h = _tip.$tip.outerHeight();
			_tip.tipDims.tipxOffset = _tip.anchorDims.w *0.5;
			_tip.tipDims.tipyOffset = 5;
		}; // updateTipDims()
		
		_tip.updateAnchorDims= function(){
			_tip.anchorDims.w = $anchor[0].offsetWidth;
			_tip.anchorDims.h = $anchor[0].offsetHeight;
			_tip.anchorDims.x = $anchor.offset().left; 
			_tip.anchorDims.y = $anchor.offset().top;
		}; // updateAnchorDims()
		
		_tip.show = function(e, position, showFor) {
						
			if(!_tipzy.inited) 
				_tipzy.init();
			
			clearTimeout(_tip.hideTimeout);
			if(showFor !== undefined)
				_tip.hideTimeout = setTimeout(function(){ _tip.hide(); }, showFor);
			
			position = position !== undefined ? position : true;
			_tip.updateTipDims();
			_tip.updateAnchorDims();
			
			if(position)
				_tip.position(e);
				
			_tip.$tip.attr('aria-hidden', 'false');
			
		}; // 	show()
		
		_tip.hide = function() {
			_tip.$tip.attr('aria-hidden', 'true');
			clearTimeout(_tip.hideTimeout);
		}; // 	hide()
		
		_tip.parse(content);
		
		return _tip;
		
	}; // _tip()
	
	
	
	
	
	//
	// !tipZy methods 
	//
		
	_tipzy.updatePageStats = function() {
		
		var wW = $(W).width(),
			wH = $(W).height();
		
		_tipzy.pageStats = {
			T : W.pageYOffset + _tipzy.windowPadding,
			R : wW - _tipzy.windowPadding,
			B : wH - _tipzy.windowPadding,
			L : W.pageXOffset + _tipzy.windowPadding,
			W : wW - (_tipzy.windowPadding *2),
			H : wH - (_tipzy.windowPadding *2)
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
	
	
	_tipzy.addTip = function($anchor, tipContent, args, showImmediately, e) {
		
		if($anchor.length <= 0) return;
		
		var tip = new _tip($anchor, tipContent, args);
		_tipzy._tips[tip.UID] = tip;
		
		if(showImmediately)
			_tipzy._tips[tip.UID].show(e, true);
			
		return _tipzy._tips[tip.UID];
		
	}; // addTip()
	
	
	_tipzy.showTip = function(tipUID, showFor, e) {
		
		_tipzy._tips[tipUID].show(e, true, showFor);			
		
	}; // showTip()
	
	
	_tipzy.setContent = function(tipUID, tipContent) {
		
		_tipzy._tips[tipUID].setContent(tipContent);			
		
	}; // showTip()
	
	_tipzy.hideTip = function(tipUID) {
		
		_tipzy._tips[tipUID].hide();
		
	}; // hideTip
	
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
			
			$("body")
				.on('focus mouseenter', "._tipzy_anchor:not('._tipzy_bound')", function(e){
					
					var $anchor = $(this);
					
					if($anchor.inView(0)) {
						_tipzy.addTip($anchor, undefined, true, e);
					}
					
				});
			
			if(typeof endedEvents === 'object') endedEvents.init();

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
		
		_tipzy.inited = true;
	
	}; // init()
	
	
	return _tipzy;
		
})();
        
        return _tipzy;
        
});