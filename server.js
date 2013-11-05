var express = require('express'),
    fs    = require('fs'),
    nconf = require('nconf');

function preloadData(nconf) {
    var bindings = nconf.get('data'),
        data = {};

    for (var data_name in bindings) {
        data[data_name] = require(__dirname + '/data/' + bindings[data_name]);
    }

    for (var portfolio in data.projects) {
        for (var index in data.projects[portfolio]) {
            var item = data.projects[portfolio][index];
            if (typeof item.content !== 'undefined') {
                item.content = item.content.join(' ');
            }
        }
    }

    return data;
}

// Get config
var config_name = 'default.json';
if (typeof process.argv[2] !== 'undefined') {
    config_name = process.argv[2].trim() + '.json';
}
nconf.file({ file: __dirname + '/conf/' + config_name });
var server_conf = nconf.get('server');

// Path to our public directory
var pub = '/static';

var app = express();
app.use(app.router);
app.use(pub, express.static(__dirname + pub));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

var data = preloadData(nconf);

app.get('/', function(req, res){
    res.render('index', data);
});

app.get(/^\/(tweeria|kgs|megatyumen|works)$/i, function(req, res){

    var link = req.params[0];

    switch(link)
    {
        case 'tweeria':
            data.project = {
                "name": 'Tweeria',
                "link": 'http://tweeria.com'
            };
            break;
        case 'kgs':
            data.project = {
                "name": 'Document Management System for Government'
            };
            break;
        case 'megatyumen':
            data.project = {
                "name": 'City Portal',
                "link": 'http://megatyumen.ru'
            };
            break;
        case 'works':
            data.project = {
                "name": 'Random works'
            };
            break;
    }

    res.render('projects/'+link, data);
});

app.listen(server_conf.port, server_conf.host);
console.log('Listening...');