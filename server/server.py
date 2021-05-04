import fire
import flask

import model_utils

app = flask.Flask()
model = None


@app.route('/check')
def check():
    return "It's working!"


def run_app(debug=True, port=5000, host="0.0.0.0", device="cuda"):
    global model
    model = model_utils.CLIPModel(device)
    app.run(debug=debug, port=port, host=host)


if __name__ == "__main__":
    fire.Fire(run_app)
