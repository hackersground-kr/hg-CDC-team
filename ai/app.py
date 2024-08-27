from flask import Flask, jsonify, request
import pyodbc
import pandas as pd
import json
from openai import AzureOpenAI
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient
from flask_cors import CORS
from sqlalchemy import create_engine

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # CORS 설정 추가

# DB SETTING
engine = '{ODBC Driver 17 for SQL Server}'
host = "hgrdcdc.database.windows.net"
admin = "hgrdcdcroot"
password = "dnflsk135!"
database = "hrgd-cdc"

# Azure_Open_API SETTING
ENDPOINT = "https://polite-ground-030dc3103.4.azurestaticapps.net/api/v1"
API_KEY = "f84c82c4-33b6-4767-84a7-edc648f1ef6a"
API_VERSION = "2024-02-01"
MODEL_NAME = "model-gpt4o-20240513"

# Azure_analytics_API SETTING
text_analytics_endpoint = "https://cdctextanalyticstest.cognitiveservices.azure.com/"
text_analytics_key = "5c7626b61f404bbabb0c7bc8ba2a9807"

@app.route("/Review_Soltuion", methods=['POST'])
def Solution():
    print(request.json)
    print(request.json['SC_NAME'])
    print(request.json['ADDRESS'])
    try:
        data = request.json
        ###################
        ##DB_Reviews_Data##
        ###################

        mssql_engine = create_engine(
            f"mssql+pyodbc://{admin}:{password}@{host}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
        )

        SC_NAME = data['SC_NAME']
        ADDRESS = data['ADDRESS']

        sql = "SELECT TOP 10 * FROM Reviews WHERE SC_NAME = N'%s' AND ADDRESS = N'%s' ORDER BY Review_Date DESC" % (SC_NAME, ADDRESS)

        df = pd.read_sql_query(sql, mssql_engine)
        print(df)

        combined_string = ''.join(df['Review'].apply(lambda x: str([x])))
        print(combined_string)
        ###################
        ##azure - Open AI##
        ###################
        client = AzureOpenAI(
            azure_endpoint=ENDPOINT,
            api_key=API_KEY,
            api_version=API_VERSION
        )

        ###### request message ######
        Content = combined_string + '해당 리뷰 10개에 대해 좋은점과 불편한점을 요약해주고 나쁜점에 대한 솔루션을 한줄로 다른말 붙이지 말고 JSON 데이터로제공해줘'

        message = [
            {
                "role": "system",
                "content": "우리는 지금 대한민국 경상북도 경로당에 대한 리뷰를 보고 문제를 파악한 후 솔루션을 제공할 거야",
            },
            {
                "role": "user",
                "content": Content
            }
        ]

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=message
        )

        # response 결과 json 화    
        json_string = completion.choices[0].message.content
        result = json.loads(json_string)
        print(result)
        
        response = {
            "code": 200,
            "msg": 'success',
            'result': result
        }
    except Exception as e:
        print(f"{e}")
        code = "999"
        msg = "정의되지 않은 error입니다."
        response = {
            "code": code,
            "msg": msg
        }
    return jsonify(response)

@app.route("/Review_Rating", methods=['POST'])
def Rating():
    print(request.json)
    try:
        data = request.json

        ###################
        ##DB_Reviews_Data##
        ###################    
        mssql_engine = create_engine(
            f"mssql+pyodbc://{admin}:{password}@{host}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
        )

        SC_NAME = data['SC_NAME']
        ADDRESS = data['ADDRESS']
        print(SC_NAME)
        print(ADDRESS)
        
        sql = "SELECT TOP 10 * FROM Reviews WHERE SC_NAME = N'%s' AND ADDRESS = N'%s' ORDER BY Review_Date DESC" % (SC_NAME, ADDRESS)

        df = pd.read_sql_query(sql, mssql_engine)

        review_list = df['Review'].tolist()

        ###################
        ##Text__Analytics##
        ###################  
        text_analytics_client = TextAnalyticsClient(text_analytics_endpoint, AzureKeyCredential(text_analytics_key))
        
        response = text_analytics_client.analyze_sentiment(review_list)
        successful_responses = [doc for doc in response if not doc.is_error]
        successful_responses

        rating = 0

        for i in successful_responses:
            rating += i['confidence_scores']['positive']

        mean = (rating / len(successful_responses)) / 2

        rating = mean * 10

        response = {
            "code": 200,
            "msg": 'success',
            'result': rating
        }
    except Exception as e:
        print(f"{e}")
        code = "999"
        msg = "정의되지 않은 error입니다."
        response = {
            "code": code,
            "msg": msg
        }
    return jsonify(response)

@app.route("/location", methods=['GET'])
def Location():
    # DB 연결
    try:
        mssql_engine = create_engine(
            f"mssql+pyodbc://{admin}:{password}@{host}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
        )
        
        sql = "SELECT * FROM Locations"
        df = pd.read_sql_query(sql, mssql_engine)

        records = df.to_dict(orient='records')
        json_data = json.loads(json.dumps(records, indent=4))
        
        response = {
            "code": 200,
            "msg": 'success',
            'result': json_data
        }
    except Exception as e:
        print(f"{e}")
        code = "999"
        msg = "정의되지 않은 error입니다."
        response = {
            "code": code,
            "msg": msg
        }
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)