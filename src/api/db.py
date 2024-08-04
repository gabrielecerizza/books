import uuid

import psycopg2

from config import load_config


def get_books(
        text_filter=None, min_year=None, max_year=None, 
        min_price=None, max_price=None, 
        sort_attribute=None, sort_direction=None):
    
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT B1.id, B1.title, B1.author, B1.year, B1.price, B1.description, A.avg " 
            sql += "FROM book AS B1 LEFT JOIN (SELECT B2.id, AVG(R.score) AS avg FROM book AS B2 JOIN review AS R ON B2.id = R.book_id GROUP BY B2.id) AS A ON B1.id = A.id "
            sql += "WHERE (B1.year BETWEEN {0} AND {1}) AND (B1.price BETWEEN {2} AND {3})".format(min_year, max_year, min_price, max_price)
            if text_filter != '':
                sql += " AND (LOWER(B1.title) LIKE '%{0}%' OR LOWER(B1.author) LIKE '%{0}%')".format(text_filter.lower())
            if sort_attribute != 'null':
                sql += " ORDER BY B1.{0} {1}".format(sort_attribute, sort_direction)

            print("get_books query: ", sql)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "title": row[1], "author": row[2], "year": row[3], "price": row[4], "description": row[5], "avg": row[6]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        # print("get_books rows:", rows)
        return rows


def delete_book(book_id):

    rows_deleted  = 0
    sql = "DELETE FROM book WHERE id = %s"
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                
                cur.execute(sql, (book_id,))
                rows_deleted = cur.rowcount

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return str(rows_deleted)
    

def add_book(title, author, year, price, description):

    sql = """INSERT INTO book(id, title, author, year, price, description)
             VALUES(%s, %s, %s, %s, %s, %s) RETURNING id;"""
    
    book_id = None
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql, (str(uuid.uuid4()), title, author, year, price, description))
               
                rows = cur.fetchone()
                if rows:
                    book_id = rows[0]

                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return {"book_id": book_id}
    

def edit_book(book_id, title, author, year, price, description):
    
    updated_row_count = 0

    sql = """ UPDATE book
                SET title = %s, author = %s, year = %s, price = %s, description = %s
                WHERE id = %s"""
    
    config = load_config()
    
    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                
                cur.execute(sql, (title, author, year, price, description, book_id))
                updated_row_count = cur.rowcount

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return str(updated_row_count)
    

def add_user(username, email, password):
    sql = """INSERT INTO registered_user(username, email, password, spend)
             VALUES(%s, %s, %s, 0) RETURNING id;"""
    
    user_id = None
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql, (username, email, password))
               
                rows = cur.fetchone()
                if rows:
                    user_id = rows[0]

                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return {"user_id": str(user_id)}
    

def authenticate_user(username, password):
    print("api authenticate_user ", username, password)
    user_id = None
    spend = None
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT * FROM registered_user WHERE (username = '{0}') AND (password = '{1}')".format(username, password)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    user_id = row[0]
                    spend = row[4]
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return [str(user_id or -1), spend]
    

def get_reviews(book_id):
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT * FROM review WHERE book_id = '{0}' ORDER BY time DESC".format(book_id)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "book_id": row[1], "user_id": row[2], 
                           "username": row[3], "score": row[4], "time": row[5], 
                           "review_text": row[6]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return rows
    

def get_all_reviews():
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT * FROM review"

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "book_id": row[1], "user_id": row[2], 
                           "username": row[3], "score": row[4], "time": row[5], 
                           "review_text": row[6]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return rows
    

def get_all_registered_users():
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT * FROM registered_user"

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "username": row[1], "email": row[2], 
                           "password": row[3], "spend": row[4]}
                    rows.append(obj)
                    row = cur.fetchone()
                    
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return rows
    

