import { useState } from "react"
import { Button } from "react-daisyui"

import CommunicationController from "../controller"


function TopicRow({ topicData }) {
    console.log("TopicRow topicData:", topicData)
    
    return (
        <li className="flex flex-col pl-4 pr-4 pb-4">
            <p className="text-justify">{topicData["summary"]}</p>
        </li>
    )
}

function TopicSet({ topicsData }) {
    console.log("TopicSet topicsData:", topicsData)

    function topicRows() {
        const rows = []
        topicsData.forEach((topicData, index) => {
            rows.push(
            <TopicRow
                key={"topic" + index}
                topicData={topicData}
                />
            );
        });
        return rows
    }

    return (
        <ul>
            {
                topicsData ? (
                    topicRows()
                ) : (
                    <li className="flex flex-col pl-4 pr-4 pb-4">
                        <p className="text-justify">
                            Not enough reviews to extract topics.
                        </p>
                    </li>
                )
            }
        </ul>
    )
}


export function ReviewTopics({ book }) {
    console.log("ReviewTopics book:", book)

    const [clickedShow, setClickedShow] = useState(false)
    const [showSpinner, setShowSpinner] = useState(true)
    const [goodTopics, setGoodTopics] = useState(null)
    const [badTopics, setBadTopics] = useState(null)

    function getTopics() {
        CommunicationController.getTopics(book.id)
        .then(data => {
            console.log("ReviewTopics received topic data:", data)
            setGoodTopics(<TopicSet topicsData={data["good_topics"]} />)
            setBadTopics(<TopicSet topicsData={data["bad_topics"]} />)
            setShowSpinner(false)
        })
        .catch(err => {
            console.log(err.message)

        })
    }

    function handleOnClick() {
        console.log("Clicked on show review topics")
        setClickedShow(true)
        getTopics()
    }

    const topicsSection = <>
        {
            showSpinner ? (
                <Button size="lg" loading="true" className="flex self-center w-fit">loading</Button>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="pt-4 shadow-md border-2 border-green-500 rounded flex flex-col">
                        <h1 className="text-2xl pb-2 font-extrabold self-center">Good</h1>
                        <ul>
                            {goodTopics}
                        </ul>
                    </div>
                    <div className="pt-4 shadow-md border-2 border-red-500 rounded flex flex-col">
                        <h1 className="text-2xl pb-2 font-extrabold self-center">Bad</h1>
                        <ul>
                            {badTopics}
                        </ul>
                    </div>
                </div>
            )
        }
    </>

    return (
        <div className="mb-4 border rounded p-4 border-base-300 flex flex-col justify-center">
            <h1 className="mb-4 text-4xl font-extrabold self-center">Review Topics</h1>
            {
                !clickedShow ? (
                    <button className="btn btn-neutral w-fit self-center" onClick={handleOnClick}>Show</button>
                ) : (
                    topicsSection
                )
            }
        </div>
    )
}