var express = require('express');
var stormpath = require('express-stormpath');
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var Client = require('node-rest-client').Client;
var api_key = 'key-b0d72613cb383c27201d5dea354c3494';
var domain = 'app60d9918278924dc7aba81dddf2010fb5.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

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

// rest caller client
client = new Client();

////////////////////////////// define routes //////////////////////////

//fake databse
var listItems =  [
	{ id: 1, desc: 'foo' },
	{ id: 2, desc: 'bar' },
	{ id: 3, desc: 'baz' }
];

// home page - get	
app.get('/', function(req, res) {
	
	//if not logged in
	if(req.user == undefined)
	{
		res.render('index', {
			title: "Textbok List",
			user: req.user,
			books: undefined
		});
	
	}else{ //if logged in
		
		var seller = req.user.email;
		var queryString = '';
		queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE seller = "' + seller + '"';
		
		
		connection.getConnection(function(err, connection) {
			
			connection.query(queryString, function(err, rows, fields) {
			 if (err) {
					console.log('error: ', err);
					throw err;
				}
				
				res.render('index', {
					title: "Textbok List",
					user: req.user,
					books: rows
				});
				
				connection.release();
			});
		});
	}
		
	
});

// payment successful - get	
app.get('/paymentSuccessful', function(req, res) {
	
	res.render('paymentSuccessful', {
		title: "Payment Successful",
		user: req.user
	});
});

// account page - get
app.get('/account', stormpath.loginRequired, function(req, res) {
	res.render('account', {
		title: "Account Information",
		user: req.user
	});
});

// account update page - get
app.get('/accountUpdate', stormpath.loginRequired, function(req, res) {
	res.render('accountUpdate', {
		title: "Update Account Information",
		user: req.user
	});
});

// account update page - post
app.post('/accountUpdate', function(req, res) {

	//get reponse body from form
	var givenName = req.body.givenName;
	var surname = req.body.surname;
	var email = req.body.email;
	var password = req.body.password;
	
	req.user.givenName = givenName;
	req.user.surname = surname;
	req.user.email = email;
	req.user.password = password;
	req.user.save();
	
	res.render('account', {
		title: "Account Information",
		user: req.user
	});
});

// search page - get	
app.get('/search', function(req, res) {

	connection.getConnection(function(err, connection) {

		//variables for search params
		var a;
		var t;
		var i;
		var listPerPage = 10;
		var page;
		
		//if search params undefined, then set to blank
		//else set params
		if(req.query.author == undefined)
			a = "";
		else
			a = req.query.author;
			
		if(req.query.titleB == undefined)
			t = "";
		else
			t = req.query.titleB;
			
		if(req.query.isbn == undefined)
			i = "";
		else
			i = req.query.isbn;
		
		if(req.query.page == undefined)
			page = 1;
		else
			page = req.query.page;
		
		var queryString = '';
	
		if(a == "" && t == "" && i == "")
		{
			queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN'
		}else{
			queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE authors = "' + a + '" OR title = "' + t + '" OR book.ISBN = "' + i + '"';
	
		}
			
		//load data from database (list of books)
		connection.query(queryString, function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			var numberOfPages = Math.ceil(rows.length/listPerPage);
			var pageRows = rows.slice((page*10)-10,page*10);
			
			res.render('search', {
			title: "Search book",
			books: pageRows,
			user: req.user,
			next: parseInt(page) + 1 ,
			previous: parseInt(page) - 1,
			page: page,
			numberOfPages: numberOfPages,
			author: a,
			titleB: t,
			isbn: i
			});
			
			connection.release();
		});
	});

});

// search page - post	
app.post('/search', function(req, res) {

	var listPerPage = 10;
	var page = 1;
		
	//get response body from form
	var a = req.body.author;
	var t = req.body.titleB;
	var i = req.body.isbn;
	
	//add to database book to database
	
	console.log(req.body.author);
	console.log(req.body.titleB);
	console.log(req.body.isbn);
	
	var queryString = '';
	
	queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE authors = "' + a + '" OR title = "' + t + '" OR book.ISBN = "' + i + '"';
	
	
	connection.getConnection(function(err, connection) {
		
		connection.query(queryString, function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}

			var numberOfPages = Math.ceil(rows.length/listPerPage);
			var pageRows = rows.slice((page*10)-10,page*10);
			
			res.render('search', {
			title: "Search book",
			books: rows,
			user: req.user,
			next: parseInt(page) + 1 ,
			previous: parseInt(page) - 1,
			page: page,
			numberOfPages: numberOfPages,
			author: a,
			titleB: t,
			isbn: i
			});
			
			connection.release();
		});
	});
});

