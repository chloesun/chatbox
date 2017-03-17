//An asynchronous server that serves static files

// load necessary modules
var http = require('http').createServer(handleRequest);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./public_html";

// create http server

http.listen(2406);
console.log('Server listening on port 2406');

function handleRequest(req, res) {
	
	//process the request
	console.log(req.method+" request for: "+req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;

		
	//the callback sequence for static serving...
	fs.stat(filename,function(err, stats){
		if(err){   //try and open the file and handle the error, handle the error
			respondErr(err);
		}else{
			if(stats.isDirectory())	filename+="/index.html";
		
			fs.readFile(filename,"utf8",function(err, data){
				if(err)respondErr(err);
				else respond(200,data);
			});
		}
	});			
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(500,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request


io.on("connection", function(socket){
	console.log("Got a connection");
	var username;
	socket.on("intro",function(data){
		username = data;
		socket.broadcast.emit("message", timestamp()+": "+username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+username+".");
	});

	socket.on("message", function(data){
		console.log("got message: "+data);
		socket.broadcast.emit("message",timestamp()+", "+username+": "+data);
		
	});

	socket.on("disconnect", function(){
		console.log(username+" disconnected");
		io.emit("message", timestamp()+": "+username+" disconnected.");
	});
	
});

function timestamp(){
	return new Date().toLocaleTimeString();
}


