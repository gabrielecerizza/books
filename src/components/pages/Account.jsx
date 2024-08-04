import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-daisyui';

import { BookReviewsList } from '../BookReviewsList';
import { BookTable } from '../BookTable';
import CommunicationController from '../../controller';


export function SignIn({ currentUser, setCurrentUser, isLogin, setIsLogin, showAlert }) {
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    remember: false
  });

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    console.log("Sign-up handleInputChange:", name, value, event.target.checked)
    if (name === "remember") {
      value = event.target.checked
    }
    setFormValues({
        ...formValues,
        [name]: value
    });
  };

  const handleSubmit = (event) => {
    console.log("SignIn handleSubmit: isLogin: event", isLogin, event)
    
    event.preventDefault();
    let formToSend = {
      username: formValues.username,
      password: formValues.password
    }
    console.log("Sign-in Form Values:", formValues);
    CommunicationController.authUser(formToSend)
            .then(data => {
                console.log("SignIn:handleSubmit: return: ", data)
                if (data[0] < 0) {
                  console.log("Wrong username or password")
                  showAlert("Wrong username or password", "alert-error")
                } else {
                  setCurrentUser({
                    id: data[0],
                    username: formValues.username,
                    spend: Number(data[1])
                  })
                  // showAlert("Sign-in successful", "alert-success")
                  if (formValues.remember) {
                    localStorage.setItem("id", data[0])
                    localStorage.setItem("username", formValues.username)
                    localStorage.setItem("spend", Number(data[1]))
                  }
                }
            })
            .catch(err => {
              console.log(err.message)
              showAlert("Could not sign in", "alert-error")
            })
  };

  function handleButtonClick() {
    console.log("SignIn handleButtonClick")
    setIsLogin(false)
    console.log("SignIn handleButtonClick: isLogin", isLogin)
  }

  return (
    <div className="flex flex-col justify-center">
      <h3 className="mb-4 text-4xl font-extrabold self-center">Sign In</h3>
      <form onSubmit={handleSubmit}>
        <label className="mb-4 input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          <input 
            type="text" 
            className="grow" 
            placeholder="Username"
            name="username"
            minLength="1"
            value={formValues.username}
            onChange={handleInputChange}
          />
        </label>
        <label className="mb-4 input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd" />
          </svg>
          <input 
            type="password"
            name="password" 
            className="grow" 
            minLength="1"
            placeholder="Password"
            value={formValues.password}
            onChange={handleInputChange}
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Remember me</span>
          <input 
            type="checkbox"  
            className="checkbox"
            id="customCheck1"
            name="remember"
            checked={formValues.remember}
            onChange={handleInputChange}
          />
        </label>
        <div className="mt-2 flex justify-center">
          <button type="submit" className="btn btn-neutral w-full">
            Sign In
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm forgot-password text-right">
        No account? <Link className="link link-primary" onClick={handleButtonClick}>Register a new one!</Link>
      </p>
    </div>
  )
}

export function SignUp({ currentUser, setCurrentUser, setIsLogin, showAlert }) {
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: ''
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
    console.log("Sign-up Form Values:", formValues);
    
    if (!formValues.username || !formValues.email || !formValues.password) {
      showAlert("Invalid username, e-mail or password", "alert-error")
    } else {
      CommunicationController.addUser(formValues)
            .then(data => {
                console.log("SignUp:handleSubmit: new user id: ", data)
                showAlert("Sign-up successful", "alert-success")
            })
            .catch(err => {
              console.log("Error in addUser", err.message)
              showAlert("Sign-up error", "alert-error")
            })

      setFormValues({
        username: '',
        email: '',
        password: ''
      });
    }
  };

  function handleButtonClick() {
    console.log("SignUp click on button")
    setIsLogin(true)
  }

  return (
    <div className="flex flex-col justify-center">
      <h3 className="mb-4 text-4xl font-extrabold self-center">Sign Up</h3>
      <form onSubmit={handleSubmit}>
        <label className="mb-4 input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          <input 
            type="text" 
            className="grow" 
            placeholder="Username"
            name="username"
            minLength="1"
            value={formValues.username}
            onChange={handleInputChange}
          />
        </label>
        <label className="mb-4 input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path
              d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input 
            type="text" 
            className="grow" 
            placeholder="Email" 
            name="email"
            minLength="1"
            value={formValues.email}
            onChange={handleInputChange}
          />
        </label>
        <label className="mb-4 input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd" />
          </svg>
          <input 
            type="password"
            name="password" 
            className="grow" 
            minLength="1"
            placeholder="Password"
            value={formValues.password}
            onChange={handleInputChange}
          />
        </label>
        <div className="mt-2 flex justify-center">
          <button type="submit" className="btn btn-neutral w-full">
            Sign Up
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm forgot-password text-right">
        Already registered? <Link className="link link-primary" onClick={handleButtonClick}>Sign in!</Link>
      </p>
    </div>
  )
}

