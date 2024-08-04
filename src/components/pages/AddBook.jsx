import { useState } from 'react';

import CommunicationController from '../../controller';


export default function AddBook({ showAlert }) {
    
    const [formValues, setFormValues] = useState({
        title: '',
        author: '',
        year: '',
        price: '',
        description: ''
    });
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Form Values:", formValues);
        CommunicationController.addBook(formValues)
            .then(data => {
                console.log("AddBook:handleSubmit: new book id: ", data)
                showAlert("Book successfully added", "alert-success")
            })
            .catch(err => {
                console.log(err.message)
                showAlert("Could not add book", "alert-error")
            })

        setFormValues({
            title: '',
            author: '',
            year: '',
            price: '',
            description: ''
        });
    };

    return (
        <div className="flex flex-col justify-center">
            <h1 className="mb-4 text-4xl font-extrabold self-center">Add Book</h1>
            <div className="BookForm">
                <form onSubmit={handleSubmit}>
                <label className="input input-bordered flex items-center gap-2">
                    Title:
                    <input
                        className="grow"
                        type="text"
                        name="title"
                        value={formValues.title}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <label className="input input-bordered flex items-center gap-2">
                    Author:
                    <input
                        className="grow"
                        type="text"
                        name="author"
                        value={formValues.author}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <label className="input input-bordered flex items-center gap-2">
                    Year:
                    <input
                        className="grow"
                        type="number"
                        name="year"
                        min={0}
                        max={9999}
                        value={formValues.year}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <label className="input input-bordered flex items-center gap-2">
                    Price ($):
                    <input
                        className="grow"
                        type="number"
                        step="0.01"
                        name="price"
                        min={0}
                        max={9999}
                        value={formValues.price}
                        onChange={handleInputChange}
                    />
                </label>
                <br />
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Description (optional)</span>
                    </div>
                    <textarea 
                        className="textarea textarea-bordered" 
                        placeholder="Description"
                        name="description"
                        value={formValues.description}
                        onChange={handleInputChange} 
                    />
                </label>
                <br />
                <button className="btn btn-neutral w-full" type="submit">Add</button>
                </form>
            </div>
        </div>
    );
}