import sqlite3


conn = sqlite3.connect("taskflow.db")
cursor = conn.cursor()


cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)
""")

cursor.execute("""
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    deadline date
)
""")

cursor.execute("""
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  status TEXT,
  project_id INTEGER
)
""")

cursor.execute(""" alter table projects add deadline date; """)

cursor.execute(""" ALTER TABLE tasks ADD COLUMN completed INTEGER DEFAULT 0; """)

conn.commit()
conn.close()

print("Database created correctly")