export function SignOut({ currentUser, setCurrentUser, setIsLogin, cart, setCart, showAlert }) {
  console.log("SignOut currentUser", currentUser)
  const [reviews, setReviews] = useState([]);
  const [showReviewSpinner, setShowReviewSpinner] = useState(true)
  const [bookmarks, setBookmarks] = useState([])
  const [currentBookmarkPageNumber, setCurrentBookmarkPageNumber] = useState(1) 
  
  function handleSignOutButtonClick() {
    setIsLogin(true)
    setCurrentUser(null)
    localStorage.setItem("id", -1)
  }

  const handleGetUserBookmarks = useCallback((formValues, attribute, direction) => {
    console.log("callBack getUserBookmarks for user", currentUser)
    console.log("callBack getUserBookmarks attribute, direction:", attribute, direction)
    function getUserBookmarks(attribute, direction) {
      console.log("getUserBookmarks for user", currentUser)
      console.log("getUserBookmarks attribute, direction:", attribute, direction)
      CommunicationController.getUserBookmarks(currentUser.id, attribute || "", direction || "")
        .then(data => {
          console.log("getUserBookmarks data:", data)
          setBookmarks(data)
        })
        .catch(err => console.log(err.message))
    }
    getUserBookmarks(attribute, direction)
  }, [currentUser])

  const handleLoadUserReviews = useCallback(() => {
    const loadUserReviews = (sortAttribute=null, sortDirection=null) => {
      console.log("loadUserReviews called")
      if (sortAttribute == null) {
        sortAttribute = "time"
      }
      if (sortDirection == null) {
        sortDirection = "DESC"
      }
        
      CommunicationController.getUserReviews(currentUser.id, sortAttribute, sortDirection)
        .then(data => {
          console.log("loadUserReviews data:", data)
          setReviews(data)
          setShowReviewSpinner(false)
        })
        .catch(err => console.log(err.message))
    }
    loadUserReviews()
  }, [currentUser])

  function specialHandleDeleteBook(book, loadBooks) {
    console.log("Clicked delete book " + book.title)
        CommunicationController.deleteBook(book.id)
          .then(data => {
            console.log("BookTable:handleDeleteBook: ", data)
            loadBooks()
            handleLoadUserReviews()
            showAlert("Book succesfully deleted", "alert-success")
          })
          .catch(err => {
              console.log(err.message)
              showAlert("Could not delete book", "alert-error")
          })
  }

  useEffect(() => {
    handleGetUserBookmarks()
    handleLoadUserReviews()
  }, [currentUser, handleGetUserBookmarks, handleLoadUserReviews]);

  return (
    <div className="flex flex-col min-w-full">
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={handleSignOutButtonClick}>Logout</button>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="mb-4 text-6xl font-extrabold self-center">Hi, {currentUser.username}</h1>
        <h1 className="mb-4 text-2xl font-extrabold self-center">Money spent: ${currentUser.spend}</h1>
      </div>
      {
        bookmarks.length > 0 ? (
          <div className="mb-4 mt-6 border rounded p-4 border-base-300 flex flex-col justify-center min-w-full">
            <h1 className="mb-4 text-4xl font-extrabold self-center">Bookmarked Books</h1>
            <BookTable  
              currentUser={currentUser} 
              books={bookmarks} 
              setBooks={setBookmarks} 
              loadBooks={handleGetUserBookmarks} 
              currentPageNumber={currentBookmarkPageNumber} 
              setCurrentPageNumber={setCurrentBookmarkPageNumber} 
              canSort={true} 
              cart={cart} 
              setCart={setCart}
              showAlert={showAlert}
              specialHandleDeleteBook={specialHandleDeleteBook}
            />
          </div>
        ) : (
          <></>
        )
      }
      {
        reviews.length > 0 ? (
          <div className="mb-4 mt-6 border rounded p-4 border-base-300 flex flex-col justify-center min-w-full">
            <h1 className="mb-4 text-4xl font-extrabold self-center">Own Reviews</h1>
            <BookReviewsList reviews={reviews} showSpinner={showReviewSpinner} showBookName={true} showUserName={false} />
          </div>
        ) : (
          <></>
        )
      }
    </div>
  )
}

export function Account({ currentUser, setCurrentUser, cart, setCart, showAlert }) {
  const [isLogin, setIsLogin] = useState(true)

  let cont = null
  if (currentUser) {
    cont = <SignOut currentUser={currentUser} setCurrentUser={setCurrentUser} setIsLogin={setIsLogin} cart={cart} setCart={setCart} showAlert={showAlert} />
  } else {
    if (isLogin) {
      cont = <SignIn currentUser={currentUser} setCurrentUser={setCurrentUser} isLogin={isLogin} setIsLogin={setIsLogin} showAlert={showAlert} />
    } else {
      cont = <SignUp currentUser={currentUser} setCurrentUser={setCurrentUser} setIsLogin={setIsLogin} showAlert={showAlert} />
    }
  }

  return (
    <>
      {cont}
    </>
  )
}