/*
 * @Author: chenzhicheng
 * @Date:   2017-08-26 11:24:48
 * @Last Modified by:   chenzhicheng
 * @Last Modified time: 2017-09-01 16:13:48
 */
var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var qs=require('querystring'); 

var util = {

    urlInfo: [],
    parse: false,
    requestUrlArr : [],

    sendReq: function(hostname, port, path, method, param, success, err) {        
        if(method === 'get' && param != null){
            path = path + '?' + qs.stringify(param);
        }
        var options = {
            hostname: hostname,
            port: port,
            path: path,
            method: method
        };
        if(method === 'post'){
            var data = qs.stringify(param);
            options.headers = {  
                "Content-Type": 'application/x-www-form-urlencoded',  
                "Content-Length": data.length  
            }  
        }

        var req = http.request(options, success);
        req.on('error', err);
        if(method === 'post' && param != null){
            console.log(qs.stringify(param));
            req.write(qs.stringify(param) + '\n');
        }
        req.end();
    },

    parseUrl: function(url) {
        //http://localhost/msg/testException
        var protocol = null;
        if (url.startsWith('https')) {
            protocol = 'https';
        } else {
            protocol = 'http';
        }
        
        var hostname = url.substring(url.indexOf("//") + 1, url.indexOf("//") + url.indexOf(':') + 1);
        var tmp = url.replace(hostname + ':', '');
        var port = tmp.substring(0,tmp.indexOf('/'));
        var path = url.replace(hostname + ':' + port, '');
        return {
            protocol: protocol,
            hostname: hostname,
            port: port,
            path: path
        };
    },

    searchFile: function() {
        var cmdStr = 'find . -type f |xargs grep \"@Controller\"|grep \"\.java\"';
        var _this = this;
        exec(cmdStr, function(err, stdout, stderr) {
            if (err) {
                console.log('searchFile error:' + stderr);
            } else {
                _this.parseControllers(stdout);
            }
        });

        var ctrls = -1;
		var times = 0;
		var id = setInterval(function(){
			if(_this.urlInfo.length > 0){
				if(_this.urlInfo.length === ctrls){
					times++;
				}
				if(times >= 5){
					console.log('parse constroller end...');
					console.log(JSON.stringify(_this.urlInfo));
					clearInterval(id);
					_this.parse = true;
                    _this.assembleUrl();
				}else{
					console.log('parse last controller...');
				}
				ctrls = _this.urlInfo.length;
			}else{
				console.log('parsing...');
			}

		},1000);
    },

    assembleUrl : function(){
        for(var i = 0;i < this.urlInfo.length;i++){
            var item = this.urlInfo[i];
            var requestUrl = this.getRequestUrlItem(item.conName);
            if(!requestUrl){
                var requestUrl = {};
                requestUrl.conName = item.conName;
                requestUrl.urlArr = [];
                this.requestUrlArr.push(requestUrl);
            }
            var url = {};
            url.path = item.path;
            url.params = item.params;
            requestUrl.urlArr.push(url);
        }
    },

    getRequestUrlItem : function(conName){
        for(var i = 0;i < this.requestUrlArr.length;i++){
            var item = this.requestUrlArr[i];
            if(item.conName === conName){
                return item;
            }
        }
        return null;
    },

    parseControllers: function(result) {
        if (result.length <= 0) {
            return;
        }

        var exepath = process.cwd();
        var arr = result.split('\n');
        //解析每一个controller
        for (var i = 0; i < arr.length - 1; i++) {
            var str = arr[i];
            var conName = str.substring(str.lastIndexOf('/') + 1,str.length - 12);

            //获取controller所在项目的tomcat端口号
            var moduleName = str.substring(2);
            moduleName = moduleName.substring(0, moduleName.indexOf('/'));
            var port = this.getPort(exepath + '/' + moduleName + '/pom.xml');

            //获取controller中配置的http请求路径
            var ctrllerFilePath = exepath + str.substr(1);
            ctrllerFilePath = ctrllerFilePath.substr(0, ctrllerFilePath.indexOf(':'));
            var className = ctrllerFilePath.substr(ctrllerFilePath.lastIndexOf('/') + 1);
            className = className.substr(0, className.length - 5);
            var data = fs.readFileSync(ctrllerFilePath, "utf-8");

            //获取注解在controller类上的RequestMapping
            var head = data.substr(0, data.indexOf('class ' + className));
            var r = head.match(/RequestMapping\(\"\/.*?\"\)/);
            var rootPath = '/';
            if (r != null) {
                var s = r[0];
                rootPath = s.substring(16, s.length - 2);
            }
            if (rootPath.startsWith('/') === false) {
                rootPath = '/' + rootPath;
            }

            this.parseMethod(data.substring(head.length), rootPath, port, conName);
        }
    },

    parseMethod: function(controllerBody, rootPath, port, conName) {
        var r = controllerBody.match(/RequestMapping[^0-9]*?\{/g);
        if (r == null) {
            return;
        }

        //处理每一个RequestMapping
        for (var j = 0; j < r.length; j++) {
            var methodData = r[j];
            var arr = methodData.split('\n');
            for (var k = 0; k < arr.length; k++) {
                var line = arr[k];
                if (line.indexOf('RequestMapping') >= 0) {
                    var path = line.substring(16, line.length - 2);
                    path = 'localhost:' + port + rootPath + path;

                    var obj = {};
		        	obj.conName = conName;
		        	obj.path = path;
		        	obj.params = [];
		        	this.urlInfo.push(obj);
                }
                if (line.indexOf('{') >= 0) {
                    var r2 = line.match(/\(.*?\)/);
                    if (r2 == null) {
                        continue;
                    }
                    var params = r2[0];
                    this.parseParams(params, path);
                }
            }
        }
    },

    parseParams: function(params, path) {
        var str = params.substring(1, params.length - 1);
        if (str.trim().length <= 0) {
            return;
        }

        var obj = this.getController(path);
        var paramArr = str.split(',');
        for (var i = 0; i < paramArr.length; i++) {
            var paramInfo = paramArr[i].trim().split(' ');
            var type = paramInfo[0];
            var name = paramInfo[1];
            var param = {};
            if (this.isSimpleType(type)) {
                param.name = name;
            	obj.params.push(param);
            } else if (this.isServletApi(type)) {

            } else {
                this.readTypeFile(type, path);
            }
        }
    },

    readTypeFile: function(type, urlpath) {
        var cmdStr = 'find . -name ' + type + '\.java';
        var exepath = process.cwd();
        var _this = this;
        exec(cmdStr, function(err, stdout, stderr) {
            if (err) {
                console.log('readTypeFile error:' + stderr);
            } else {
                var path = exepath + stdout.substring(1).trim();
                var data = fs.readFileSync(path, "utf-8");
                _this.parseTypeFile(data, urlpath);
            }
        });
    },

    parseTypeFile: function(data, path) {
        var r = data.match(/private.*?;/g);
        if (r == null) {
            return;
        }
        var obj = this.getController(path);
        for (var i = 0; i < r.length; i++) {
            var fieldInfo = r[i].split(' ');
            var name = fieldInfo[2];
            var param = {};
            param.name = name.substring(0,name.length - 1);
            obj.params.push(param);
        }
    },

    isSimpleType: function(type) {
        return type === 'int' || type === 'Integer' || type === 'long' ||
            type === 'Long' || type === 'String';
    },

    isServletApi: function(type) {
        return type === 'HttpServletRequest' || type === 'HttpServletResponse';
    },

    getPort: function(filepath) {
        var data = fs.readFileSync(filepath, "utf-8");
        var reg = /<port>[0-9]*<\/port>/;
        var r = data.match(reg);
        var port = null;
        if (r != null) {
            var s = r[0];
            port = s.substring(6, s.length - 7);
        }
        return port;
    },

    getController : function(path){
    	for(var i = 0;i < this.urlInfo.length;i++){
    		if(this.urlInfo[i].path === path){
    			return this.urlInfo[i];
    		}
    	}
    	return null;
    }

}

module.exports = util;