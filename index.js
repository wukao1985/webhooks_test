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
  res.send('<pre>' + received_counts + '</pre>');
});

app.get('/webhooks', function(req, res) {
  console.log(req);
  if (req.param('hub.mode') != 'subscribe'
      || req.param('hub.verify_token') != process.env.VERIFY_TOKEN) {
    console.log('hub.mode is not subscribe');
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
  //console.log(JSON.stringify(req.body, null, 2));
  //received_updates.unshift(req.body);
  received_counts += 1;
  res.sendStatus(200);
});

app.listen(PORT, function() {
  console.log('Starting webhooks server listening on port:' + PORT);
});
