var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stormpath.init(app, {
  application: process.env.STORMPATH_URL,
  expandedCustomData: true,
  enableForgotPassword: true,
  redirectUrl: '/dashboard',
}));

app.get('/', function(req, res) {
	res.render('index', {
		title: 'Welcome'
	});
});

// Generate a simple dashboard page.
app.get('/dashboard', stormpath.loginRequired, function(req, res) {
  res.send('Hi: ' + req.user.email + '. Logout <a href="/logout">here</a>');
});

app.listen(process.env.PORT || 3000);
