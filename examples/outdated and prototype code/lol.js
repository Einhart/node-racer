"use strict";

var sumo = require('../.');
var cv = require('opencv');

var drone = sumo.createClient();
var video = drone.getVideoStream();
var buf = null;
var w = new cv.NamedWindow("Video", 0);

drone.connect(function() {
//  console.log("Connected...");
//
//  drone.postureJumper();
//  drone.forward(50);
//  setTimeout(function() {
//    drone.right(10);
//    setTimeout(function() {
//      drone.stop();
//      drone.animationsLongJump();
//      drone.animationsSlalom();
//    }, 5000);
//  }, 1000);
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
               setTimeout(function() {


        im.detectObject("haarcascade_frontalface_alt.xml", {}, function(e, faces) {
          if (e) {
            console.log(err);
          }

          for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            im.rectangle([face.x, face.y],
              [face.width, face.height], [0, 255, 0], 2);
          }

          w.show(im);
          w.blockingWaitKey(0, 50);

        });
        }, 100);
}
    });
  } catch(e) {
    console.log(e);
  }
}, 100);

/*
{
        im.detectObject("~/node_modules/opencv/examples/coffeescript/haarcascade_frontalface_alt.xml", {}, function(e, faces) {
          if (e) {
            console.log(err);
          }

          for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            im.rectangle([face.x, face.y],
              [face.width, face.height], [0, 255, 0], 2);
          }

          w.show(im);
          w.blockingWaitKey(0, 50);

          setTimeout(function() {
            callback();
          }, 100);
        });
}
*/
