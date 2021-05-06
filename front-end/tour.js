// global variables
var audio;
var state;
var current_node;
var spacebar;
var story;

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

    console.log('loop')
    state = current_node.type

    switch (state) {

        // advance state as soon as the audio file ends        
        // assumes the thresholds are set up so that one label will always be above threshold
        // assumes next_state is never undefined
        case "audio":
            console.log('audio')

            // adapted from https://stackoverflow.com/questions/9419263/how-to-play-audio

            // always add the audio and play it
            // if there's no audio for this state, the JSON should specify audio/dummy.mp3
            // which is a 1ms long silent mp3 file
            audio = document.createElement('audio');
            audio.style.display = "none";
            audio.src = current_node.audio_file;
            audio.autoplay = true;

            audio.onended = function(){
                let next_state = current_node.next;
                audio.remove(); 
                current_node = story["nodes"][next_state];

                if (current_node != null) {
                    setTimeout(()=>loop(), 500)
                }
                
            };5

            document.body.appendChild(audio);
            break;

        // wait to advance state until at least one label is above threshold
        // e.g. wait until you see a cat
        case "classifier":
            console.log('classifier')
            let image = get_image_data()

            // we want to timeout on the await (cancel after 500ms)
            let results;
            try {
                results = await query_classifier(5000)
                console.log(results)
                console.log('received frame')
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

function dummy_spacebar_threshold() {
    // hack -- you can change what label is produced by pressing the spacebar
    // to test the "wait" story condition
    if (spacebar) {
        return {"indoors": 1.00, "outdoors": 0.00}
    }
    return {"indoors": 0.1, "outdoors": 0.9}
}

// hack - trigger story when spacebar pressed         
document.body.onkeyup = function(e){
    if(e.keyCode == 32){
        spacebar = true;
    }
}

document.getElementById("play-button").addEventListener(
    "click",
    function () {
        current_node = story['nodes'][0]
        loop();
    }
)

