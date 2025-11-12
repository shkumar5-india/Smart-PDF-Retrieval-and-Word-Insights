from flask import Flask, request, jsonify
from flask_cors import CORS

from model.schema import get_model_data
import json

app = Flask(__name__)

origins = ["http://localhost:5173"]
CORS(app,origins=origins)

@app.route('/dict/')
def get_word():
    word = request.args.get('word')
    targeted_language = request.args.get('targeted_language') or "Telugu"
    api_provider = request.args.get('api_provider') or ""

    if not word:
        return jsonify({'error': 'Missing "word" or "targeted_language" query parameter'}), 400

    response = get_model_data(
        word=word,
        target_language=targeted_language,
        api_provider=api_provider
    )
    json_output = response.model_dump_json(indent=2)
    parsed_data = json.loads(json_output)
    return jsonify(parsed_data)

if __name__ == '__main__':
    app.run(debug=True)
