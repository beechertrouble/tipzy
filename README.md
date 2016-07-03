# tipzy
tooltips, simple and accessible

## generally
- default to a title attr ( for people with noscript )
- mind your arias for screenreaders ...
- animations with css - because that's usually more performant
- js for positioning & `aria-hidden` swappings


### markup
i.e. : 
```html
<span 
	class="_tipzy_anchor" 
	tilte="plain text tooltip content here" 
	data-tipzycontent="&#x3C;i&#x3E;&#x22;fancy&#x22; text&#x3C;/i&#x3E; tooltip content here"
>
The Thing You Hover/Focus On To Be Shown The ToolTip
</span>
```

- will be turned into anchor markup like : 
```html
<span 
	class="_tipzy_anchor _tipzy_bound" 
	data-tipzycontent="&#x3C;i&#x3E;&#x22;fancy&#x22; text&#x3C;/i&#x3E; tooltip content here" 
	aria-describedby="_tipzy-182301928" 
	data-tipzytitle="plain text tooltip content here" 
>
The Thing You Hover/Focus On To Be Shown The ToolTip
</span>
```

- and will add a tip to the document with markup like : 
```html
<div 
	id="_tipzy-182301928" 
	class="_tipzy" 
	role="tooltip" 
	aria-hidden="true"
>
	<div class="_tipzy_content">
		<i>"fancy" text</i> tooltip content here
	</div>
</div>
```

### style things 
- showing / hiding tips using the `[aria-hidden]` selector
- arrows added with pseudo elements
- using css keyframe animation to fade the tips in and out


#### less 
- less files are included in the `/dist/` dir so that tips can be styles with your less flow to match whatever project.
- general idea is to only change stuff in the `__tipzyVars.less` file, but obviously sometimes more is required.


#### css 
- css minified and unminified are also available.



### javascript things
- used to create the tooltips, and toggle the `aria-hidden` attribute ... also to position them so they fit in the window, also to determine the arrow position ...
- a few versions of the js are available ( both minified and unminified ): 
	- `tipzy.full.js` - this has all the required libraries built in ( except jquery of course )
	- `tipzy.amd.js` - define style for like require.js
	- `tipzy.main.js` - this expects you already have the required libraries in there and is not amd stylz
- basic usage is automagical - set it and forget it like 
```javascript
	
	_tipsy.init();
	
```
- you can pass it some args - here's a simple example - might be more args later ...
```javascript
	
	var args = {
		windowPadding : 0 // this will make it so tips butt right up against the edges of the window ( defaults to 10 )
	};
	
	_tipsy.init(args);
	
```

#### other methods

- `_tipzy.parseTips();` - to parse any tip anchors that are visible on the page 

- `_tipzy.addTip($anchor, tipContent);` - to manually add a tip to a jquery object in the dom, tipContent is optional

- `_tipzy._tips[tip_uid_here].setContent('derp');` - to change the content of a tooltip 

## todo : 
- browser / device testing 

## maybe : 
- callbacks?
- tip content from existing element in dom?
- sass support?
- should these be tabbable if the element itself isn't (so you can focus on the element and see the tip)?


