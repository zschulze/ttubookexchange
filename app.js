var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

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
  redirectUrl: '/',
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

//create connection to DB
var connection = mysql.createPool({
  host     : 'us-cdbr-iron-east-03.cleardb.net',
  user     : 'bc4b936c54894e',
  password : 'f5a438e8',
  database : 'heroku_ec58093a778ea0c'
});




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
		title: "Textbok List"
	});
});

// search page - get	
app.get('/search', function(req, res) {

	connection.getConnection(function(err, connection) {

		//load data from database (list of books)
		connection.query('SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN', function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			res.render('search', {
			title: "Search book",
			books: rows
			});
			
			connection.release();
		});
	});

});

// search page - post	
app.post('/search', function(req, res) {

	
	//get response body from form
	var a = req.body.author;
	var t = req.body.title;
	var i = req.body.isbn;
	
	//add to database book to database
	
	console.log(req.body.author);
	console.log(req.body.title);
	console.log(req.body.isbn);
	
	var queryString = '';
	
	if(a == "")
	{
		queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE book.title = "' + t + '" ';
	}else if(t == "")
	{
		queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE authors = "' + a + '" ';
	}else
	{
		queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE authors = "' + a + '" AND title = "' + t + '" ';
	}
	
	connection.getConnection(function(err, connection) {
		
		connection.query(queryString, function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}

			for (var i = 0; i < rows.length; i++) {
			console.log(rows[i]);
			};
			
			res.render('search', {
			title: "Search book",
			books: rows
			});
			
			connection.release();
		});
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
	var i = req.body.isbn;
	var p = parseFloat(req.body.price);
	var c = req.body.condition;
	
	console.log(i);
	console.log(p);
	console.log(c);
	
	//add to database book to database
	var listing = { ISBN: i, price: p, condition: c, active: 1 };
	
	connection.getConnection(function(err, connection) {
		
		connection.query('INSERT INTO listing SET ?', listing, function(err,res){
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			console.log('Last insert ID:', res.insertId);
			
			connection.release();
		});
	});
	
	res.redirect('/');
})

// Generate a simple dashboard page.
app.get('/dashboard', stormpath.loginRequired, function(req, res) {
  res.send('Hi: ' + req.user.email + '. Logout <a href="/logout">here</a>');
});


////////////////////////////////////////////////////////////////////////



app.listen(process.env.PORT || 3000);