// buy listing - get
app.get('/buyListing', stormpath.loginRequired, function (req,res) {

	console.log(req.query.id);
	
	var BookId = req.query.id
	
	queryString = 'SELECT * FROM listing INNER JOIN book ON listing.ISBN = book.ISBN WHERE listing.id = "' + BookId + '"';
	
	connection.getConnection(function(err, connection) {
		
		connection.query(queryString, function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			res.render('buyListing', {
			title: "Buy Listing",
			book: rows[0],
			user: req.user
			});
			
			connection.release();
		});
	});
	
});

// buy listing - post
app.post('/buyListing/:id' , function (req,res) {

	console.log(req.params.id);
	
	queryString = 'SELECT * FROM listing INNER JOIN book on listing.ISBN=book.ISBN WHERE id = "' + req.params.id + '"';
	
	connection.getConnection(function(err, connection) {
		
		connection.query(queryString, function(err, rows, fields) {
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			var price = parseFloat(rows[0].price);
			var userEmail = rows[0].seller;
			var title = rows[0].title
			var args = {
			  data: { "actionType":"PAY",    // Specify the payment action
					"currencyCode":"USD",  // The currency of the payment
					"receiverList":{"receiver":[{
						"amount": price,                    // The payment amount
						"email": userEmail}]  // The payment Receiver's email address
					},

					// Where the Sender is redirected to after approving a successful payment
					"returnUrl":"http://localhost:5000/paymentSuccessful",

					// Where the Sender is redirected to upon a canceled payment
					"cancelUrl":"http://Payment-Cancel-URL",
					"requestEnvelope":{
						"errorLanguage":"en_US",    // Language used to display errors
						"detailLevel":"ReturnAll"   // Error detail level
					}
					},
			  headers:{"X-PAYPAL-SECURITY-USERID": "enter360-facilitator_api1.gmail.com",
						"X-PAYPAL-SECURITY-PASSWORD" : "UKSA5ZFGDR4FP9WX",
						"X-PAYPAL-SECURITY-SIGNATURE" : "A06LgMIYm-.fz6k-iMygW-4cvjBCAbkcSAJ7mlerSOukU33U9n594OzC",
						"X-PAYPAL-APPLICATION-ID" : "APP-80W284485P519543T",
						"X-PAYPAL-REQUEST-DATA-FORMAT" : "JSON",
						"X-PAYPAL-RESPONSE-DATA-FORMAT" : "JSON"} 
			};
			
			// update listing with active
			 
			
			client.post("https://svcs.sandbox.paypal.com/AdaptivePayments/Pay", args, function(data,response) {
				// parsed response body as js object 
				//obj = JSON.parse(data);
				//obj2 = JSON.parse(response);
				console.log(data.paymentExecStatus);
				console.log(data.payKey);
				
				
				res.redirect('https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey=' + data.payKey);
				
				var data = {
				from: 'TTU Book Exchange <TTUBookExchange@app60d9918278924dc7aba81dddf2010fb5.mailgun.org>',
				to: req.user.email,
				subject: 'Your Purchase Summary from TTU Book Exchange',
				text: 'You have purchased ' + title + ' from ' + userEmail + ' for $' + price + '. Please reach out to the seller to schedule a meetup time to receive your purchase.'
				};
				
				mailgun.messages().send(data, function (error, body) {
				console.log(body);
				});
				
				data = {
				from: 'TTU Book Exchange <TTUBookExchange@app60d9918278924dc7aba81dddf2010fb5.mailgun.org>',
				to: userEmail,
				subject: 'Your Listing Sale Summary from TTU Book Exchange',
				text: 'Your listing for ' + title + ' has been purchased by ' + req.user.email + ' for $' + price + '. Please reach out to the buyer to schedule a meetup time to deliver your book.'
				};
				
				mailgun.messages().send(data, function (error, body) {
				console.log(body);
				});
			
				// raw response 
				//console.log(responseEnvelope.);
			});
	
			connection.release();
		});
	});
	

		
})

// add listing - get
app.get('/addListing', stormpath.loginRequired, function (req,res) {


	res.render('addListing', {
		title: "Add Listing",
		user: req.user
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
	console.log(req.user.email);
	
	//add to database book to database
	var listing = { ISBN: i, price: p, condition: c, active: 1, seller: req.user.email};
	
	connection.getConnection(function(err, connection) {
		
		connection.query('INSERT INTO listing SET ?', listing, function(err,res){
		 if (err) {
				console.log('error: ', err);
				throw err;
			}
			
			console.log('Last insert ID:', res.insertId);
			var data = {
				from: 'TTU Book Exchange <TTUBookExchange@app60d9918278924dc7aba81dddf2010fb5.mailgun.org>',
				to: req.user.email,
				subject: 'New Listing',
				text: 'You have posted a new listing! We will notify you once it has sold.'
				};
				
			mailgun.messages().send(data, function (error, body) {
			console.log(body);
			});
			
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
