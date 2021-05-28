import flask
import fire

def create_app():
    app = flask.Flask(__name__)
    
    @app.route('/')
    def serve_index():
        return flask.render_template("index.html")
    return app

def run_app():
    cert_file_path = os.environ['CERT_FILE_PATH']
    key_file_path = os.environ['KEY_FILE_PATH']
    context = (cert_file_path, key_file_path)
    app = create_app()
   
    print(cert_file_path,key_file_path)
    #app.run(debug=False, port="5000", host="0.0.0.0")
    app.run(debug=True, port="5000", host="0.0.0.0")
    # adding ssl_context here is not working for some reason
    # so manually add with command 
    # flask run --host=0.0.0.0 --cert=$CERT_FILE_PATH --key=$KEY_FILE_PATH


if __name__ == "main":
    fire.Fire(run_app)
