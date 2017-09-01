/*
 * @Author: chenzhicheng
 * @Date:   2017-08-31 17:32:08
 * @Last Modified by:   chenzhicheng
 * @Last Modified time: 2017-09-01 15:44:41
 */
var util = require('./util.js');
var qs=require('querystring');
var fs = require('fs');
var saveParam = {

    save: function(req, res, next) {
        var paramStr = req.query.paramJSON;
        var url = req.query.url;
        if (!paramStr && url.indexOf('?') <= 0) {
            return;
        }

        var param = null;
        if(url.indexOf('?') > 0){
            param = qs.parse(url.substring(url.indexOf('?') + 1));
            url = url.substring(0,url.indexOf('?'));
            req.query.paramJSON = JSON.stringify(param);
            req.query.url = url;
        }else{
            param = JSON.parse(paramStr);
        }

        var urlInfo = util.getController(url);
        var paramNameArr = urlInfo.params;
        
        for(var i = 0;i < paramNameArr.length;i++){
            var value = param[paramNameArr[i].name];
            if(value){
                paramNameArr[i].value = value;
            }
        }

        // var str = JSON.stringify(util.urlInfo);
        // fs.writeFileSync(__dirname + '/param.tmp', str);

        next();
    },

    getParamValues : function(url){
    	for (var i = 0; i < this.paramInfoArr.length; i++) {
    		if(this.paramInfoArr[i].url === url){
    			return this.paramInfoArr[i].paramInfo;
    		}
    	}
    	return null;
    }
};

module.exports = saveParam;