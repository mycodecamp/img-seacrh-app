var express=require('express');
var mongodb=require('mongodb');
var path=require('path');
var https=require('https');
var request = require('request');

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


app.get('/api/search/:img', function(req, res) {

	
	//mongodb insert
	var insertData = {
    	term: req.params.img,
    	when: new Date().toISOString()
	};

	database.collection('img-search').findOne({'keyword':req.params.img}, function(error, results) {

		if (error) res.status(404).send(error);

		if (results) {
			console.log('already in collection so no insert');
		}
		else {
			database.collection('img-search').insertOne(insertData, function(err, data) {
              
    			if (err) throw err;   
			});
		}
	});

	// imgurl api 
	var imgurUrl='https://api.imgur.com/3/gallery/search/';	

	if (req.query.offset) imgurUrl = imgurUrl + "/offset=" + req.query.offset;

	var completeUrl=imgurUrl+ '/?q=' + req.params.img;

	var searchOptions = {
  		uri: completeUrl,
  		headers:{"Authorization" : 'Client-ID '+ process.env.IMGURID}, 
    	method: 'GET'
	};

	var returnData=[];

	request(searchOptions, function(error, response, body) {

  		if(error){
    			return res.json({error: "Could not connect to external api."});
  		}else{
  
  			var images = JSON.parse(body);
  		
			var imageInfo = images.data.map(function(item){
				var thumbnail = null;

				if(item.animated===false){
					if(item.type==='image/jpeg')
						thumbnail = 'http://i.imgur.com/' + item.id + "s.jpg";
					
					if(item.type==='image/png')
						thumbnail = 'http://i.imgur.com/' + item.id + "s.png";						
				}

				var jsonVar={
					        url: item.link,
					        snippet: item.description,
					        thumbnail: thumbnail,
					        alt_text: item.title
					    };
    
				returnData.push(jsonVar);
			});
			res.send(returnData);
			res.end();
			returnData=[];
		}
	});	
});


app.get('/api/latest/', function(req, res) {

	database.collection('img-search').find({}, {"_id":0}).toArray(function(err, result) {
		if (err) res.status(404).send(err);

		if(result) res.send(result);
        else return res.json({error: "No prior searches found."});
	});

});
