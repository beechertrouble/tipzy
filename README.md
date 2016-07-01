# tipzy
tooltips, simple and accessible

## generally
- default to a title attr ( for people with noscript )
- mind your arias for screenreaders ...
- animations with css - because that's usually more performant
- js for positioning & class swappings


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
	class="_tipzy_anchor" 
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
	<div class="">
		<i>"fancy" text</i> tooltip content here
	</div>
</div>
```