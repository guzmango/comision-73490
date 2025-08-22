# Book Suggestions

>"Books are a uniquely portable magic"
- Stephen King

##How to Use
The user can select the desired literary genre and how many book recommendations they want to see (from 1 to 50 random books).
When button "Get Suggestions" is clicked, a list of books from the selected genre will be displayed.
Book data is retrieved from the [Open Library Search API](https://openlibrary.org/dev/docs/api/search).
Each list item includes the book cover, author, star rating and buttons to show more details and share the url.
These suggestions are saved in session storage, to be deleted once the browser is closed.
Button "Clear" removes these suggestions from the session storage.

###Wishlist
It is also possible to save a username so you can add any of the book suggestions to your wishlist.
Items in the wishlist include the book cover, author and genre. 
The username and the wishlist are saved in local storage.
Button "Clear Wishlist" removes the wishlist from local storage.
Button "Delete Username" removes the **username and wishlist** from local storage.