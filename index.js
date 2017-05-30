var express=require('express');
var mongodb=require('mongodb');
var path=require('path');
var https=require('https');

//heroku git:remote -a img-search-app


var app=express();
app.set('port',(process.env.PORT || 5000));

var MongoClient = mongodb.MongoClient;
var url = 'mongodb://img-user:img-user@ds157571.mlab.com:57571/img-search-app'; 




var database;
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);

    database = db;
	app.listen(app.get('port'), function() {
		console.log('Node app is running on port', app.get('port'));
	});
  }
});

app.get('/', function(req, res) {

	var fileName = path.join(__dirname, 'index.html');
	res.sendFile(fileName, function (err) {
		if (err) {
			console.log(err);
			res.status(err.status).end();
		}
		else {
			console.log('Sent:', fileName);
		}
	});
});


app.get('/api/:img', function(req, res, next) {

	var args;

	if(req.params.img){
		 args = req.params.img;
	}else {
		args = req.query.params;
	}

	var imgurUrl='https://api.imgur.com/3/gallery/search/';
	if (req.query.offset) imgurUrl = imgurUrl + "/offset=" + req.query.offset;

	imgurUrl=imgurUrl+ '/?q=' + req.params.img;
	var searchOptions = {
  		uri: urlForConn,
  		headers:{"Authorization" : 'Client-ID ' + process.env.IMGUR_ID},
    	method: 'GET'
	};

    

	res.send("search me");
});