def get_all_books():
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT B1.id, B1.title, B1.author, B1.year, B1.price, B1.description, A.avg " 
            sql += "FROM book AS B1 JOIN (SELECT B2.id, AVG(R.score) AS avg FROM book AS B2 JOIN review AS R ON B2.id = R.book_id GROUP BY B2.id) AS A ON B1.id = A.id "

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "title": row[1], "author": row[2], 
                           "year": row[3], "price": row[4], "description": row[5], "avg": row[6]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return rows
    

def add_review(book_id, user_id, username, score, time, review_text):
    sql = """INSERT INTO review(book_id, user_id, username, score, time, review_text)
             VALUES(%s, %s, %s, %s, %s, %s) RETURNING id;"""
    
    review_id = None
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql, (book_id, user_id, username, score, time, review_text))
               
                rows = cur.fetchone()
                if rows:
                    review_id = rows[0]

                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return str(review_id)
    

def get_user_reviews(user_id, sort_attribute, sort_direction):
    
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT review.id, review.book_id, review.user_id, review.username, review.score, review.time, review.review_text, book.title FROM review JOIN book ON review.book_id = book.id WHERE user_id = '{0}' ORDER BY {1} {2}".format(user_id, sort_attribute, sort_direction)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "book_id": row[1], "user_id": row[2], 
                           "username": row[3], "score": row[4], "time": row[5], 
                           "review_text": row[6], "book_title": row[7]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return rows
    

def increase_user_spend(user_id, total):
    
    updated_row_count = 0

    sql = """ UPDATE registered_user
                SET spend = spend + %s
                WHERE id = %s"""
    
    config = load_config()
    
    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                
                cur.execute(sql, (total, user_id))
                updated_row_count = cur.rowcount

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return str(updated_row_count)
    

def add_bookmark(user_id, book_id):

    sql = """INSERT INTO bookmark(user_id, book_id)
             VALUES(%s, %s) RETURNING user_id;"""
    
    res = None
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                cur.execute(sql, (user_id, book_id))
               
                rows = cur.fetchone()
                if rows:
                    res = rows[0]

                conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return {"user_id": res}
    

def delete_bookmark(user_id, book_id):

    rows_deleted  = 0
    sql = "DELETE FROM bookmark WHERE user_id = %s AND book_id = %s"
    config = load_config()

    try:
        with  psycopg2.connect(**config) as conn:
            with  conn.cursor() as cur:
                
                cur.execute(sql, (user_id, book_id))
                rows_deleted = cur.rowcount

            conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)    
    finally:
        return str(rows_deleted)
    

def get_bookmarks(user_id, sort_attribute=None, sort_direction=None):
    
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT B1.id, B1.title, B1.author, B1.year, B1.price, B1.description, A.avg " 
            sql += "FROM (book AS B JOIN bookmark AS BK ON B.id = BK.book_id) AS B1 LEFT JOIN (SELECT B2.id, AVG(R.score) AS avg FROM book AS B2 JOIN review AS R ON B2.id = R.book_id GROUP BY B2.id) AS A ON B1.id = A.id "
            sql += "WHERE B1.user_id = {0}".format(user_id)
            if sort_attribute and sort_attribute != 'null':
                sql += " ORDER BY B1.{0} {1}".format(sort_attribute, sort_direction)

            print("get_bookmarks query: ", sql)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    # print(row)
                    obj = {"id": row[0], "title": row[1], "author": row[2], "year": row[3], "price": row[4], "description": row[5], "avg": row[6]}
                    rows.append(obj)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        # print("get_books rows:", rows)
        # print("bookmarks:", rows)
        return rows


def check_has_bookmark(user_id, book_id):
    rows = []
    config  = load_config()
    
    try:
        with psycopg2.connect(**config) as conn:

            sql = "SELECT * FROM bookmark WHERE user_id = {0} AND book_id = '{1}'".format(user_id, book_id)

            with conn.cursor() as cur:
                
                cur.execute(sql)
                row = cur.fetchone()

                while row is not None:
                    rows.append(row)
                    row = cur.fetchone()
                    

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        return {"num": len(rows)}


if __name__ == "__main__":
    print(get_all_reviews())