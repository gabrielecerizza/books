import CommunicationController from "../../controller";


function CartRow({ book, handleDeleteFromCart }) {
    console.log("CartRow: ", book)
  
    return (
      <tr>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>{book.year}</td>
        <td>{book.price}</td>
        <td>
            <div className="tooltip" data-tip="Delete from Cart">
                <button className="btn" onClick={() => handleDeleteFromCart(book)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </td>
      </tr>
    );
  }

export default function Cart({ currentUser, setCurrentUser, cart, setCart, showAlert }) {
    console.log(cart)

    function handleDeleteFromCart(book) {
        console.log("handleDeleteFromCart: book to remove: ", book)
        let newCart = cart.filter(e => e.id !== book.id)
        console.log("handleDeleteFromCart: newCart: ", newCart)
        setCart(newCart)
    }

    function handleBuyClick() {
        console.log("handleBuyClick with cart: ", cart)
        let total = 0;
        for (let i = 0; i < cart.length; i++) {
            total += parseFloat(cart[i].price);
        }
        console.log("Sum", total)
        setCart([])
        
        CommunicationController.increaseUserSpend(currentUser.id, total)
            .then(data => {
                console.log("handleBuyClick data:", data)
                localStorage.setItem("spend", currentUser.spend + total)
                const newCurrentUser = {...currentUser, spend: (parseFloat(currentUser.spend) + parseFloat(total)).toFixed(2)}
                setCurrentUser(newCurrentUser)
                showAlert("Spent a total of $" + total.toFixed(2), "alert-success")
            })
            .catch(err => {
                console.log(err.message)
                showAlert("Could not buy", "alert-error")
            })
    }

    const cartRows = []
    cart.forEach((book, index) => {
        cartRows.push(
          <CartRow
            className="hover"
            book={book}
            key={book.id}
            handleDeleteFromCart={handleDeleteFromCart} />
        );
      });

    return (
        <div className="flex flex-col justify-center">
            <h1 className="mb-4 text-4xl font-extrabold self-center">Cart</h1>
            {
                cart.length > 0 ? (
                    <div className="flex flex-col justify-center">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <span>Title</span>
                                    </th>
                                    <th>
                                        <span>Author</span>
                                    </th>
                                    <th>
                                        <span>Year</span>
                                    </th>
                                    <th>
                                        <span>Price</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartRows}
                            </tbody>
                        </table>
                        <button className="mt-4 btn btn-neutral w-fit self-center" onClick={handleBuyClick}>Buy</button>
                    </div>
                ) : (
                    <p>No books in the cart</p>
                )
            }
        </div>
    )
}