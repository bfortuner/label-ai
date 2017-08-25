from flask import Flask
from flask_cors import CORS
from flask_graphql import GraphQLView
from schema import Schema
from flask import Response, request, abort, send_from_directory
from PIL import Image
from io import StringIO

import config as cfg


def create_app(**kwargs):
    app = Flask(__name__)
    app.debug = True
    app.add_url_rule(
        '/graphql',
        view_func=GraphQLView.as_view('graphql', schema=Schema, **kwargs)
    )
    return app

app = create_app(graphiql=True)



@app.route('/image/<filename>')
def image(filename):
    return send_from_directory(cfg.MEDIA_PATH, filename)


# @app.route('/image/<path:filename>')
# def image(filename):
#     try:
#         w = int(request.args['w'])
#         h = int(request.args['h'])
#     except (KeyError, ValueError):
#         return send_from_directory('.', filename)

#     try:
#         im = Image.open(filename)
#         im.thumbnail((w, h), Image.ANTIALIAS)
#         strIo = StringIO()
#         im.save(strIo, format='JPEG')
#         return Response(strIo.getvalue(), mimetype='image/jpeg')

#     except IOError:
#         abort(404)

#     return send_from_directory('.', filename)


if __name__ == '__main__':
    CORS(app, resources={r'/graphql': {'origins': '*'}})
    app.run(host='0.0.0.0')
