import { useState } from "react";
import { Button, Rating } from "react-daisyui";

import { Pagination } from "./Pagination";


function BookReview({ review, showBookName, showUserName }) {
    return (
        <li>
            <div className="shadow-md border rounded mb-4 p-4 flex flex-col">
                { 
                    showBookName ? (
                        <h1 className="mb-4 text-2xl font-extrabold self-center">{review.book_title}</h1>
                    ) : (
                        <></>
                    )
                }
                {
                    showUserName ? (
                        <h2 className="mb-2 text-xl font-extrabold">{review.username}</h2>
                    ) : (
                        <></>
                    )
                }
                <Rating className="mb-4" value={review.score} >
                    <Rating.Item name="rating-1" className="mask mask-star" />
                    <Rating.Item name="rating-1" className="mask mask-star" />
                    <Rating.Item name="rating-1" className="mask mask-star" />
                    <Rating.Item name="rating-1" className="mask mask-star" />
                    <Rating.Item name="rating-1" className="mask mask-star" />
                </Rating>
                {review.review_text}
                <div className="text-neutral/75 text-sm italic mt-2 flex justify-end">
                    <span>{review.time}</span>
                </div> 
            </div>
        </li>
    )
}

export function BookReviewsList({ reviews, showSpinner, showBookName, showUserName }) {
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    function createList(data) {
        const rows = []
        data.forEach((review, index) => {
            rows.push(
                    <BookReview
                        review={review}
                        showBookName={showBookName}
                        showUserName={showUserName}
                        key={review.id} />
                );
        });

        return (
            <ul>
                {rows}
            </ul>
        )
    }

    return (
        <>
            { 
                showSpinner ? (
                    <Button size="lg" loading="true">loading</Button>
                ) : (
                    <Pagination createList={createList} data={reviews} currentPageNumber={currentPageNumber} setCurrentPageNumber={setCurrentPageNumber} />
                )
            }
        </>
    )
}