$(document).ready(function() {
	
	_tipzy.init();	
	
	var tip1 = _tipzy.addTip($("#demo_add_later"), 'I manually added this on docready');
	var tip2 = _tipzy.addTip($("#demo_add_later2"), 'I manually added this on docready- also as well too');
	
	$("#triggerOther")
		.on('click', function(e){
			_tipzy.showTip(tip1.UID, 5000);
		});
		
	var tipContent = 'I changed the tip content!';
	
	$("#changeContent")
		.on('click', function(e){
			_tipzy.setContent(tip1.UID, tipContent);
			_tipzy.showTip(tip1.UID, 5000);
			
			tipContent = tipContent + ' <strong>AGAIN</strong>';
			
		});
		
	$("#hideTip")
		.on('click', function(e){

			_tipzy.hideTip(tip1.UID);
						
		});
		

});
