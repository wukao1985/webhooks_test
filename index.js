'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const xhub = require('express-x-hub');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(xhub({algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var received_updates = [];
var received_counts = 0;

app.get('/', function(req, res) {
  //res.send('<pre>' + JSON.stringify(received_updates, null, 2) + '</pre>');
  res.send('<pre>' + received_counts + '</pre>');

});

app.get('/webhooks', function(req, res) {
  if (req.param('hub.mode') != 'subscribe'
      || req.param('hub.verify_token') != process.env.VERIFY_TOKEN) {
    res.sendStatus(401);
    return;
  }

  res.send(req.param('hub.challenge'));
});

app.post('/webhooks', function(req, res) {
  if (!req.isXHubValid()) {
    console.log('Received webhooks update with invalid X-Hub-Signature');
    res.sendStatus(401);
    return;
  }
  var i = 0;
  //console.log(JSON.stringify(req.body, null, 2));
  for (i = 0; i < req.body.entry.length; i++) {
    received_counts += 1;
    //console.log(Math.round((new Date()).getTime() / 1000) - req.body.entry[i].changes.value.conversion_timestamp, received_counts);
    console.log(Math.round((new Date()).getTime() / 1000) - Date.parse(req.body.entry[i].changes[0].value.conversion_timestamp).getTime()/1000);
  }

  console.log(JSON.stringify(req.body));
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.listen(PORT, function() {
  console.log('Starting webhooks server listening on port:' + PORT);
});
