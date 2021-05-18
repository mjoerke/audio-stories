// global variables
var audio; // audio DOM element for playing mp3s
var story; // story tree object
var current_node; // current node in story tree
var paused = true; // whether story is playing or paused
var debug = false; // whether interface is in debug mode


function check_threshold(label_transitions, thresholds, results) {
    // "label_transitions": {"indoors": 1,"outdoors": 2}
    // "thresholds": {"indoors": 0.5,"outdoors":0.5}
    // "results": [0.1,0.9]

    // assumes at least one keys is present 
    // in all 3 of labels, thresholds and results 

    let next_node = undefined
    let max_confidence = -1
    
    var i = 0;
    for (const label in thresholds) {

        let conf = results[i];

        if (conf >= thresholds[label] && conf >= max_confidence) {
            next_node = label_transitions[label];
            max_confidence = conf;
        } 
        i++;
    }

    if (next_node == undefined) {
        next_node = current_node
    }
    
    return next_node;
}

async function loop() {

    console.log("main loop")

    if (paused) {
        return
    }

    if (debug) {
        setTimeout(()=>debug_loop())
        return
    }

    let state = current_node.type

    switch (state) {

        case "audio":
            console.log('audio')

            // adapted from https://stackoverflow.com/questions/9419263/how-to-play-audio
            audio = document.createElement('audio');
            audio.style.display = "none";
            audio.src = SERVER_IP + "/audio-files/" + current_node.audio_file;
            audio.autoplay = true;

            audio.onended = function(){
                let next_state = current_node.next;
                audio.remove(); 
                current_node = story["nodes"][next_state];

                if (current_node != null) {
                    setTimeout(()=>loop(), 500)
                }
                
            };

            document.body.appendChild(audio);
            break;

        case "classifier":
            console.log('classifier')
            
            // we want to timeout on the await (cancel after MAX_TIMEOUT ms)
            let results;
            try {
                let labels = JSON.stringify(Object.keys(current_node.labels))
                results = await query_classifier(MAX_TIMEOUT, labels)
            } catch(e) {
                // if the server doesn't respond in time, immediately trigger next frame
                console.log("dropped frame", e)
                setTimeout(()=>loop())
                break
            }

            // handle logic here 
            let next_state = check_threshold(current_node.labels, current_node.thresholds, results);
            current_node = story["nodes"][next_state];

            if (current_node != null) {
                setTimeout(()=>loop())
            }
            break;
    }
}

// uses wait decision with a very high threshold
// var story = {
//     "nodes": {"0": {"decision_type": "wait", "labels": {"indoors": 1}, "thresholds": {"indoors": 0.99}, "audio_file": "audio/dummy.mp3"},
//                    "1": {"decision_type": "end", "audio_file": "audio/indoors.mp3"}}
// }

// this will loop until you press spacebar
story = {
    "nodes": {
        "0": {"type": "classifier", "labels": {"indoors": 1, "outdoors": 0}, "thresholds": {"indoors": 0.5,"outdoors":0.5}},
        "1": {"type": "audio", "next": 3, "audio_file": "audio/indoors.mp3"},
        "2": {"type": "audio", "next": 3, "audio_file": "audio/outdoors.mp3"},
        "3": {"type": "audio", "next": null, "audio_file": "audio/changes.mp3"}
    }
}




// this will transition to indoors if spacebar else outdoors
// story = {
//     "nodes": {
//         "0": {"type": "classifier", "labels": {"indoors": 1, "outdoors": 2}, "thresholds": {"indoors": 0.5,"outdoors":0.5}},
//         "1": {"type": "audio", "next": 3, "audio_file": "audio/indoors.mp3"},
//         "2": {"type": "audio", "next": 3, "audio_file": "audio/outdoors.mp3"},
//         "3": {"type": "audio", "next": null, "audio_file": "audio/changes.mp3"}
//     }
// }

// this one is like the previous but it starts with an audio file
// story = {
//     "nodes": {
//         "0": {"type": "audio", "next": 1, "audio_file": "audio/changes.mp3"},
//         "1": {"type": "classifier", "labels": {"indoors": 2, "outdoors": 3}, "thresholds": {"indoors": 0.5,"outdoors":0.5}},
//         "2": {"type": "audio", "next": 4, "audio_file": "audio/indoors.mp3"},
//         "3": {"type": "audio", "next": 4, "audio_file": "audio/outdoors.mp3"},
//         "4": {"type": "audio", "next": null, "audio_file": "audio/changes.mp3"}
//     }
// }

function fetch_story(story_id) {
    fetch(SERVER_IP + '/load-audio-story/' + story_id, {
            method: 'GET'
          }).then( response => response.json())
	    .then( function (data) {story = data;}) 
}

var modal = document.getElementById("story-select-modal");

var story_select_form = document.getElementById("story-select-form");
story_select_form.onsubmit = function() {
    modal.style.display = "none";
    e = document.getElementById("story-select");
    fetch_story(e.options[e.selectedIndex].text)
    return false;
}

var story_id_form = document.getElementById("story-id-form");
story_id_form.onsubmit = function() {
    modal.style.display = "none";
    e = document.getElementById("story-id");
    fetch_story(e.value);
    return false;
}

var play_button = document.getElementById("play-button");

function toggle_play_button() {
    if (paused) {
        paused = false;
        play_button.children[0].innerHTML = "pause";

        if (!current_node) {
            current_node = story['nodes'][0];
        }

        loop();
    } else {
        paused = true;
        play_button.children[0].innerHTML = "play_arrow";
    }   
}

play_button.onclick = toggle_play_button;
