var express = require('express');
var LastFmNode = require('lastfm').LastFmNode;
var qs = require('querystring');
var app = express.createServer();

var apiKey = '9d91f7e475e58b5c549df4b2d403a1c7';
var lastfm = new LastFmNode({
  api_key: apiKey,
  secret: '0005026f1b56d1bbd734cc78934993a2'
});

app.configure(function () {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', { 'with':'locals' });
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public')); //do not swap this line and the next --> all static files will get to 404
	app.use(app.router);
});

app.get('/', function (req, res) {
	var callbackUrl = 'http://localhost/callback';
	var obj = { api_key: apiKey , cb: callbackUrl };
	var query = qs.stringify(obj);
	var url = 'http://www.last.fm/api/auth/' + '?' + query;
	res.render('home', { url: url });
});

app.get('/callback', function(req, res){
	var token = req.query.token;
	console.log(token);
	res.render('callback', { data: token});
});

app.listen(80);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);