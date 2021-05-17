var debug_toggle = document.getElementById("debug-mode-toggle");
var edit_button  = document.getElementById("edit-classifier-button");

var debug_labels = [];

function toggle_debug_mode() {
    if (debug) {
        debug = false;
        debug_toggle.children[0].style.color = "white";
        edit_button.style.display = "none";
        document.getElementById("classifier-bar-chart").style.display = "none"
    } else {
        debug = true;
        debug_toggle.children[0].style.color = "lime";
        edit_button.style.display = "block";
        document.getElementById("classifier-bar-chart").style.display = "block"
    }
}

debug_toggle.onclick = toggle_debug_mode;

async function debug_loop() {
    console.log("debug loop")

    if (paused) {
        return
    }

    if (!debug) {
        setTimeout(()=>loop())
        return
    }

    let results;
    try {
        let labels = debug_labels.map(function (s) {
            if (s.descriptor == "") {
                return "none"
            } else {
                return s.descriptor
            }
        })
        
        results = await query_classifier(MAX_TIMEOUT, JSON.stringify(labels))
        console.log(results)
        update_barchart_UI(results)

        setTimeout(()=>debug_loop())
        return

    } catch(e) {
        // if the server doesn't respond in time, immediately trigger next frame
        console.log("dropped frame", e)
        setTimeout(()=>debug_loop())
        return
    }
}

async function query_classifier_(t, labels) {
    function softmax(arr) {
        return arr.map(function(value,index) { 
          return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
        })
    }

    let N = labels.length;
    let data = Array.from(Array(N), () => Math.random())
    return new Promise(resolve => setTimeout(resolve, 1000, data))
}

function add_label() {
    read_label_input();

    var new_label = {
        "descriptor": "",
        "threshold": 50
    }

    debug_labels.push(new_label);
    render_modal_UI()
}

function increment(id) {
    let selector = "threshold-" + id.toString();
    let el = document.getElementById(selector);
    let current_value = parseInt(el.innerHTML);
    current_value = Math.min(current_value + 10, 100);
    el.innerHTML = current_value.toString()
}

function decrement(id) {
    let selector = "threshold-" + id.toString();
    let el = document.getElementById(selector);
    let current_value = parseInt(el.innerHTML);
    current_value = Math.max(current_value - 10, 0);
    el.innerHTML = current_value.toString()
}

function remove_label(id) {
    read_label_input();
    debug_labels.splice(parseInt(id), 1)
    render_modal_UI()
}

function read_label_input() {
    for (var i = 0; i < debug_labels.length; i++) {
        // only read input from label elements that have already been rendered
        try {
            var label_descriptor = document.getElementById("label-" + i.toString()).value;
            var label_threshold = document.getElementById("threshold-" + i.toString()).innerHTML;

            debug_labels[i].descriptor = label_descriptor;
            debug_labels[i].threshold = parseInt(label_threshold);
        } catch {
            continue
        }
    }
}

function render_modal_UI() {
    var input_form = document.getElementById("label-input");

    let form_HTML = ``

    for (var i = 0; i < debug_labels.length; i++) {
        label = debug_labels[i]

        form_HTML += `<div class="form-row align-items-center" id="label-container-${i}">
            <div class="col-11 mr-auto">
                <div class="input-group">
                    <input type="text" class="form-control border border-secondary" 
                        id="label-${i}"
                        placeholder="Label ${i+1}" value="${label.descriptor}"/>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onclick="decrement(${i})">
                            <
                        </button>

                        <span class="input-group-text border border-secondary" id="threshold-${i}">${label.threshold}</span>

                        <button class="btn btn-outline-secondary" type="button" onclick="increment(${i})">
                            >
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-1">
                <button type="button" class='close' onclick="remove_label(${i})">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>`
    }

    form_HTML += `<div class="form-row align-items-center" onclick="add_label()">
                            <button type="button" class="btn btn-outline-secondary btn-block">Add Label +</button>
                        </div>`

    input_form.innerHTML = form_HTML
}

function render_barchart_UI() {
    read_label_input();

    var barchart_container = document.getElementById("classifier-bar-chart");
    let barchart_HTML = ""

    for (var i = 0; i < debug_labels.length; i++) {   
        label = debug_labels[i];
        let descriptor = label.descriptor;

        if (descriptor == "") {
            descriptor = 'none'
        }

        let threshold = label.threshold;

        barchart_HTML += `<div class='bar-container'>
                <label>
                    <span class='badge badge-light' id="badge-${i}">${descriptor}</span>
                </label>
                <div class='bar-border'>
                    <div class='bar' id="bar-${i}">
                    </div>
                    <div class='threshold' style='margin-left: ${threshold}%'>
                    </div>
                </div>
            </div>`
    }
    barchart_container.innerHTML = barchart_HTML
}

$("#classifier-modal").on('hide.bs.modal', render_barchart_UI);

function update_barchart_UI(results) {
    console.log("update", results)
    let max_confidence = -1;
    let max_label = -1;

    for (var i = 0; i < results.length; i++) {
        let confidence = 100 * results[i];
        let bar = document.getElementById("bar-" + i.toString())
        bar.style.width = confidence.toString() + "%";

        let threshold = debug_labels[i].threshold;
        if (confidence >= threshold && confidence >= max_confidence) {
            max_confidence = confidence;
            max_label = i;
        } 
    }

    console.log(max_label)

    for (var i = 0; i < results.length; i++) {
        let badge = document.getElementById("badge-" + i.toString())
        let bar = document.getElementById("bar-" + i.toString())

        if (i == max_label) {
            badge.classList.remove('badge-light');
            badge.classList.add('badge-success');
            bar.classList.add("predicted-bar");
        } else {
            badge.classList.remove('badge-success');
            badge.classList.add('badge-light');
            bar.classList.remove("predicted-bar");
        }
        
    }
}