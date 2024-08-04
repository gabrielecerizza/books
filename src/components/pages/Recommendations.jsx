import { useState } from 'react';
import { Button, Divider } from "react-daisyui";

import { BookTable } from "../BookTable";
import CommunicationController from "../../controller"


export function Recommendations({ currentUser, cart, setCart, showAlert }) {
    const [showSpinner, setShowSpinner] = useState(true);
    const [showRecs, setShowRecs] = useState(false);
    const [modelName, setModelName] = useState("nmf")
    const [recs, setRecs] = useState([])
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const bookFilter = {
        textFilter: '', 
        minYear: 0, 
        maxYear: 9999, 
        minPrice: 0, 
        maxPrice: 9999
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        console.log("handleInputChange name value", name, value)
        setModelName(value);
    };

    function loadRecs() {
        console.log("Clicked loadRecs with model: ", modelName)
        setShowRecs(true)
        setShowSpinner(true)
        CommunicationController.getRecommendations(currentUser.id, modelName)
            .then(data => {
                console.log("handleRecommendClick data: ", data)
                setRecs(data)
                setShowSpinner(false)
                // showAlert("Book successfully added", "alert-success")
            })
            .catch(err => {
                console.log(err.message)
                // showAlert("Could not add book", "alert-error")
            })
    }

    function handleRecommendClick() {
        console.log("handleRecommendClick with user: ", currentUser)
        loadRecs()
    }

    const recCont = showSpinner ? (
        <Button size="lg" loading="true">loading</Button>
    ) : (
        <BookTable 
            currentUser={currentUser} 
            books={recs} 
            setBooks={setRecs} 
            loadBooks={loadRecs} 
            bookFilter={bookFilter}
            currentPageNumber={currentPageNumber}
            setCurrentPageNumber={setCurrentPageNumber}
            canSort={false} 
            cart={cart} 
            setCart={setCart} 
            showAlert={showAlert} />
    )
    
    return (
        <>
            { 
                currentUser ? (
                    <>
                        <div className="flex flex-col justify-center">
                            <h1 className="mb-4 text-4xl font-extrabold self-center">Recommendations</h1>
                            <label className="form-control w-full max-w-xs self-center">
                                <div className="label">
                                    <span className="label-text">Pick a recommender model</span>
                                </div>
                                <select 
                                    className="select select-bordered"
                                    name="model" 
                                    onChange={handleInputChange} 
                                    value={modelName}
                                    >
                                    <option value="nmf">Sklearn Matrix Factorization</option>
                                    <option value="nnmf">PyTorch Matrix Factorization</option>
                                    <option value="multivae">Multinomial VAE</option>
                                </select>
                            </label>
                            <button className="mt-4 btn btn-neutral w-fit self-center" onClick={handleRecommendClick}>Recommend books</button>
                            {
                                showRecs &&
                                <>
                                    <Divider />
                                    {recCont}
                                </>
                            }
                        </div>
                    </>
                ) : ( 
                    <></> 
                ) 
            }
        </>
    )
}