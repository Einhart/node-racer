
require('events').EventEmitter.defaultMaxListeners = 10;
//wait=require('wait.for');
var sumo = require('node-sumo');
var drone = sumo.createClient();
var prompt = require('prompt');
//var sleep = require('sleep');

var test;
var chunks =[];

//var lupus = require('lupus');

//var move1 = chunks[0];
//var move2 = chunks[1];
//var move3 = chunks[2];

prompt.start();
prompt.get(['moves'], function (err, result) {
      if (err) { return onErr(err); }
       test = result.moves;
        chunks = test.split(" ");


                drone.connect(function() {
                console.log('connecting');
                syncLoop(chunks.length, function(loop){
                setTimeout(function(){
                    var i = loop.iteration();
                    console.log(i);
                    move(i);
                    loop.next();
                    }, 6000);

                }, function(){
                    console.log('done');
                });
                });

});





function forward(){
//setTimeout(function() {
       // drone.stop();
      drone.postureJumper();
      drone.forward(28);
      setTimeout(function() {drone.stop();}, 5300);
//}, 1000);

}


function backward(){
      //setTimeout(function() {
      drone.stop();
      drone.postureJumper();
      drone.backward(50);
      setTimeout(function() {
        drone.stop();
      }, 251);
      //}, 1000);

}
function right90(){
      drone.postureJumper();
      drone.right(50);
      setTimeout(function() {
        drone.stop();
      }, 251);

}

function left90(){

      drone.postureJumper();
      drone.left(50);
      setTimeout(function() {
        drone.stop();
      }, 251);

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

