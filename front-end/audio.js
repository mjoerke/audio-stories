// global variables
var timer;
var audio;
var state;
var spacebar;
var story;

function query_classifier() {
    // hack -- you can change what label is produced by pressing the spacebar
    // to test the "wait" story condition
    if (spacebar) {
        return {"indoors": 1.00, "outdoors": 0.00}
    }
    return {"indoors": 0.1, "outdoors": 0.9}
}

function check_threshold(labels, thresholds, results) {
    // "labels": {"indoors": 1,"outdoors": 2}
    // "thresholds": {"indoors": 0.5,"outdoors":0.5}
    // "results": {"indoors": 0.1, "outdoors": 0.9}

    // assumes at least one keys is present 
    // in all 3 of labels, thresholds and results 

    next_state = undefined
    for (const label in thresholds) {
        if (results[label] >= thresholds[label]) {
            next_state = labels[label];
        } 
      }
    return next_state;
}

function check_threshold_timer() {
    // this function is called 
    // accesses the glabal state, story and audio variables

    results = query_classifier();
    next_state = check_threshold(state.labels,state.thresholds,results);

    if (next_state){
        clearInterval(timer); // stop looping
        audio.remove(); 
        state = story[next_state];
        advance_state(); // adds next audio
    }
    
}

function advance_state() {
    // adapted from https://stackoverflow.com/questions/9419263/how-to-play-audio

    // always add the audio and play it
    // if there's no audio for this state, the JSON should specify audio/dummy.mp3
    // which is a 1ms long silent mp3 file
    audio = document.createElement('audio');
    audio.style.display = "none";
    audio.src = state.audio_file;
    audio.autoplay = true;
    
    // depending on the type of state the audio.onended listener will be different
    switch (state.decision_type) {

        // advance state as soon as the audio file ends        
        // assumes the thresholds are set up so that one label will always be above threshold
        // assumes next_state is never undefined
        case "immediate":
            audio.onended = function(){
                var results = query_classifier();
                var next_state = check_threshold(state.labels, state.thresholds, results);
                audio.remove(); 
                state = story[next_state];
                advance_state(); // adds next audio
            };
            break;

        // wait to advance state until at least one label is above threshold
        // e.g. wait until you see a cat
        case "wait":
            audio.onended = function(){
                var results = query_classifier();
                var next_state = check_threshold(state.labels, state.thresholds, results);
                
                // if no label meets its threshold
                // keep checking in the check_threshold_timer function 
                // which is called every .5 seconds until clearInterval(timer) is called
                if (next_state == undefined) {                    
                    timer = setInterval(check_threshold_timer, 500); 
                }

                else {
                    audio.remove(); 
                    state = story[next_state]
                    advance_state(); // adds next audio
                }
            };
            break;

        // if there's only a single possible next state, go to that state
        case "always":
            audio.onended = function() {
                audio.remove(); 
                state = story[state.next];
                advance_state();
            }
            break;

        // if this is the end of the story, do nothing
        case "end":
            // do nothing when audio ends
            break;
    }

    document.body.appendChild(audio);
}

// uses wait decision with a very high threshold
var story = {"nodes": {"0": {"decision_type": "wait", "labels": {"indoors": 1}, "thresholds": {"indoors": 0.99}, "audio_file": "audio/dummy.mp3"},
                   "1": {"decision_type": "end", "audio_file": "audio/indoors.mp3"}}
        }

// uses immediate decision
// at least one label will be above .5
// var story = {"nodes": {"0": {"decision_type": "immediate", "labels": {"indoors": 1, "outdoors": 2}, "thresholds": {"indoors": 0.5,"outdoors":0.5}, "audio_file": "audio/dummy.mp3"},
//             "1": {"decision_type": "always", "next": 3, "threshold": null, "audio_file": "audio/indoors.mp3"},
//             "2": {"decision_type": "always", "next": 3, "threshold": null, "audio_file": "audio/outdoors.mp3"},
//             "3": {"decision_type": "end", "audio_file": "audio/changes.mp3"}}
// }
 
// hack - trigger story when spacebar pressed         
document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        spacebar = true;
    }
}

document.getElementById("play-button").addEventListener(
    "click",
    function () {
        story = story["nodes"]
        state = story[0];
        advance_state();
    }
)

