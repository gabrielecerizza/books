import ast
import re
from datetime import datetime

import pandas as pd


BASE_PATH = "E:/datasets/books/"


def parse_date(date_str):
    try:
        date = pd.to_datetime(date_str, errors='raise')
    except:
        if re.match(r'^\d{4}$', date_str):  # Matches YYYY
            date = pd.to_datetime(date_str + '-01-01', format='%Y-%m-%d', errors='coerce')
        elif re.match(r'^\d{4}-\d{2}$', date_str):  # Matches YYYY-MM
            date = pd.to_datetime(date_str + '-01', format='%Y-%m-%d', errors='coerce')
        elif re.match(r'^\d{4}\*$', date_str):  # Matches YYYY*
            date = pd.to_datetime(date_str[:-1] + '-01-01', format='%Y-%m-%d', errors='coerce')
        else:
            date = pd.to_datetime(date_str, errors='coerce')
    return date


def extract_authors(authors_string):
    try:
        authors_list = ast.literal_eval(authors_string)
        if isinstance(authors_list, list):
            return authors_list
        else:
            raise ValueError("The provided string does not evaluate to a list.")
    except (ValueError, SyntaxError) as e:
        print(f"Error parsing authors string: {e}")
        return []


def get_book_rows(num=100, base_path=BASE_PATH):
    book_df = pd.read_csv(base_path + "books_data.csv")
    book_df = book_df.dropna(subset=[
        "Title", "authors", "publishedDate", "description"])

    review_df = pd.read_csv(base_path + "books_rating.csv")
    review_df = review_df.dropna()

    review_counts = review_df.groupby("Id").size().reset_index(name="review_count")
    unique_books_df = review_df.drop_duplicates(subset=["Id", "Title"])
    unique_books_df = unique_books_df.merge(review_counts, on="Id")
    unique_books_df = unique_books_df.sort_values(by="review_count", ascending=False)
    unique_books_df = unique_books_df.merge(book_df, on="Title").iloc[0:num]
    ids = unique_books_df["Id"].unique()
    unique_books_df = unique_books_df[
        ["Id", "Title", "Price", "authors", "description", "publishedDate"]]
    published = pd.to_datetime(
        unique_books_df["publishedDate"].apply(parse_date), utc=True)
    unique_books_df["publishedDate"] = published.dt.year
    unique_books_df = unique_books_df.dropna()
    
    rows = []
    for record in unique_books_df.to_numpy():
        try:
            row = (record[0], record[1], "; ".join(extract_authors(record[3])), 
                   int(record[5]), float(record[2]), record[4])
            rows.append(row)
        except:
            print(record)
    return rows, ids


def get_book_reviews(ids, base_path=BASE_PATH):
    book_df = pd.read_csv(base_path + "books_data.csv")
    book_df = book_df.dropna(subset=[
        "Title", "authors", "publishedDate", "description"])

    review_df = pd.read_csv(base_path + "books_rating.csv")
    review_df = review_df.dropna()
    res_df = review_df[review_df["Id"].isin(ids)][
        ["Id", "User_id", "profileName", "review/score", "review/time", "review/text"]]
    res_df["review/time"] = res_df["review/time"].apply(datetime.fromtimestamp)
    return res_df.to_numpy()
    

    

