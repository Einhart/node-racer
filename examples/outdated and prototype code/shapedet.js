"use strict";

//var sumo = require('node-sumo');
var sumo = require('../.');
var cv = require('opencv');
//var miniDrone=require('/home/qilas/node_modules/parrot-mini-drone/parrot-mini-drone.js');

var width;
var height;
var im_canny;
var contours;
//var imm;

var drone = sumo.createClient();
var video = drone.getVideoStream();
var buf = null;
var w = new cv.NamedWindow("Video", 0); //640 x 480

var lowThresh = 0;
var highThresh = 100;
var nIters = 2;
var minArea = 566; // decides minimum size of square. try higher amount for closer square. too small makes squares out of pixels


var BLUE  = [255, 0, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R




//declare framerect
//draw frame rect as big as whole frame and color it blue
            //examine code node-opencv matrix.cc to see commands for node opencv.
//center of the boundingRect for the object rect may be boundingRect.x and boundingRect.y
//it thus follows that the centre for the frameRect may be frameRect.x and frameRect.y

//maybe center: (boundingRect.x + boundingRect.width/2,  boundingRect.y+boundingRect.height/2)


drone.connect(function() {
    console.log("Connected...");

drone.videoStreaming();
});

drone.on("battery", function(battery) {
  console.log("battery: " + battery);
});

video.on("data", function(data) {
  buf = data;
});

setInterval(function() {
  if (buf == null) {
   return;
  }

  try {
    cv.readImage(buf, function(err, im) {

      if (err) {
        console.log(err);
      } else {
            var imm = im.copy();
            width = imm.width();
            height = imm.height();
            if (width < 1 || height < 1) throw new Error('Image has no size');

         var out = new cv.Matrix(height, width);

          imm.convertGrayscale();
          im_canny = imm.copy();
          im_canny.gaussianBlur([7,7]); //gaussian blur made everything stable
          im_canny.canny(lowThresh, highThresh);
          im_canny.dilate(nIters);

          contours = im_canny.findContours();

  for (var i = 0; i < contours.size(); i++) {
    if (contours.area(i) < minArea) continue;
    var arcLength = contours.arcLength(i, true);
    contours.approxPolyDP(i, 0.138 * arcLength, true);

    var boundingRect = contours.boundingRect(i);
    var aspectRatio = (boundingRect.width / boundingRect.height);

    var area = contours.area(i);
    var hullArea = contours.area(contours.convexHull(i));
    var solidity = (area / hullArea);

//(solidity > 0.9) && (aspectRatio>=0.8 && aspectRatio<=1.2) && (boundingRect.width > 25 && boundingRect.height > 25)

if ((solidity > 0.9) && (aspectRatio>=0.8 && aspectRatio<=1.2)){
    switch(contours.cornerCount(i)) {
      case 4:
        //im.drawContour(contours,i, RED, 6);
        im.rectangle([boundingRect.x,boundingRect.y],[boundingRect.width,boundingRect.height],BLUE,6); // after contours are detected to be 4, draw a rec around the centre
//centering(boundingRect.x,boundingRect.y,boundingRect.width,boundingRect.height);
          closing(boundingRect.x,boundingRect.y,boundingRect.width,boundingRect.height);
        //console.log("width " + boundingRect.width); //debugging
        //console.log("y coord " + boundingRect.y); //debugging
        break;
      default:
    }
    }

  }
            //im.rectangle([0,0],[640,480],GREEN,6);
            w.show(im);
            w.blockingWaitKey(0, 1);


        }
    });
  } catch(e) {
    console.log(e);
  }
}, 2);



function forward(){
//setTimeout(function() {
drone.stop();
      drone.postureJumper();
      drone.forward(50);
      setTimeout(function() {drone.stop();}, 1000);
//}, 1000);

}


function backward(){
      //setTimeout(function() {
      drone.stop();
      drone.postureJumper();
      drone.backward(50);
      setTimeout(function() {
        drone.stop();
      }, 1000);
      //}, 1000);

}
function right90(){
      drone.postureJumper();
      drone.right(50);
      setTimeout(function() {
        drone.stop();
      }, 260);

}

function left90(){

      drone.postureJumper();
      drone.left(50);
      setTimeout(function() {
        drone.stop();
      }, 245);

}


//(boundingRect.x + boundingRect.width/2,  boundingRect.y+boundingRect.height/2)

function centering(bx,by,bwidth,bheight){
var centerX = bx +bwidth/2;
if(centerX <= 300){//if less than or equal to x=300
          drone.left(3); // wheels tend to be sticky at slow speeds.
      setTimeout(function() {
        drone.stop();
      }, 3);
                }
else if(centerX > 360){// if greater than or equal to x=360
          drone.right(3);
      setTimeout(function() {
        drone.stop();
      }, 3);
                }
else{// stop if within the buffer
      setTimeout(function() {
drone.stop();
      }, 1);
        }
}

function closing(bx,by,bwidth,bheight){
    if(bwidth<=180){
        drone.forward(10); //for forward motion 10 is sufficient. it is more robust than backwards
      setTimeout(function() {
      drone.stop();}, 3);
    }
    else if (bwidth>230){
              drone.backward(20); // backwards movement is weaker than forwards movement
      setTimeout(function() {drone.stop();}, 3);
    }
    else{
        centering(bx,by,bwidth,bheight);
    }
}


/*
width = im.width();
            height = im.height();
  if (width < 1 || height < 1) throw new Error('Image has no size');

  var out = new cv.Matrix(height, width);
  im.convertGrayscale();
  im_canny = im.copy();
  im_canny.canny(lowThresh, highThresh);
  im_canny.dilate(nIters);

  contours = im_canny.findContours();

  for (var i = 0; i < contours.size(); i++) {

    if (contours.area(i) < minArea) continue;

    var arcLength = contours.arcLength(i, true);
    contours.approxPolyDP(i, 0.01 * arcLength, true);

    switch(contours.cornerCount(i)) {
      case 4:
        out.drawContour(contours, i, RED);
        break;
      default:
        out.drawContour(contours, i, WHITE);
    }
  }
            w.show(out);
          w.blockingWaitKey(0, 50);


*/
