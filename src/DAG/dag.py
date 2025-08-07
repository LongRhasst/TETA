import requests
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def call_to_bot():
    # init bot data
    payload = {"user_id": "12345", "message": "Hello, Bot!"}
    response = requests.post("https://api.example.com/bot", json=payload)
    return response.json()

with DAG(
    dag_id="call_bot",
    start_date=datetime(2025, 6, 8),
    schedule_interval='@daily',

) as dag:

    # Define the task to call the bot
    t1 = call_bot_task = PythonOperator(
        task_id="call_bot",
        python_callable=call_to_bot
    )
    
    # clean data after the bot get
    t2 = clean_data_task = PythonOperator(
        task_id="clean_data",
        python_callable=lambda: print("Data cleaned")
    )
    
    t1 >> t2  # Set task dependencies
    
