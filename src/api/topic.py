from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired
from hdbscan import HDBSCAN
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
from transformers import pipeline
from umap import UMAP

import db


def get_topics(book_id):
    reviews = db.get_reviews(book_id)
    good_reviews = [rev["review_text"] for rev in reviews if rev["score"] >= 4]
    bad_reviews = [rev["review_text"] for rev in reviews if rev["score"] <= 2]
    if len(good_reviews) < 5:
        good_topics = None
    else:
        good_topics = process_reviews(good_reviews)
    if len(bad_reviews) < 5:
        bad_topics = None
    else:
        bad_topics = process_reviews(bad_reviews)
    return {
        "good_topics": good_topics,
        "bad_topics": bad_topics
    }


def process_reviews(texts):
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = embedding_model.encode(texts, show_progress_bar=True)
    num = len(texts)
    umap_model = UMAP(n_neighbors=max(2, num // 10), n_components=max(5, num // 3), min_dist=0.0, metric="cosine", random_state=42)
    hdbscan_model = HDBSCAN(min_cluster_size=max(2, num // 10), metric="euclidean", cluster_selection_method="eom", prediction_data=True)
    vectorizer_model = CountVectorizer(stop_words="english", ngram_range=(1, 2))
    keybert_model = KeyBERTInspired()
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device="cuda")

    representation_model = {
        "KeyBERT": keybert_model
    }

    topic_model = BERTopic(
        embedding_model=embedding_model,
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer_model,
        representation_model=representation_model,

        top_n_words=10,
        verbose=True
    )
    topics, probs = topic_model.fit_transform(texts, embeddings)
    # print(topic_model.get_topic_info())

    aspects = [topic[:2] for topic in topic_model.get_topic_info()["KeyBERT"]]
    res = []
    for i, cluster_docs in enumerate(topic_model.get_topic_info()["Representative_Docs"]):
        first_doc = cluster_docs[0][:4000]
        # print("DOC LENGTH", len(first_doc), first_doc)
        if len(first_doc) <= 130:
            summary = first_doc
        else:
            summary = summarizer(first_doc, max_length=130, min_length=30, do_sample=False)[0]["summary_text"]
        d = {"aspects": aspects[i], "summary": summary}
        res.append(d)
    
    return res
