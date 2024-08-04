import { useState } from "react";
import { Link } from "react-router-dom";

import CommunicationController from "../controller";
import { Pagination } from "./Pagination";


function BookRow({ currentUser, book, handleEditBook, handleDeleteBook, handleAddToCart }) {
    console.log("BookRow: ", book)
  
    return (
      <tr className="hover">
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.year}</td>
        <td>{book.price}</td>
        <td>
          <Link to="/bookdetails" state={book}>
            <div className="tooltip" data-tip="Details">
              <button className="btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </button>
            </div>
          </Link>
        </td>
        <td>
          <Link to="/editbook" state={book}>
            <div className="tooltip" data-tip="Edit">
              <button className="btn" onClick={() => handleEditBook(book)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
            </div>
          </Link>
        </td>
        <td>
          <div className="tooltip" data-tip="Delete">
            <button className="btn" onClick={() => handleDeleteBook(book)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </td>
        {
          currentUser && 
          <td>
            <div className="tooltip" data-tip="Add to Cart">
              <button className="btn" onClick={() => handleAddToCart(book)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </button>
            </div>
          </td>
        }
      </tr>
    );
  }
  
  
export function BookTable({ 
  currentUser, books, setBooks, loadBooks, bookFilter, 
  currentPageNumber, setCurrentPageNumber, canSort, cart, 
  setCart, specialHandleDeleteBook, showAlert }) {
    
    console.log("BookTable: ", books)
    const [lastAttribute, setLastAttribute] = useState(null);
    const [lastDirection, setLastDirection] = useState(null);
  
    function handleEditBook(book) {
      console.log("Clicked edit book " + book.title)
    }
  
    function handleDeleteBook(book) {
      if (specialHandleDeleteBook) {
        specialHandleDeleteBook(book, loadBooks)
      } else {
        console.log("Clicked delete book " + book.title)
        CommunicationController.deleteBook(book.id)
          .then(data => {
            console.log("BookTable:handleDeleteBook: ", data)
            loadBooks()
            showAlert("Book succesfully deleted", "alert-success")
          })
          .catch(err => {
              console.log(err.message)
              showAlert("Could not delete book", "alert-error")
          })
      }
    }
  
    function handleAddToCart(book) {
      console.log("Add to cart: ", book.title)
      let isInCart = false
      for (let i=0; i < cart.length; i++) {
        if (cart[i].id === book.id) {
          isInCart = true
          break
        }
      }
      if (isInCart) {
        showAlert("Book already in cart", "alert-error")
      } else {
        showAlert("Added book to cart", "alert-success")
        let newCart = [...cart]
        newCart.push(book)
        setCart(newCart)
        console.log("Cart:", newCart)
      }
    }
  
    const sortTable = (attribute) => {
      console.log("sortTable called")
      console.log("BEFORE: attribute, last attribute, last direction", attribute, lastAttribute, lastDirection)
      let direction = null
      if (attribute === lastAttribute) {
        if (lastDirection === "ASC") {
          direction = "DESC"
          setLastDirection("DESC")
        } else {
          direction = "ASC"
          setLastDirection("ASC")
        }
      } else {
        setLastAttribute(attribute)
        direction = "ASC"
        setLastDirection("ASC")
      }
  
      console.log("AFTER: attribute, direction, last attribute, last direction: ", attribute, direction, lastAttribute, lastDirection)
      
      console.log("sortTable: ", attribute, direction)
      loadBooks(bookFilter, attribute, direction)
    }
  
    function createTable(books) {
      const rows = []
      books.forEach((book, index) => {
        rows.push(
          <BookRow
            currentUser={currentUser}
            book={book}
            key={book.id}
            handleEditBook={handleEditBook}
            handleDeleteBook={handleDeleteBook}
            handleAddToCart={handleAddToCart} />
        );
      });
  
      return (
        <>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                      <span>Title</span>
                      { canSort &&
                        <button className="btn btn-ghost btn-circle translate-y-2 scale-75" onClick={() => sortTable("title")}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                      }
                  </th>
                  <th>
                    <span>Author</span>
                    { canSort &&
                        <button className="btn btn-ghost btn-circle translate-y-2 scale-75" onClick={() => sortTable("author")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                        </button>
                    }
                  </th>
                  <th>
                    <span>Year</span>
                    { canSort && 
                        <button className="btn btn-ghost btn-circle translate-y-2 scale-75" onClick={() => sortTable("year")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                        </button>
                    }
                  </th>
                  <th>
                    <span>Price</span>
                    { canSort && 
                        <button className="btn btn-ghost btn-circle translate-y-2 scale-75" onClick={() => sortTable("price")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                        </svg>
                        </button>
                    }
                  </th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
        </>
      );
    }
  
    return (
      <Pagination 
        createList={createTable} 
        data={books} 
        currentPageNumber={currentPageNumber} 
        setCurrentPageNumber={setCurrentPageNumber} />
    )
  }