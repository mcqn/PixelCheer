/* PixelCheer
   (c) Copyright 2014 MCQN Ltd

   Node.js app to watch a Redis server for changes to the
   Cheerlights colour and/or PixelCheer image, and push
   that out to any connected browser clients.

*/

const redis = require('redis');
const redis_client = redis.createClient();

const redis_publish_key = "__keyevent@0__:set";
const redis_cheerlights_key = "cheerlights";
const redis_image_key = "pixelcheer";

const PORT = 8080;
//const HOST = "localhost";
var express = require('express');
var app = express();

app.use('/media', express.static(__dirname + '/media'));
app.use(express.static(__dirname + '/public'));

app.get("/advance_times", function(req, res) {
  redis_client.lrange(redis_key, 0, -1, function(err, result) {
    console.log(result.length + " result:");
    result.forEach(function (reply, i) {
      console.log("    " + i + ": " + reply);
    });
    res.json({ times: result });
  });
});

  app.get("/initial_state", function(req, res) {
    redis_client.get(redis_state_key, function(err, result) {
      res.json({ initial_state: result });
    });
  });

const io = require('socket.io');

if (!module.parent) {
  var server = app.listen(PORT); //, HOST);
  console.log("Express server listening on port %d", PORT);

  const socket = io.listen(server);

  socket.sockets.on('connection', function(io_client) {
    console.log("socket.io connection");
    const subscribe = redis.createClient();
    subscribe.subscribe(redis_publish_key); // listen to messages from channel 'gol'

    subscribe.on("message", function(channel, message) {
      if (message == redis_cheerlights_key) {
        redis_client.get(redis_cheerlights_key, function(err, result) {
          var msg = {};
          msg[redis_cheerlights_key] = result;
          io_client.send(msg);
        });
      } else if (message == redis_image_key) {
        redis_client.get(redis_image_key, function(err, result) {
          var msg = {};
          msg[redis_image_key] = result;
          io_client.send(msg);
        });
      }
    });

    io_client.on('message', function(msg) {
    });

    io_client.on("error", function (err) {
      console.log("Error " + err);
    });

    io_client.on('disconnect', function() {
      subscribe.quit();
    });
  });
}

