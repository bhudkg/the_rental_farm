import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="rental_farm",
    user="rashmi",
    password="Rashmi@2006"
)
conn.autocommit = True
cur = conn.cursor()

commands = [
    "GRANT ALL ON SCHEMA public TO rashmi",
    "GRANT CREATE ON SCHEMA public TO rashmi",
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rashmi",
    "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rashmi",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rashmi",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rashmi",
]

for cmd in commands:
    cur.execute(cmd)
    print(f"OK: {cmd}")

conn.close()
print("\nAll permissions granted successfully!")
