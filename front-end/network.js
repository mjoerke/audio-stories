// https://blog.bitsrc.io/introduction-to-promise-race-and-promise-any-with-real-life-examples-9d8d1b9f8ec9

function timeout(delay) {
     const wait = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), delay);

    });
    return wait;
}

async function dummy_request(time) {
    let offset = 100 * Math.random() - 50
    offset = Math.round(offset)
    console.log("fake time: ", time+offset)
    return new Promise(resolve => setTimeout(resolve, time+offset, dummy_spacebar_threshold()))
}

async function query_classifier(time) {
    console.log("query")
    // get image data
    let image_data = await get_image_data();

    //console.log(image_data)
    // get current labels
    let labels = JSON.stringify(Object.keys(current_node.labels))
   // console.log(labels)

    var form_data = new FormData();
    form_data.append("labels", labels);
    form_data.append("image", image_data)
    //console.log(form_data)

    let response = fetch('http://35.226.183.11:5000/inference', {
        method: 'POST',
        body: form_data
    }).then((response) => response.json());
        
    //console.log("result: ", result);


    return Promise.race([response, timeout(time)])
}
