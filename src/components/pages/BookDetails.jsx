import { useEffect, useState, useCallback } from 'react';
import { Rating } from 'react-daisyui';
import { useLocation } from 'react-router-dom';

import { BookReviewsList } from '../BookReviewsList';
import CommunicationController from '../../controller';
import { ReviewTopics } from '../ReviewTopics';


export default function BookDetails({ currentUser, showAlert }) {
    const location = useLocation();
    console.log("BookDetails location", location);
    const outlineBookmarkSVG = 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>;
    const solidBookmarkSVG =
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
        </svg>;

    const [reviews, setReviews] = useState([]);
    const [showSpinner, setShowSpinner] = useState(true);
    const [averageScore, setAverageScore] = useState(location.state.avg);
    const [hasBookmark, setHasBookmark] = useState(false)
    const [bookmarkSVG, setBookmarkSVG] = useState(outlineBookmarkSVG)
    const [formValues, setFormValues] = useState({
        reviewText: '',
        score: 0
      });

    

    const handleInputChange = (event) => {
        console.log("BookDetails handleInputChange event", event)
        const { name, value } = event.target;
        console.log("BookDetails handleInputChange", name, value)
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    const handleScoreChange = (value) => {
        console.log("BookDetails handleScoreChange value", value)
        setFormValues({
            ...formValues,
            score: value
        });
    };

    const handleLoadReviews = useCallback(() => {
        const loadReviews = () => {
            console.log("loadReviews called")
              
            CommunicationController.getReviews(location.state.id)
              .then(data => {
                console.log("loadReviews data:", data)
                setReviews(data)
                setShowSpinner(false)
              })
              .catch(err => console.log(err.message))
        }
        loadReviews()
    }, [location.state.id])

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("BookDetails Form Values:", formValues);
        const payload = {
            bookId: location.state.id, 
            userId: currentUser.id, 
            username: currentUser.username, 
            score: formValues.score, 
            time: new Date().toLocaleString(), 
            reviewText: formValues.reviewText
        }
        console.log("payload", payload)

        let hasReviewed = false
        for (let i=0; i < reviews.length; i++) {
            if (currentUser.id.toString() === reviews[i].user_id) {
                hasReviewed = true
            }
        }

        if (!hasReviewed) {
            setShowSpinner(true)
            CommunicationController.addReview(payload)
                .then(data => {
                    console.log("addReview data:", data)
                    handleLoadReviews()
                    let sum = 0
                    for (let i = 0; i < reviews.length; i++) {
                        sum += reviews[i].score
                    }
                    const newAverageScore = sum / reviews.length
                    console.log("Old Average, New Average", averageScore, newAverageScore)
                    setAverageScore(newAverageScore)
                    showAlert("Review successfully added", "alert-success")
                })
                .catch(err => {
                    console.log(err.message)
                    showAlert("Could not add review", "alert-error")
                })
        } else {
            console.log("Has already reviewed book")
            showAlert("You already reviewed this book", "alert-error")
        }
  
        setFormValues({
            reviewText: '',
            score: 0
        });
    };

    function handleClickBookmark() {
        console.log("Clicked handleClickBookmark with user, book_id", currentUser, location.state.id)
        if (hasBookmark) {
            CommunicationController.deleteBookmark(currentUser.id, location.state.id)
                .then(data => {
                    console.log("deleteBookmark data:", data)
                    setHasBookmark(false)
                    setBookmarkSVG(outlineBookmarkSVG)
                })
                .catch(err => {
                    console.log(err.message)
                    showAlert("Could not delete bookmark", "alert-error")
                })
        } else {
            CommunicationController.addBookmark(currentUser.id, location.state.id)
                .then(data => {
                    console.log("addBookmark data:", data)
                    setHasBookmark(true)
                    setBookmarkSVG(solidBookmarkSVG)
                })
                .catch(err => {
                    console.log(err.message)
                    showAlert("Could not add bookmark", "alert-error")
                })
        }
    };

    useEffect(() => {
        function hasBookmark() {
            console.log("hasBookmark")
            CommunicationController.hasBookmark(currentUser.id, location.state.id)
                .then(data => {
                    console.log("hasBookmark data:", data)
                    if (data.num > 0) {
                        setHasBookmark(true)
                        setBookmarkSVG(solidBookmarkSVG)
                    } else {
                        setHasBookmark(false)
                        setBookmarkSVG(outlineBookmarkSVG)
                    }
                })
                .catch(err => {
                    console.log(err.message)
                    showAlert("Could not check bookmark", "alert-error")
                })

        }
        hasBookmark()
        handleLoadReviews()
    }, [location.state.id, handleLoadReviews])

    return (
        <div className="flex flex-col justify-center min-w-full">
            <div>
                <div className="mb-4 min-w-20 border rounded p-4 border-base-300 flex flex-col justify-center">
                    <h1 className="mb-4 text-4xl font-extrabold self-center">Book Details</h1>
                    <label className="flex items-center gap-2">
                        <div className="flex flex-row justify-between w-full">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-extrabold">Title:</h2>
                                {location.state.title}
                            </div>
                            {
                                currentUser && 
                                <div className="scale-150 pr-2">
                                    <button className="btn btn-ghost btn-circle" onClick={handleClickBookmark}>
                                        <div className="tooltip" data-tip="Bookmark">
                                            {bookmarkSVG}
                                        </div>
                                    </button>
                                </div>
                            }
                        </div>
                    </label>
                    <br />
                    <label className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold">Author:</h2>
                        {location.state.author}
                    </label>
                    <br />
                    <label className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold">Year:</h2>
                        {location.state.year}
                    </label>
                    <br />
                    <label className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold">Price ($):</h2>
                        {location.state.price}
                    </label>
                    <br />
                    <label className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold">Avreage Score:</h2>
                        <Rating half="true" value={Math.round(parseFloat(averageScore) * 2)} >
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-1" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-2" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-1" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-2" />

                            <Rating.Item name="rating-10" className="mask mask-star mask-half-1" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-2" />

                            <Rating.Item name="rating-10" className="mask mask-star mask-half-1" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-2" />

                            <Rating.Item name="rating-10" className="mask mask-star mask-half-1" />
                            <Rating.Item name="rating-10" className="mask mask-star mask-half-2" />
                        </Rating>
                        (Exact: {parseFloat(location.state.avg).toFixed(2)})
                    </label>
                    <br />
                    <label className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold">Description:</h2>
                        <span>{location.state.description}</span>
                    </label>
                    <br />
                </div>
                { 
                    currentUser ? (
                        <div className="mb-4 border rounded p-4 border-base-300 flex flex-col justify-center">
                            <div className="flex flex-col justify-center">
                                <h1 className="mb-4 text-4xl font-extrabold self-center">Write a Review</h1>
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <label className="flex items-center gap-2">
                                            <h2 className="text-xl font-extrabold">Review:</h2>
                                            <textarea
                                                className="textarea textarea-bordered textarea-lg w-full h-[150px]" 
                                                type="text" 
                                                placeholder="" 
                                                name="reviewText"
                                                value={formValues.reviewText}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                    </div>
                                    <br />
                                    <div className="w-fit">
                                        <label className="flex items-center gap-2">
                                            <h2 className="text-xl font-extrabold">Score:</h2>
                                            <Rating value={formValues.score} onChange={handleScoreChange} >
                                                <Rating.Item name="rating-1" className="mask mask-star" />
                                                <Rating.Item name="rating-1" className="mask mask-star" />
                                                <Rating.Item name="rating-1" className="mask mask-star" />
                                                <Rating.Item name="rating-1" className="mask mask-star" />
                                                <Rating.Item name="rating-1" className="mask mask-star" />
                                            </Rating>
                                        </label>
                                    </div>
                                    <br />
                                    <div className="flex justify-center">
                                        <button className="btn btn-neutral self-center" type="submit">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )
                }
                <ReviewTopics book={location.state} />
                <div className="mb-4 border rounded p-4 border-base-300 flex flex-col justify-center">
                    <h1 className="mb-4 text-4xl font-extrabold self-center">Reviews</h1>
                    <BookReviewsList reviews={reviews} showSpinner={showSpinner} showBookName={false} showUserName={true} />
                </div>
            </div>
        </div>
    );
}