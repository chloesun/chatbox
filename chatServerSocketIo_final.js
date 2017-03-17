/*SocketIO based chat room. Extended to not echo messages
to the client that sent them.*/

var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
const mime = require('mime-types');   

http.listen(2406);

console.log("Chat server listening on port 2406");

//var users[];


function handler(req,res){
	fs.readFile("./files/index.html", function(err,data){
		if(err)respondErr(err);
		else respond(200,data);
	});
};

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


//locally defined helper function
//serves 404 files 
function serve404(){
	fs.readFile("files/404.html","utf8",function(err,data){
		if(err)respond(500,err.message);
		else respond(404,data);
	});
}


//locally defined helper function
//responds in error, and outputs to the console
function respondErr(err){
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