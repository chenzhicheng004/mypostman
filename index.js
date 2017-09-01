/*
* @Author: chenzhicheng
* @Date:   2017-08-25 15:52:45
* @Last Modified by:   chenzhicheng
* @Last Modified time: 2017-09-01 10:13:23
*/

var express = require('express');
var util = require('./service/util.js');
var route = require('./service/route.js');
var saveParam = require('./service/saveParam.js');

var app = express();
app.set('port', process.env.PORT || 3000);

//处理静态资源
app.use(express.static(__dirname + '/public'));

app.use('/sendReq',function(req,res,next){
	saveParam.save(req,res,next);
});

route.init(app);

util.searchFile();

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port'));
});




