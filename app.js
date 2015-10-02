var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stormpath.init(app, {
  application: 'https://api.stormpath.com/v1/applications/5ngJCDCWxd8StjPy9k5JmK',
  secretKey: 'f2f1648b019fc19f79959a2751026add03f9fe5c98a6985c3daa33d000773326',
  apiKeyId: '47F1RAEPE4PVGT5R94DYE9YGI',
  apiKeySecret: 'sRVcBUwz8eO3wM6jTD6SmL7WBmpfhh3uVwcQI/c0GQY',
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
