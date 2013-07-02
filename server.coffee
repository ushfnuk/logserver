http = require "http"
url = require "url"
fs = require "fs"
_ = require 'underscore'
mimeTypes = require 'mimetype'

buttonTemplateBuffer = fs.readFileSync(__dirname + '/index_tmpl.html')
contentTemplate = _.template buttonTemplateBuffer.toString()

handler = (req, res)->
    uri = url.parse(req.url).pathname

    switch (uri)
        when '/'
            fs.readFile __dirname + '/index.html', (err, data)->
                throw err if err

                mimeType = mimeTypes.lookup 'index.html', 'UTF-8'
                res.writeHead 200, 'Content-Type': mimeType

                res.write contentTemplate(content: data)
                res.end()

        when '/log/'
            postData = '';
            req.addListener "data", (postDataChunk)->
                postData += postDataChunk;

            req.addListener "end", ->
                fs.appendFile __dirname + '/index.html', "<p>#{postData.replace(/\</g, '&lt;').replace(/\>/g, '&gt;')}</p>"
                fs.appendFile __dirname + '/log.txt', postData + "\n"
                io.sockets.emit 'show', postData

                res.writeHead 200,
                    "Content-Type": "text/plain"
                    "Access-Control-Allow-Credentials": false
                    "Access-Control-Allow-Headers": "origin, authorization, content-type, accept"
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
                    "Access-Control-Allow-Origin": "*"
                    "Access-Control-Max-Age": 10

                res.end()

        when '/favicon.ico'
            console.log 'favicon.ico'

            res.end()

        else
            res.writeHead 200, 'Content-Type': mimeTypes.lookup(uri)
            fs.readFile __dirname + '/' + uri, (err, contents)->
                throw err if err
                res.end contents

app = http.createServer handler
io = require("socket.io").listen(app)

app.listen process.env.PORT, process.env.IP

io.on 'connection', (client)->
    console.log 'Client connected...'

    client.on 'clear', ->
        fs.writeFile __dirname + '/index.html', ''
        fs.writeFile __dirname + '/log.txt', ''

        io.sockets.emit 'clear'

    client.on 'disconnect', ->
        console.log 'Client disconnected...'