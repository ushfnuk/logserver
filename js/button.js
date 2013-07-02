var server = io.connect('http://logserver-c9-ushfnuk.c9.io');

server.on('clear', function() {
    content.innerHTML = '';
});

server.on('show', function(json) {
    content.innerHTML += '<p>' + json.replace(/\</g, '&lt;').replace(/\>/g, '&gt;') + '</p>';
});

window.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('button');
    window.content = document.getElementById('content');

    button.addEventListener('click', function() {
        server.emit('clear');
    }, false);
}, false);