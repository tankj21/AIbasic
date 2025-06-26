from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/route', methods=['POST'])
def get_route():
    data = request.json
    # スポットの簡易的な巡回順（距離ベース、A*仮）
    route = sorted(data['spots'], key=lambda s: s['lat'])  # 仮のロジック
    return jsonify(route)

if __name__ == '__main__':
    app.run(debug=True)
