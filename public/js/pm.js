/*
* @Author: chenzhicheng
* @Date:   2017-08-25 17:47:54
* @Last Modified by:   chenzhicheng
* @Last Modified time: 2017-09-01 13:59:19
*/

$(function(){
    var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;
		var links = this.el.find('.link');
		links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
	};
	Accordion.prototype.dropdown = function(e) {
		var $el = e.data.el;
		var $this = $(this);
		var	$next = $this.next();

		$next.slideToggle();
		$this.parent().toggleClass('open');
	};	
	var accordion = new Accordion($('#accordion'), false);

	$('#addTabBtn').click(function(){
		addTab();
	});

	$('.submenu-item a').click(function(){
		var url = $(this).text();
		var curTabs = $('#tt').tabs('getSelected');
		curTabs.find(".url").attr('value',url);

		curTabs.find('.dynamicAdd').remove();  
		var paramData = $(this).next().val();
		var paramArr = JSON.parse(paramData);
		if(!paramArr.length){
			curTabs.find('.paramsDiv').append('<div class="dynamicAdd"><input type="text" name="paramName" value="" /><input type="text" name="paramValue" value="" /><input type="text" name="paramDesc" value="" readonly="readonly"/></div>');
			return;
		}
		
		for(var i = 0;i < paramArr.length;i++){
			var obj = paramArr[i];
			if(obj.value){
				curTabs.find('.paramsDiv').append('<div class="dynamicAdd"><input type="text" name="paramName" value="'+obj.name+'" /><input type="text" name="paramValue" value="' + obj.value + '" /><input type="text" name="paramDesc" value="" readonly="readonly"/></div>');
			}else{
				curTabs.find('.paramsDiv').append('<div class="dynamicAdd"><input type="text" name="paramName" value="'+obj.name+'" /><input type="text" name="paramValue" value="" /><input type="text" name="paramDesc" value="" readonly="readonly"/></div>');
			}
		}

		curTabs.find('.paramsDiv').removeClass('hideParamDiv');
		curTabs.find('.remoteRes').text('');
	});

	$('.params').click(clickParams);
	$('.formatRes').click(clickRormatRes);
	$('.send').click(clickSend);
});

function clickSend(){
	var $this = $(this);
	var url = $this.parent().find('.url').val();
	if(!url){
		return;
	}
	var method = $this.parent().find('.method').val();
	var paramJSON = {};
	if(url.indexOf('?') <= 0){
		var paramNameEles = $('input[name=paramName]');
		var paramValueEles = $('input[name=paramValue]');
		for(var i = 0;i < paramNameEles.length;i++){
			if($(paramValueEles[i]).val()){
				paramJSON[$(paramNameEles[i]).attr('value')] = $(paramValueEles[i]).val();
			}
		}
	}

	$.ajax({
		type : 'get',
		url : '/sendReq',
		data : {
			url : url,
			method : method,
			paramJSON : JSON.stringify(paramJSON)
		},
		success : function(res){
			$this.parent().siblings('.content-body').find('.remoteRes').text(res);
		}
	});
}

function clickParams(){
	$(this).parent().siblings('.paramsDiv').toggleClass('hideParamDiv');
}

function clickRormatRes(){
	var remoteRes = $('#tt').tabs('getSelected').find('.remoteRes');
	var data = remoteRes.text();
	if(!data){
		return;
	}
	var json = eval('(' + data + ')');
	console.log(json);
	var options = {
      collapsed: false,
      withQuotes: false
    };
    remoteRes.jsonViewer(json, options);
}

function addTab(){
	$('#tt').tabs('add',{
		title: 'Tab',
		content: $('#content').html(),
		closable: true
	});
	var curTabs = $('#tt').tabs('getSelected');
	curTabs.find('.params').click(clickParams);
	curTabs.find('.formatRes').click(clickRormatRes);
	curTabs.find('.send').click(clickSend);
	
	curTabs.find('.paramsDiv').addClass('hideParamDiv');
}