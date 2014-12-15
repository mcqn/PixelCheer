/**
 * Copyright 2014 MCQN Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var dgram = require('dgram');
    var fs = require('fs');
    var redis = require('redis');
    var redis_client = redis.createClient();
    var pc =  require('./pixelcheer');
    var Canvas =  require('canvas');
    var Image = Canvas.Image;
    var image_names = [
        "bauble",
        "bell",
        "frankensanta",
        "godjul",
        "happynewyear",
        "jumper",
        "nose",
        "peacefulsanta",
        "prints",
        "pudding",
        "reindeer",
        "sillysnowman",
        "sleepysanta",
        "tree",
        "xmasfc",
        "yaksmas"
    ];

    function PixelCheer(n) {
        RED.nodes.createNode(this,n);
        this.server = n.server;
        this.port = 11999;
        this.rows = 50;
        this.cols = 50;
        // Load all the images we'll need
        this.images = {}
        for (var img in image_names) {
            this.images[image_names[img]] = new Image;
            this.images[image_names[img]].src = fs.readFileSync(__dirname+"/images/"+image_names[img]+".png");
        }
        // Create a canvas for us to draw on
        this.canvas = new Canvas(this.cols, this.rows);
        this.facade_buffer = new Buffer(this.rows*this.cols*3);
        this.facade = new pc.Facade(this.canvas);
        this.socket = dgram.createSocket("udp4");
        this.currentImage = this.images["bauble"];
        this.currentColour = "red";
        var node = this;

        node.updateBuffer = function() {
            // Dump the canvas out as a bitmap
            var ctx = node.canvas.getContext("2d");
            var id = ctx.getImageData(0, 0, node.cols, node.rows);
            // ImageData will give us an array of RGBA, we only want RGB
            var j = 0;
            for (var i = 0; i < id.data.length; i++) {
                if (i % 4 != 3) {
                    // It's not the A component
                    node.facade_buffer[j++] = id.data[i];
                }
                // else just skip the A component
            }
        }

        // Update the display so it starts with something nicer
        // than a load of garbage memory colours :-)
        node.facade.update(node.currentImage, node.currentColour);
        node.updateBuffer();
        // And work out what we /should/ be displaying
        redis_client.get("pixelcheer", function(err, result) {
            if (!err) {
                node.currentImage = node.images[result];
                node.facade.update(node.currentImage, node.currentColour);
                node.updateBuffer();
            }
        });
        redis_client.get("cheerlights", function(err, result) {
            if (!err) {
                node.currentColour = result;
                node.facade.update(node.currentImage, node.currentColour);
                node.updateBuffer();
            }
        });

        // Refresh the display at a set rate
        node._interval = setInterval( function() {
            // Just send the data out, it will already be filled with the
            // image data from the canvas
            node.socket.send(node.facade_buffer, 0, node.facade_buffer.length, node.port, node.server);
        }, 450);

        node.on("close", function() {
            clearInterval(node._interval);
        });

        node.on("input", function(msg) {
            if (msg != null) {
                if (msg.topic && msg.payload) {
                    // We've got our pre-requisites
                    if (msg.topic == "cheerlights") {
                        console.log("New colour "+msg.payload);
                        node.currentColour = msg.payload;
                        // Update the facade
                        node.facade.update(node.currentImage, node.currentColour);
                        node.updateBuffer();
                    } else if (msg.topic == "pixelcheer") {
                        console.log("New image "+msg.payload);
                        // Get image
                        node.currentImage = node.images[msg.payload];
                        // Update the facade
                        node.facade.update(node.currentImage, node.currentColour);
                        node.updateBuffer();
                    }
                } else {
                    node.error("Missing either a msg.block or a msg.payload");
                }
            }
        });
    }

    RED.nodes.registerType("pixelcheer out",PixelCheer);
}
