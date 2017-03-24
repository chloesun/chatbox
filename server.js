//An asynchronous server that serves static files

// load necessary modules
var http = require('http').createServer(handleRequest);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./public_html";
var users = [];
var clients =[];

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
	//clients.push(socket);
	console.log("Got a connection", clients.length);


	socket.on("intro",function(data){
		clients.push(socket);
		socket.username = data;
		users = getUserList();
		console.log(users);
		io.emit("userList", users);
		socket.broadcast.emit("message", timestamp()+": "+socket.username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+socket.username+".");
	});

	//send message
	socket.on("message", function(data){
		console.log("got message: "+data);
		socket.broadcast.emit("message",timestamp()+", "+socket.username+": "+data);
		
	});

    //disconnect
    socket.on("disconnect", function(){
    	console.log(socket.username+" disconnected");
    	//users.splice(users.indexOf(socket.username),1);
        // to remove a user from the list
    	clients = clients.filter(function(ele){  
    		return ele!==socket;
    	});
    	updateUsernames();
		io.emit("message", timestamp()+": "+socket.username+" disconnected.");
	});

	//new user
	socket.on("new user", function(data, callback){
		callback(true);
		socket.username = data;
		//clients.push(socket);
		//users.push(data);
		updateUsernames();
	})

	function updateUsernames(){
		users = getUserList();
		io.emit("userList", users);
	}

	function getUserList(){
		var ret = [];
		for(var i=0;i<clients.length;i++){
			ret.push(clients[i].username);
		}
		return ret;
	}
	
});

function timestamp(){
	return new Date().toLocaleTimeString();
}


