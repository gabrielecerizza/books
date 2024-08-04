import { useEffect, useState } from 'react';
import { Button } from 'react-daisyui';
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { Account } from "./components/pages/Account"
import AddBook from "./components/pages/AddBook"
import { Alert } from './components/Alert';
import BookDetails from './components/pages/BookDetails';
import { BookTable } from './components/BookTable';
import Cart from "./components/pages/Cart"
import CommunicationController from './controller';
import EditBook from "./components/pages/EditBook"
import Navbar from "./components/Navbar"
import { Recommendations } from './components/pages/Recommendations';


function SearchBar({ loadBooks, setBookFilter, setCurrentPageNumber }) {
  
  const [formValues, setFormValues] = useState({
    textFilter: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleInputChange = (event) => {
      const { name, value } = event.target;
      console.log("SearchBar handleInputChange", name, value)
      setFormValues({
          ...formValues,
          [name]: value
      });
  };

  const handleSubmit = (event) => {
      event.preventDefault();
      const formValuesToSend = {
        textFilter: formValues.textFilter,
        minYear: parseInt(formValues.minYear) || 0,
        maxYear: parseInt(formValues.maxYear) || 9999,
        minPrice: parseInt(formValues.minPrice) || 0,
        maxPrice: parseInt(formValues.maxPrice) || 9999
      }
      console.log("SearchBar Form Values:", formValues);
      console.log("SearchBar Form Values to Send:", formValuesToSend);
      setBookFilter(formValues)
      setCurrentPageNumber(1)
      loadBooks(formValuesToSend)
  };
  
  return (
    <div className="flex justify-center m-4">
      <div className="join">
        <form onSubmit={handleSubmit}>
          <input
            className="input input-bordered join-item" 
            type="text" 
            placeholder="Title or author..." 
            name="textFilter"
            value={formValues.textFilter}
            onChange={handleInputChange}
          />
          <input
            className="input input-bordered join-item" 
            placeholder='Min Year...'
            name="minYear"
            type='number'
            min={0}
            max={9999}
            value={formValues.minYear}
            onChange={handleInputChange}
          />
          <input
            className="input input-bordered join-item" 
            placeholder='Max Year...'
            name="maxYear"
            type='number'
            min={0}
            max={9999}
            value={formValues.maxYear}
            onChange={handleInputChange}
          />
          <input
            className="input input-bordered join-item"
            type="number"
            step="0.01"
            name="minPrice"
            placeholder='Min Price...'
            min={0}
            max={9999}
            value={formValues.minPrice}
            onChange={handleInputChange}
          />
          <input
            className="input input-bordered join-item"
            type="number"
            step="0.01"
            name="maxPrice"
            placeholder='Max Price...'
            min={0}
            max={9999}
            value={formValues.maxPrice}
            onChange={handleInputChange}
          />
          <button className="btn btn-neutral join-item -translate-y-0.5" type="submit">Filter</button>
        </form>
      </div>
    </div>
  );
}

function FilterableBookTable({ currentUser, books, setBooks, bookFilter, setBookFilter, loadBooks, cart, setCart, showAlert }) {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  
  return (
    <div>
      <SearchBar 
        loadBooks={loadBooks} 
        setBookFilter={setBookFilter} 
        setCurrentPageNumber={setCurrentPageNumber} />
      <BookTable 
        currentUser={currentUser} 
        books={books} 
        setBooks={setBooks} 
        loadBooks={loadBooks} 
        bookFilter={bookFilter} 
        currentPageNumber={currentPageNumber} 
        setCurrentPageNumber={setCurrentPageNumber} 
        cart={cart} 
        setCart={setCart} 
        canSort={true} 
        showAlert={showAlert} />
    </div>
  );
}

function Home({ currentUser, cart, setCart, showAlert }) {
  const [books, setBooks] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true)
  const [bookFilter, setBookFilter] = useState({
    textFilter: '', minYear: 0, maxYear: 9999, minPrice: 0, maxPrice: 9999
  })

  const loadBooks = (bookFilter=null, sortAttribute=null, sortDirection=null) => {
    console.log("loadBooks called")
    const bookFilterToSend = {
      textFilter: bookFilter ? bookFilter.textFilter : '',
      minYear: bookFilter && bookFilter.minYear ? bookFilter.minYear : 0,
      maxYear: bookFilter && bookFilter.maxYear ? bookFilter.maxYear : 9999,
      minPrice: bookFilter && bookFilter.minPrice ? bookFilter.minPrice : 0,
      maxPrice: bookFilter && bookFilter.maxPrice ? bookFilter.maxPrice : 9999
    }
      
    CommunicationController.getBooks(bookFilterToSend, sortAttribute, sortDirection)
      .then(data => {
        console.log("loadBooks data:", data)
        setBooks(data)
        setShowSpinner(false)
      })
      .catch(err => console.log(err.message))
  }

  useEffect(() => {
    loadBooks()
  }, []);

  return (
    <>
      {
        showSpinner ? (
          <Button size="lg" loading="true">loading</Button>
        ) : (
          <FilterableBookTable 
            currentUser={currentUser} 
            books={books} 
            setBooks={setBooks} 
            bookFilter={bookFilter} 
            setBookFilter={setBookFilter} 
            loadBooks={loadBooks} 
            cart={cart} 
            setCart={setCart} 
            showAlert={showAlert} />
        )
      }
    </>
  )
}

function App() {
  function retrieveUser() {
    if (localStorage.getItem("id") && Number(localStorage.getItem("id")) > 0) {
      return {
        id: localStorage.getItem("id"),
        username: localStorage.getItem("username"),
        spend: Number(localStorage.getItem("spend"))
      }
    } else {
      return null
    }
  }
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(retrieveUser());
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState("Alert Text Example")
  const [alertClassName, setAlertClassName] = useState("alert-error")

  function showAlert(text, className) {
    setAlertText(text)
    setIsAlertVisible(true);
    setAlertClassName(className)
    setTimeout(() => {
      setIsAlertVisible(false);
    }, 2000);
  }

  document.getElementsByTagName("html")[0].setAttribute("data-theme", "light");

  return (
    <div className="min-h-screen bg-white">
      <BrowserRouter>
        <Navbar currentUser={currentUser} cart={cart} />
        <div className="relative m-4 flex justify-center h-full max-h-full w-auto">
          <Alert isAlertVisible={isAlertVisible} alertText={alertText} alertClassName={alertClassName} />
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} cart={cart} setCart={setCart} showAlert={showAlert} />} />
            <Route path="/bookdetails" element={<BookDetails currentUser={currentUser} showAlert={showAlert} />} />
            <Route path="/editbook" element={<EditBook showAlert={showAlert} />} />
            <Route path="/addbook" className="" element={<AddBook showAlert={showAlert} />} />
            <Route path="/recommendations" element={<Recommendations currentUser={currentUser} cart={cart} setCart={setCart} showAlert={showAlert} />} />
            <Route path="/cart" element={<Cart currentUser={currentUser} setCurrentUser={setCurrentUser} cart={cart} setCart={setCart} showAlert={showAlert} />}/>
            <Route path="/account" element={<Account currentUser={currentUser} setCurrentUser={setCurrentUser} cart={cart} setCart={setCart} showAlert={showAlert} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App;