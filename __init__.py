from flask import Flask

from codeon.config import Config


def create_app(config_object=None):
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )
    app.config.from_object(config_object or Config)

    from codeon.routes.execute import bp as execute_bp
    from codeon.routes.pages import bp as pages_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(execute_bp)
    return app
