// https://blog.bitsrc.io/introduction-to-promise-race-and-promise-any-with-real-life-examples-9d8d1b9f8ec9

function timeout(delay) {
    let cancel;
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
    let image_data = get_image_data()
    // get current labels
    let labels = current_node.labels

    // send request
    // return response Promise
    let fake_query = dummy_request(time)
    return Promise.race([fake_query, timeout(time)])
}