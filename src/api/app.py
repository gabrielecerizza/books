from hashlib import sha256

from flask import Flask, request
from flask_cors import CORS

import db
import recsys
import topic

app = Flask(__name__)
CORS(app)


@app.route("/books")
def get_books():
    text_filter = request.args.get("textFilter")
    min_year = request.args.get("minYear")
    max_year = request.args.get("maxYear")
    min_price = request.args.get("minPrice")
    max_price = request.args.get("maxPrice")
    sort_attribute = request.args.get("sortAttribute")
    sort_direction = request.args.get("sortDirection")
    print("SORT: ", sort_attribute, sort_direction)
    return db.get_books(text_filter, min_year, max_year, min_price, max_price, sort_attribute, sort_direction)

@app.route("/delete_book/<id>", methods=["DELETE"])
def delete_book(id=None):
    print(id)
    return db.delete_book(str(id))

@app.route("/add_book", methods=["POST"])
def add_book():
    book = request.get_json()
    
    title = book.get("title")
    author = book.get("author")
    year = book.get("year")
    price = book.get("price")
    description = book.get("description")
    return db.add_book(title, author, year, price, description)

@app.route("/edit_book", methods=["PUT"])
def edit_book():
    book = request.get_json()
    
    id = book.get("id")
    title = book.get("title")
    author = book.get("author")
    year = book.get("year")
    price = book.get("price")
    description = book.get("description")
    return db.edit_book(id, title, author, year, price, description)

@app.route("/add_user", methods=["POST"])
def add_user():
    user = request.get_json()
    
    username = user.get("username")
    email = user.get("email")
    password = sha256(user.get("password").encode(encoding="UTF-8")).hexdigest()
    res = db.add_user(username, email, password)
    print("add_user res", res)
    return (res, 200) if res["user_id"] != "None" else ("Username already chosen", 400)

# PUT instead of GET to avoid having the password as a URL parameter
@app.route("/auth_user", methods=["PUT"])
def auth_user():
    print("AUTH USER request ", request)
    user = request.get_json()
    print("AUTH USER user ", user)
    username = user.get("username")
    print("AUTH USER username ", username)
    password = sha256(user.get("password").encode(encoding="UTF-8")).hexdigest()
    print("AUTH USER password ", password)
    return db.authenticate_user(username, password)

@app.route("/reviews/<book_id>")
def get_reviews(book_id=None):
    print(book_id)
    return db.get_reviews(str(book_id))

@app.route("/add_review", methods=["POST"])
def add_review():
    review = request.get_json()
    
    book_id = review.get("bookId")
    user_id = review.get("userId")
    username = review.get("username")
    score = review.get("score")
    time = review.get("time")
    review_text = review.get("reviewText")
    return db.add_review(book_id, user_id, username, score, time, review_text)

@app.route("/user_reviews")
def get_user_reviews():
    user_id = request.args.get("userId")
    sort_attribute = request.args.get("sortAttribute")
    sort_direction = request.args.get("sortDirection")
    print("SORT: ", sort_attribute, sort_direction)
    return db.get_user_reviews(user_id, sort_attribute, sort_direction)

@app.route("/increase_user_spend", methods=["PUT"])
def increase_user_spend():
    payload = request.get_json()
    
    user_id = payload.get("userId")
    total = payload.get("total")
    return db.increase_user_spend(user_id, total)

@app.route("/recommendations")
def get_recommendations():
    user_id = request.args.get("userId")
    model_name = request.args.get("modelName")
    if model_name == "nnmf":
        return recsys.get_recommended_nnmf(user_id=user_id)
    elif model_name == "nmf":
        return recsys.get_recommended_nmf(user_id=user_id)
    elif model_name == "multivae":
        return recsys.get_recommended_multivae(user_id=user_id)
    else:
        raise ValueError("Unknown model name: ", model_name)
    
@app.route("/topics")
def get_topics():
    book_id = request.args.get("bookId")
    return topic.get_topics(book_id)

@app.route("/add_bookmark", methods=["POST"])
def add_bookmark():
    payload = request.get_json()
    print("payload", payload)
    
    user_id = payload.get("userId")
    book_id = payload.get("bookId")
    print("user_id", user_id)
    print("book_id", book_id)
    return db.add_bookmark(user_id, book_id)

@app.route("/delete_bookmark", methods=["DELETE"])
def delete_bookmark():
    payload = request.get_json()
    print("payload", payload)
    
    user_id = payload.get("userId")
    book_id = payload.get("bookId")
    print("user_id", user_id)
    print("book_id", book_id)
    return db.delete_bookmark(user_id, book_id)

@app.route("/bookmarks")
def get_bookmarks():
    user_id = request.args.get("userId")
    attribute = request.args.get("attribute")
    direction = request.args.get("direction")
    print("get_bookmarks: user_id, attribute, direction:", user_id, attribute, direction)
    return db.get_bookmarks(user_id, attribute, direction)

@app.route("/has_bookmark")
def check_has_bookmark():
    user_id = request.args.get("userId")
    book_id = request.args.get("bookId")
    return db.check_has_bookmark(user_id, book_id)