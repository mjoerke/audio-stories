import fire

from server.create_app import (AUDIO_FILES_DIR, AUDIO_STORY_FILES_DIR,
                               create_app)


def run_app(debug=True,
            port=5000,
            host="0.0.0.0",
            device="cuda",
            save_dir=AUDIO_STORY_FILES_DIR,
            audio_save_dir=AUDIO_FILES_DIR):

    app = create_app(device, save_dir, audio_save_dir)
    app.run(debug=debug, port=port, host=host)


if __name__ == "__main__":
    fire.Fire(run_app)
