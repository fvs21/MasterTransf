import sqlite3
import os
from contextlib import contextmanager
from pathlib import Path

# Database file path
DB_PATH = Path(__file__).parent.parent.parent / "data" / "users.db"

def init_db():
    """Initialize the database and create tables if they don't exist"""
    # Create data directory if it doesn't exist
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            customer_id TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def get_user_by_nickname(nickname: str):
    """Get user by nickname"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
        return cursor.fetchone()

def get_user_by_customer_id(customer_id: str):
    """Get user by customer_id"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE customer_id = ?", (customer_id,))
        return cursor.fetchone()

def create_user(nickname: str, password: str, customer_id: str):
    """Create a new user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (nickname, password, customer_id) VALUES (?, ?, ?)",
            (nickname, password, customer_id)
        )
        conn.commit()
        return cursor.lastrowid
