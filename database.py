"""
DS Lab Portal — Data Science Digital Library
Database Management Module (MySQL 8 Connection Pool & Helper)
"""

import os
import mysql.connector
from mysql.connector import pooling, Error
from dotenv import load_dotenv

load_dotenv()

# Database Configuration from Environment Variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "dslab_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ds_lab")
DB_POOL_NAME = "dslab_pool"
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))

connection_pool = None

def init_connection_pool():
    """Initializes the MySQL connection pool."""
    global connection_pool
    if connection_pool is not None:
        return connection_pool

    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name=DB_POOL_NAME,
            pool_size=DB_POOL_SIZE,
            pool_reset_session=True,
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
            autocommit=True
        )
        print(f"[MySQL] Connection pool '{DB_POOL_NAME}' established successfully at {DB_HOST}:{DB_PORT}/{DB_NAME}")
        return connection_pool
    except Error as e:
        print(f"[MySQL Warning] Could not establish connection pool: {e}")
        return None

def get_db_connection():
    """Returns a connection from the pool or opens a direct connection."""
    pool = init_connection_pool()
    if pool:
        try:
            return pool.get_connection()
        except Error as e:
            print(f"[MySQL Error] Failed to get connection from pool: {e}")
    
    # Direct fallback connection
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
            autocommit=True
        )
        return conn
    except Error as e:
        print(f"[MySQL Error] Direct connection failed: {e}")
        raise e

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Executes a parameterized SQL query safely.
    Prevents SQL injection by strictly using parameterized queries.
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        elif commit or cursor.lastrowid or cursor.rowcount:
            if not conn.autocommit:
                conn.commit()
            result = {
                "last_insert_id": cursor.lastrowid,
                "rows_affected": cursor.rowcount
            }
        return result
    except Error as e:
        print(f"[Database Query Error]: {e} | Query: {query}")
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def check_db_health():
    """Checks database availability and returns status."""
    try:
        conn = get_db_connection()
        if conn.is_connected():
            conn.close()
            return {"status": "connected", "database": DB_NAME, "host": DB_HOST}
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}
