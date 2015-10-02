var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stormpath.init(app, {
  application: process.env.STORMPATH_URL,
  expandedCustomData: true,
  enableForgotPassword: true
}));

app.get('/', function(req, res) {
	res.render('index', {
		title: 'Welcome'
	});
});

app.listen(process.env.PORT || 3000);
