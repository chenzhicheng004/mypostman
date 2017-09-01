/*
* @Author: chenzhicheng
* @Date:   2017-08-25 16:48:05
* @Last Modified by:   chenzhicheng
* @Last Modified time: 2017-09-01 10:10:17
*/
var ejs = require('ejs');
var fs = require('fs');
var util = require('./util.js');
//用于解析post请求体中的参数

var route = {
	init : function(app){
		app.use(require('body-parser')());
		this.addRoute(app, '/index', this.handleIndex);
		this.addRoute(app, '/sendReq', this.handleSendReq);
	},

	addRoute : function(app, path, handler){
		app.get(path, handler);
	},

	handleIndex : function(req,res){
		var str = fs.readFileSync(__dirname + '/view/index.html', 'utf8');
		var result = ejs.render(str,{requestUrlArr : util.requestUrlArr});
		res.send(result);
	},

	handleSendReq : function(req,res){
		var url = req.query.url;
		var method = req.query.method;
		var paramStr = req.query.paramJSON;
		var param = null;
		if(paramStr.length){
			param = JSON.parse(paramStr);
		}
		var urlInfo = util.parseUrl(url);
		util.sendReq(urlInfo.hostname,urlInfo.port,urlInfo.path,method,param,function(remoteRes){
			remoteRes.setEncoding('utf8');  
			remoteRes.on('data', function (chunk) {  
		        res.send(chunk); 
		    });
		},function(err){
			res.send('request failed'); 
		});
	}
};

module.exports=route;