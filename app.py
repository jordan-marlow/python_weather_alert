from flask import Flask, render_template, jsonify
from alerts import get_active_alerts

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/alerts")
def alerts():
    alerts = get_active_alerts()
    return jsonify(alerts)


if __name__ == "__main__":
    app.run(debug=True)
