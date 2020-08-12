from flask import Flask, request, jsonify
app = Flask(__name__)

import pymongo
mongo = pymongo.MongoClient("mongodb://tms:io@34.80.59.240:27017/tms")
db = mongo["tms"]
col = db["api_log"]

@app.route('/', methods=['POST'])
def logger():
    col.insert(request.json, check_keys=False)
    return '{}'

if __name__ == '__main__':
    app.run(host= '0.0.0.0',debug=True)

