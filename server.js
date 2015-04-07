var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = [];
var roomBosses = [];

app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket){
  console.log('a user connected');
    socket.on('joinRoom', function (roomToJoin){
        var roomIndex = rooms.indexOf(roomToJoin); 
        if(roomIndex != -1){
            socket.join(roomToJoin);
            socket.boss = roomBosses[roomIndex];
            console.log("joined " + roomBosses);
            console.log(socket.roomBoss);
        }else{
           socket.emit("roomClosed"); 
        }
        socket.on('message', function (msg){
            if(msg == 1){
                console.log('got rad for ' + socket.boss);
                //console.log(io.sockets.connected[socket.boss]);
                //io.sockets.socket(socket.boss).emit('vote',1);
            if (io.sockets.connected[socket.boss]) {
                console.log("boss connected");
                    io.sockets.connected[socket.boss].emit('vote', 1);
                }
            }else if(msg == 0){
                console.log('got sad');
                if (io.sockets.connected[socket.boss]) {
                console.log("boss connected");
                    io.sockets.connected[socket.boss].emit('vote', 0);
                }
            }
        });
    });
            
    socket.on('createRoom', function(createdRoom){
        console.log("the boss of " +createdRoom + " is " + socket.id);
        socket.orradRoom = createdRoom;
        io.emit('roomCreated', createdRoom);
        console.log("room created " + createdRoom);
        console.log("room index " + rooms.indexOf(createdRoom));
        if(rooms.indexOf(createdRoom) != -1){
            socket.emit("roomExists");
            return false;
        }else{
            socket.join(createdRoom);
        }
        rooms.push(createdRoom);
        roomBosses.push(socket.id);
        
        return false;
    });
    socket.on('disconnect', function(){
        var index = rooms.indexOf(socket.orradRoom);
        if (index > -1) {
            rooms.splice(index, 1);
            roomBosses.splice(index, 1);
        }
        console.log(rooms);
    });
});
io.on('roomCreated', function (fool) {
    console.log(fool);
});


http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});



//var http = require('http'),
//    fs = require('fs'),
//    // NEVER use a Sync function except at start-up!
//    index = fs.readFileSync(__dirname + '/index.html');
//
//// Send index.html to all requests
//var app = http.createServer(function(req, res) {
//    res.writeHead(200, {'Content-Type': 'text/html'});
//    res.end(index);
//});
//
//// Socket.io server listens to our app
//var io = require('socket.io').listen(app);
//
//// Send current time to all connected clients
//function sendTime() {
//    io.sockets.emit('time', { time: new Date().toJSON() });
//}
//
//// Send current time every 10 secs
//setInterval(sendTime, 10000);
//
//// Emit welcome message on connection
//io.sockets.on('connection', function(socket) {
//    socket.emit('welcome', { message: 'Welcome!' });
//
//    socket.on('i am client', console.log);
//});
//
//app.listen(process.env.PORT || 3000);