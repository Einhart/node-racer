"use strict";

//var sumo = require('node-sumo');
var sumo = require('../.');
var cv = require('opencv');
var prompt = require('prompt');
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
var minArea = 1888; // decides minimum size of square. try higher amount for closer square. too small makes squares out of pixels


var BLUE  = [255, 0, 0]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R
var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R

var test;
var chunks =[];

var time;

 var i;
//declare framerect
//draw frame rect as big as whole frame and color it blue
            //examine code node-opencv matrix.cc to see commands for node opencv.
//center of the boundingRect for the object rect may be boundingRect.x and boundingRect.y
//it thus follows that the centre for the frameRect may be frameRect.x and frameRect.y

//maybe center: (boundingRect.x + boundingRect.width/2,  boundingRect.y+boundingRect.height/2)


//drone.connect(function() {

//});

drone.on("battery", function(battery) {
  console.log("battery: " + battery);
});

video.on("data", function(data) {
  buf = data;
});

prompt.start();
prompt.get(['moves'], function (err, result) {
      if (err) { return onErr(err); }
       test = result.moves;
        chunks = test.split(" ");


                drone.connect(function() {
                console.log('connecting');
                //console.log("battery: " + battery);
                drone.videoStreaming();
                syncLoop(chunks.length, function(loop){
                setTimeout(function(){
                     i = loop.iteration();
                    console.log(i);
                    move(i);
                    loop.next();
                    }, timeout(i));

                }, function(){
                    track();// track is called after the main loop is completed
                    console.log('done');
                });
                });

});


function timeout(t){
switch(chunks[t]){
            case "w":
                return time = 3000;
                break;
            case "s":
                return time = 2000;
                break;
            case "d":
                return time = 800;
                break;
            case "a":
                return time = 800;
                break;
            default:
                console.log('wrong input');
}
}










function track(){
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

          //imm.convertGrayscale();
          //imm.inRange([18, 18, 98], [186, 106, 251]);// this function will color white what it deems as red.
                    imm.convertHSVscale();

            //imm.inRange([0, 0, 88], [168, 118, 255]);//check red
            // this function will color white what it deems as red.

                       //imm.inRange([160,60,60], [255,255,255]);//check red hsv
//[30,68,68]

              imm.inRange([68,128,10], [118,255,255]);
            // this function will color white what it deems as red.

          im_canny = imm.copy();
          im_canny.erode(3);
          //im_canny.medianBlur(11);

            im_canny.dilate(11);

          im_canny.gaussianBlur([7,7]); //gaussian blur made everything stable
          im_canny.canny(lowThresh, highThresh);


          contours = im_canny.findContours();

  for (var i = 0; i < contours.size(); i++) {
    if (contours.area(i) < minArea) continue;
    var arcLength = contours.arcLength(i, true);
    contours.approxPolyDP(i, 0.1 * arcLength, true);

    var boundingRect = contours.boundingRect(i);
    var aspectRatio = (boundingRect.width / boundingRect.height);

    var area = contours.area(i);
    var hullArea = contours.area(contours.convexHull(i));
    var solidity = (area / hullArea);

//(solidity > 0.9) && (aspectRatio>=0.8 && aspectRatio<=1.2) && (boundingRect.width > 25 && boundingRect.height > 25)

if ((solidity > 0.9) && (aspectRatio<=0.8 || aspectRatio>1.2)){
   switch(contours.cornerCount(i)) {
      case 4:
        //im.drawContour(contours,i, RED, 6);
        //im.rectangle([boundingRect.x,boundingRect.y],[boundingRect.width,boundingRect.height],BLUE,6); // after contours are detected to be 4, draw a rec around the centre
        im.rectangle([boundingRect.x,boundingRect.y],[boundingRect.width,boundingRect.height],BLUE,6); // after contours are detected to be 4, draw a rec around the centre
        //im.ellipse((boundingRect.x+boundingRect.width/2),(boundingRect.y+boundingRect.height/2),(boundingRect.width/2),(boundingRect.height/2),BLUE,6);
        centering(boundingRect.x,boundingRect.width);
          //closing(boundingRect.x,boundingRect.y,boundingRect.width,boundingRect.height);
        //console.log("width " + boundingRect.width); //debugging
        //console.log("y coord " + boundingRect.y); //debugging
        break;
      default:
      im.drawContour(contours, i, WHITE);

   }
    }

  }
            //im.rectangle([0,0],[640,480],GREEN,6);
            //
            //drone.vidweoStreaming();
            w.show(im);
            w.blockingWaitKey(0, 1);


        }
    });
  } catch(e) {
    console.log(e);
  }
}, 2);

}// end of function track


function forward(){
//setTimeout(function() {

      drone.forward(13);
      setTimeout(function() {
        drone.stop();}, 1500);
//}, 1000);

}


function backward(){
      //setTimeout(function() {
      drone.stop();
      drone.postureJumper();
      drone.backward(28);
      setTimeout(function() {
        drone.stop();
      }, 1600);
      //}, 1000);

}
function right90(){
      drone.postureJumper();
      drone.right(50);
      setTimeout(function() {
        drone.stop();
      }, 338);

}

function left90(){

      drone.postureJumper();
      drone.left(50);
      setTimeout(function() {
        drone.stop();
      }, 338);

}

function move(i){
      switch(chunks[i]){
            case "w":
                console.log('forward please');
                forward();
                break;
            case "s":
                console.log('backward');
                backward();
                break;
            case "d":
                console.log('right');
                right90();
                break;
            case "a":
                console.log('left');
                left90();
                break;
            default:
                console.log('wrong input');
                  }

}

//(boundingRect.x + boundingRect.width/2,  boundingRect.y+boundingRect.height/2)

function centering(bx,bwidth){
var centerX = bx +bwidth/2;
if(centerX <= 213){//if less than or equal to x=300
          drone.left(16); // wheels tend to be sticky at slow speeds.
      setTimeout(function() {
        drone.stop();
      }, 1);
                }
else if(centerX > 426){// if greater than or equal to x=360
          drone.right(16);
      setTimeout(function() {
        drone.stop();
      }, 1);
                }
else{// stop if within the buffer
      //setTimeout(function() {
   //         drone.stop();
    //  }, 1);

     closing(bx,bwidth);
        }
}

function closing(bx,bwidth){
    if(bwidth<80){
        drone.forward(26); //for forward motion 10 is sufficient. it is more robust than backwards
      setTimeout(function() {
      drone.stop();}, 1);
    }
    else if (bwidth<160){
            drone.forward(16); //for forward motion 10 is sufficient. it is more robust than backwards
      setTimeout(function() {
      drone.stop();}, 1);
    }

    else if (bwidth>200){
              drone.backward(18); // backwards movement is weaker than forwards movement
      setTimeout(function() {
      drone.stop();}, 1);
    }
    else{
     //centering(bx,by,bwidth,bheight);
              setTimeout(function() {
                drone.stop();
                }, 1);
    }
}

function syncLoop(iterations, process, exit){
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
        next:function(){
            if(done){
                if(shouldExit && exit){
                    return exit(); // Exit if we're done
                }
            }
            // If we're not finished
            if(index < iterations){
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
            // Otherwise we're done
            } else {
                done = true; // Make sure we say we're done
                if(exit) exit(); // Call the callback on exit
            }
        },
        iteration:function(){
            return index - 1; // Return the loop number we're on
        },
        break:function(end){
            done = true; // End the loop
            shouldExit = end; // Passing end as true means we still call the exit callback
        }
    };
    loop.next();
    return loop;
}
