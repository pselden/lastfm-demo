var express = require('express');
var app = express.createServer();

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
	res.render('home')
});

app.listen(80);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);