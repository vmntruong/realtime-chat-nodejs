var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var mysql = require('mysql');
var io = require('socket.io')(http);


// mysql creation
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatDB"
});

// connect to database
con.connect(function(err) {
    if (!!err) { throw err; }
    else { console.log("Connected to the database !"); }
    
});

// server creation
// var server = http.createServer(function(req, res) {
//     fs.readFile('./index.html', 'utf-8', function(error, content) {
//         res.writeHead(200, {"Content-Type": "text/html"});
//         res.end(content);
//     });
// });
app.use('/', express.static(__dirname + '/public'));



// socket creation
// var io = require('socket.io').listen(server);


// connect to socket
io.on('connection', function(socket) {
    socket.emit('message', 'Vous êtes bien connecté !');
    
    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
        console.log(socket.pseudo + ' est connecté !');
        socket.broadcast.emit('message', socket.pseudo + ' a rejoint le Chat !');
    });
    
    var sql = `SELECT * FROM chatTable order by id desc limit 5`;
    con.query(sql, function (err, result) {
        if (!!err) throw err;
        console.log(result);
        socket.emit('recent-msg', result);
    });
    
    socket.on('message', function(message) {
        
        console.log(socket.pseudo + ' me parle ! Il me dit: ' + message);
        // socket.emit('message', [socket.pseudo, message]);
        socket.broadcast.emit('online-msg', [socket.pseudo, message]);
        message = message.replace(/'/g, "\\'");
        // add to database
        sql = `INSERT INTO chatTable (pseudo, message) VALUES ('${socket.pseudo}', '${message}')`;

        con.query(sql, function (err, result) {
            if (!!err) throw err;
            console.log("1 record inserted");
        });

        
    });

    socket.on("disconnect", function() {
        console.log(socket.pseudo+" est déconnecté !");
        socket.broadcast.emit('disconnect-msg', socket.pseudo +' a quitté le Chat !');
    });
});


http.listen(8080);