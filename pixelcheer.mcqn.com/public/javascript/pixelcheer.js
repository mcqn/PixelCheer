// Class to draw the displays for both browser and in node.js for the
// LED facade at FACT Liverpool for PixelCheer
// 
// (c) Copyright 2014 MCQN Ltd
//

var CheerlightColours = {
    "red": "rgb(255, 0, 0)",
    "green": "rgb(0, 128, 0)",
    "blue": "rgb(0, 0, 255)",
    "cyan": "rgb(0, 255, 255)",
    "white": "rgb(255, 255, 255)",
    "warmwhite": "rgb(253, 245, 230)",
    "oldlace": "rgb(253, 245, 230)",
    "purple": "rgb(128, 0, 128)",
    "magenta": "rgb(255, 0, 255)",
    "yellow": "rgb(255, 255, 0)",
    "pink": "rgb(255, 192, 203)",
    "orange": "rgb(255, 165, 0)"
};

function Facade(canvas_element) {
    this.canvas = canvas_element;
    this.context = this.canvas.getContext('2d');
    this.topLeft = 0;
    this.topRight = 0;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.colour = "black";
}
Facade.prototype.init = function() {
    // Start with a black screen
    this.context.fillStyle = this.colour;
    this.context.fillRect(this.topLeft, this.topRight, this.width, this.height);
}
Facade.prototype.update = function(image, colour) {
    // Fill in the background colour
console.log("image "+image);
console.log("colour "+colour);
    this.colour = colour;
    this.context.fillStyle = CheerlightColours[this.colour];
    this.context.fillRect(this.topLeft, this.topRight, this.width, this.height);
    // And draw in the image
    this.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, this.width, this.height);
}

// Needed so we can import it into Node.js
try {
  exports.Facade = Facade;
} catch (e) {
  //alert("Error: "+e);
}

