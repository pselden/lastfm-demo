var express = require('express');
var LastFmNode = require('lastfm').LastFmNode;
var qs = require('querystring');
var async = require('async');
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
	var callbackUrl = 'http://' + req.header('host') + '/callback';
	var obj = { api_key: apiKey , cb: callbackUrl };
	var query = qs.stringify(obj);
	var url = 'http://www.last.fm/api/auth/' + '?' + query;
	res.render('home', { url: url });
});

app.get('/callback', function(req, res){
	var token = req.query.token;
	var session = lastfm.session();

	session.authorise(token);
	session.on('authorised', onAuthorize);
	function onAuthorize(){
		var tasks = createTasks();
		async.parallel(tasks, function(err, results){
			res.render('callback', { data: results });
		});
	}

	function createTasks(){
		var tasks = {};
		tasks.userGetInfo = function(callback){
			lastFmRequest('user.getInfo', {}, callback);
		};

		tasks.userGetFriends = function(callback){
			lastFmRequest('user.getFriends', { user: session.user }, callback)
		};

		tasks.userGetTopArtists = function(callback){
			lastFmRequest('user.getTopArtists', { user: session.user }, callback);
		};

		tasks.userGetTopAlbums = function(callback){
			lastFmRequest('user.getTopAlbums', {user: session.user}, callback);
		};

		tasks.userGetPlaylists = function(callback){
			lastFmRequest('user.getPlaylists', { user: session.user }, callback);
		};

		tasks.userGetTopTracks = function(callback){
			lastFmRequest('user.getTopTracks', { user: session.user }, callback);
		};

		tasks.userGetLovedTracks = function(callback){
			lastFmRequest('user.getLovedTracks', { user: session.user }, callback);
		};

		tasks.userGetRecentTracks = function(callback){
			lastFmRequest('user.getRecentTracks', { user: session.user }, callback );
		};

		return tasks;
	}

	function lastFmRequest(method, parameters, callback){
		parameters.signed = true;
		parameters.sk = session.key;
		var request = lastfm.request(method, parameters);
		request.on('success', function(data){
			callback(null, data);
		});

		request.on('error', function(err){
			callback(null, err);
		});
	}
});



app.listen(process.env.PORT || 80);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);