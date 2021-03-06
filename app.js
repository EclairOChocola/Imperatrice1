var url 				= require('url');
var params 			= require('params');
var querystring = require('querystring');
var express 		= require('express');
var app 				= express();
var http 				= require('http');
var https 			= require('https');
var server 			= http.createServer();
var async 			= require('async');
var request 		= require('request');
var YFsubs 			= require("yify-subs");

// Var globals
var nbRequetes = 0;
var nbConnexions = 0;

app.use(express.static(__dirname));

app.get('/details', function(req, res) {
	var donnees = "";
	var valeur;
	if(req.query.id) {
		valeur = req.query.id;
	} else {
		valeur = "10";
	}
	var urlDetails = "https://yts.ag/api/v2/movie_details.json?movie_id="+ valeur +"&with_images=true&with_cast=true";
	var urlSuggestions ="https://yts.ag/api/v2/movie_suggestions.json?movie_id="+ valeur;

		async.parallel([
		function(callback) {
			request(urlDetails, function(err, response, body) {
				obj = JSON.parse(body);
				obj.data.movie.subtitles = false;
				YFsubs.getSubs(obj.data.movie.imdb_code).then(function(data){
					obj.data.movie.subtitles = data;
				});
				callback(false, obj);
			});
		},
		function(callback) {
			request(urlSuggestions, function(err, response, body) {
				obj = JSON.parse(body);
				// console.log(obj);
				callback(false, obj);
			});
		},],
		function(err, results) {
			res.render('overpass.ejs', {elements: results[0].data.movie, suggestions: results[1].data} );
		});
});



app.get('/', function(req, res) {
	var url1 = 'https://yts.ag/api/v2/list_movies.json?limit=50&page=1&' ;
	if(req.query.genre && req.query.sort_by) {
		 url1 += 'sort_by='+ req.query.sort_by +'&genre=' + req.query.genre;
	} else if(req.query.sort_by) {
		 url1 += 'sort_by=' + req.query.sort_by;
	}else if(req.query.genre) {
		 url1 += 'genre=' + req.query.genre;
	}else {
		 url1 += 'sort_by=year';
	}
	var url2 = "http://remydumas.com/api/genre";

	async.parallel([
	function(callback) {
		request(url1, function(err, response, body) {
			obj = JSON.parse(body);
			callback(false, obj);
			//console.log(obj.data);
		});
	},
	function(callback) {
		request(url2, function(err, response, body) {
			obj = JSON.parse(body);
			//console.log(obj);

			callback(false, obj);
		});
	},],
	function(err, results) {
		res.render('APIs.ejs', {api1:results[0].data, api2:results[1]} );
	});
});



app.get('/compte/creation', function(req, res) {
	if(req.query.pseudo && req.query.mail && req.query.pass) {
		var pseudo = req.query.pseudo;
		var mail = req.query.mail;
		var pass = req.query.pass;
		console.log(pseudo + " " + mail + " " + pass);

		var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('mydb.db');
		db.serialize(function() {
		db.run('CREATE TABLE IF NOT EXISTS user (id INT AUTO_INCREMENT PRIMARY KEY, pseudo varchar(100) not null, mail varchar(100) not null, pass varchar(100) not null)');
		db.all("SELECT * FROM user", function(err, row) {
	    console.log(row.id + ": " + row.pseudo);
		});
		db.run('INSERT INTO user(pseudo,mail,pass) VALUES ('+ pseudo +','+ mail +','+ pass +')');
		});
		db.close();
	} else {
	}

	res.render('creation_compte.ejs', {});
});

//================================================================
//================================================================






//================================================================
//================================================================
/*var donnees;
var url = "http://overpass-api.de/api/interpreter?[out:json];%28node[amenity=bar]%2845.15414,5.677606,45.214077,5.753118%29;%29;out;";
var reqOverpass = http.get(url, function(resOverpass){
	resOverpass.on('data', function(data) {
		console.log('Reception de données :\n' + data);
	});

	resOverpass.on('end', function(res){
		console.log('La requete est terminee.');
		//JSON.parse(donnees);
		res.render('overpass.ejs', {elements: donnees}); //console.log("sortie");
	});
});
reqOverpass.end();
reqOverpass.on('error', function(e) {
	console.error(e);
});*/


/*reqOverpass.end();*/
//================================================================
//================================================================






//================================================================
//================================================================
app.use(function(req, res) {
res.send('La page demandée n\'existe pas');
});

server.on('request', function(req, res) {
	res.writeHead(200);
	nbRequetes ++;
});

server.on("connection", function () {
	if (nbConnexions >= 2) {
		server.close();
	} else {
		nbConnexions ++;
	}
});
app.listen(8181);
//================================================================
//================================================================
