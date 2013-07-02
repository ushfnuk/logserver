var http = require("http"),
    url = require("url"),
    fs = require("fs"),
    _ = require('underscore'),
    Emitter = require('events').EventEmitter,
    emitter = new Emitter(),
    
    buttonTemplateBuffer = fs.readFileSync(__dirname + '/index_tmpl.html'),
    contentTemplate = _.template(buttonTemplateBuffer.toString());

var handler = function(req, res) {
    var uri = url.parse(req.url).pathname;
    
    switch (uri) {
        case '/':
            fs.readFile(__dirname + '/index.html', function(err, data) {
                if (err) throw err;
                
                res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});

                res.write(contentTemplate({content: data}));
                res.end();
            });
        break;
        
        case '/log/':
                var postData = '';
                req.addListener("data", function(postDataChunk) {
                    postData += postDataChunk;
                });
                
                req.addListener("end", function() {
                    fs.appendFile(__dirname + '/index.html', '<p>' + postData + '</p>');
                    emitter.emit('show', postData);
                    
                    res.writeHead(200, {
                        "Content-Type": "text/plain",
                        "Access-Control-Allow-Credentials": false,
                        "Access-Control-Allow-Headers": "origin, authorization, content-type, accept",
                        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Max-Age": 10
                    });
                    res.end();
                });
        break;
        
        default:
            res.end();
        break;
    }
};

var app = http.createServer(handler),
    io = require("socket.io").listen(app);

app.listen(process.env.PORT, process.env.IP);

io.sockets.on('connection', function (client) {
    console.log('Client connected...');

    client.on('clear', function() {
        fs.writeFile(__dirname + '/index.html', '');
        io.sockets.emit('clear');
    });
    
    emitter.on('show', function(postData) {
        client.emit('show', postData);
    });
});