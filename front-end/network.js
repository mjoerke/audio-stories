// https://blog.bitsrc.io/introduction-to-promise-race-and-promise-any-with-real-life-examples-9d8d1b9f8ec9

const SERVER_IP = "http://anelise-lambda.csail.mit.edu:5000";
const MAX_TIMEOUT = 5000;

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

async function query_classifier(max_time, labels) {
    console.log("query")
    // get image data
    let image_data = await get_image_data();

    var form_data = new FormData();
    form_data.append("labels", labels);
    form_data.append("image", image_data)
    //console.log(form_data)

    let response = fetch(SERVER_IP + '/inference', {
        method: 'POST',
        body: form_data
    }).then((response) => response.json());
        
    //console.log("result: ", result);


    return Promise.race([response, timeout(max_time)])
}
