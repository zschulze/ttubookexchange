var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

////////////////////////////// Configure app //////////////////////////

app.set('view engine', 'ejs');
app.set('views', './views');

////////////////////////////// Middleware //////////////////////////

//stormpath - login
app.use(stormpath.init(app, {
  application: 'https://api.stormpath.com/v1/applications/5ngJCDCWxd8StjPy9k5JmK',
  secretKey: 'f2f1648b019fc19f79959a2751026add03f9fe5c98a6985c3daa33d000773326',
  apiKeyId: '47F1RAEPE4PVGT5R94DYE9YGI',
  apiKeySecret: 'sRVcBUwz8eO3wM6jTD6SmL7WBmpfhh3uVwcQI/c0GQY',
  expandedCustomData: true,
  enableForgotPassword: true,
  redirectUrl: '/dashboard',
}));

//bootstrap
app.use(express.static(path.join(__dirname, 'bower_components')));

//any css components
app.use(express.static(path.join(__dirname, 'public')));

// body parser
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json 
app.use(bodyParser.json())

////////////////////////////// define routes //////////////////////////

//fake databse
var listItems =  [
	{ id: 1, desc: 'foo' },
	{ id: 2, desc: 'bar' },
	{ id: 3, desc: 'baz' }
];

// home page - get	
app.get('/', function(req, res) {
	
	res.render('index', {
		title: "Textbook Share"
	});
});

// search page - get	
app.get('/search', function(req, res) {

	res.render('search', {
		title: "Search book"
	});
});

// search page - post	
app.post('/search', function(req, res) {
	
	//load data from database (list of books)
	
	res.render('search', {
		title: "Search book"
	});
});

// add listing - get
app.get('/addListing', function (req,res) {
	
	res.render('addListing', {
		title: "Add Listing"
	});
})

// add listing - post
app.post('/addListing', function (req,res) {
	
	//get response body from form
	var a = req.body.author;
	var t = req.body.title;
	var i = req.body.isbn;
	
	//add to database book to database
	
	console.log(req.body.author);
	console.log(req.body.title);
	console.log(req.body.isbn);
	
	res.redirect('/');
})

// Generate a simple dashboard page.
app.get('/dashboard', stormpath.loginRequired, function(req, res) {
  res.send('Hi: ' + req.user.email + '. Logout <a href="/logout">here</a>');
});


////////////////////////////////////////////////////////////////////////

app.listen(process.env.PORT || 3000);
