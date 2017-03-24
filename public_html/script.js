$(document).ready(function(){
		
			var username = prompt("What's your name?")||"User";
			
			// var socket = io(); //connect to the server that sent this page
			var socket = io.connect();

			socket.on('connect', function(){
				socket.emit("intro", username);
			});
			
			//send message 
			$('#inputText').keypress(function(ev){
					if(ev.which===13){
						//send message
						socket.emit("message",$(this).val());
						ev.preventDefault(); //if any
						$("#chatLog").append((new Date()).toLocaleTimeString()+", "+username+": "+$(this).val()+"\n")
						$(this).val(""); //empty the input
					}
			});
			
			//send message 
			socket.on("message",function(data){
				$("#chatLog").append(data+"\n");
				$('#chatLog')[0].scrollTop=$('#chatLog')[0].scrollHeight; //scroll to the bottom
			});

            //get users, data is json from server 
			socket.on("userList", function(data){
				var html ='';
				for(i=0; i<data.length; i++){
					html +='<li id="userItem">' +data[i]+ '</li>' ;
				}
                $("#userList").html(html);
			});


		});