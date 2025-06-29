#!/usr/bin/env python
import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db():
    """Wait for database to be available"""
    db_conn = None
    while not db_conn:
        try:
            db_conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST', 'db'),
                port=os.getenv('POSTGRES_PORT', '5432'),
                user=os.getenv('POSTGRES_USER', 'user'),
                password=os.getenv('POSTGRES_PASSWORD', 'password'),
                database=os.getenv('POSTGRES_DB', 'petcare')
            )
            print("Database connection successful!")
        except OperationalError:
            print("Database unavailable, waiting 1 second...")
            time.sleep(1)

if __name__ == '__main__':
    wait_for_db() 