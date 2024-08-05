import psycopg2
from config import load_config
from dataset import get_book_rows, get_book_reviews


def create_tables():
    commands = (
        """
        CREATE TABLE book (
            id VARCHAR PRIMARY KEY,
            title VARCHAR NOT NULL,
            author VARCHAR NOT NULL,
            year INTEGER NOT NULL,
            price DECIMAL(12,2) NOT NULL,
            description VARCHAR
        )
        """,
        """
        CREATE TABLE registered_user (
            id SERIAL PRIMARY KEY,
            username VARCHAR NOT NULL UNIQUE,
            email VARCHAR NOT NULL,
            password VARCHAR NOT NULL,
            spend DECIMAL(12,2) NOT NULL
        )
        """,
        """
        CREATE TABLE review (
            id SERIAL PRIMARY KEY,
            book_id VARCHAR NOT NULL,
            user_id VARCHAR NOT NULL,
            username VARCHAR NOT NULL,
            score INTEGER NOT NULL,
            time TIMESTAMP NOT NULL,
            review_text VARCHAR,
            CONSTRAINT review_fk
                FOREIGN KEY(book_id) REFERENCES book(id)
                ON UPDATE CASCADE ON DELETE CASCADE
        )
        """,
        """
        CREATE TABLE bookmark (
            book_id VARCHAR NOT NULL,
            user_id INTEGER NOT NULL,
            CONSTRAINT bookmark_pk
                PRIMARY KEY(book_id, user_id),
            CONSTRAINT book_fk
                FOREIGN KEY(book_id) REFERENCES book(id)
                ON UPDATE CASCADE ON DELETE CASCADE,
            CONSTRAINT user_fk
                FOREIGN KEY(user_id) REFERENCES registered_user(id)
                ON UPDATE CASCADE ON DELETE CASCADE
        )
        """,
        )
    try:
        config = load_config()
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                for command in commands:
                    cur.execute(command)
    except (psycopg2.DatabaseError, Exception) as error:
        print(error)


def insert_books(book_list):

    sql = "INSERT INTO book(id, title, author, year, price, description) VALUES(%s, %s, %s, %s, %s, %s) RETURNING *"
    config = load_config()
    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.executemany(sql, book_list)

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)


def insert_reviews(review_list):

    sql = "INSERT INTO review(book_id, user_id, username, score, time, review_text) VALUES(%s, %s, %s, %s, %s, %s) RETURNING *"
    config = load_config()
    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.executemany(sql, review_list)

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)  


def reset_tables():
    commands = (
        """
        DROP TABLE bookmark
        """,
        """
        DROP TABLE review
        """,
        """
        DROP TABLE registered_user
        """,
        """
        DROP TABLE book
        """,
        )
    try:
        config = load_config()
        with psycopg2.connect(**config) as conn:
            with conn.cursor() as cur:
                for command in commands:
                    cur.execute(command)
    except (psycopg2.DatabaseError, Exception) as error:
        print(error)


if __name__ == "__main__":
    # reset_tables()
    create_tables()
    print("Created tables")
    book_rows, ids = get_book_rows(num=100)
    print("Loaded books from dataset")
    book_reviews = get_book_reviews(ids)
    print("Loaded reviews from dataset")
    insert_books(book_rows)
    print("Added books")
    insert_reviews(book_reviews)
    print("Added reviews")