const MAX_BOOKS = 100;
const GUEST_WORD = "Guest";
const SEARCH_API_URL = "https://openlibrary.org/search.json?fields=key,title,author_name,cover_i,first_publish_year,first_sentence,ratings_average,ratings_count,subject&q=subject%3A_GENRE_+language%3Aeng&limit=100&sort=rating";
const COVER_URL = "https://covers.openlibrary.org/b/id/_COVER_I_-M.jpg";

// DOM locators
const userNameInput = document.getElementById("user-name-input");
const userSaveButton = document.getElementById('user-save-button');
const userDeleteButton = document.getElementById("user-delete-button");
const userNameLabel = document.getElementById("user-name-label");
const wishlistDeleteButton = document.querySelector('#wishlist-delete-button');

/* -------------- DOM SETUP -------------- */

//Hide spinner at initial load
document.querySelector('.lds-spinner').style.display = "none";

//Verify if user exists in local storage when page is loaded
//If it does, show the name on the Wishlist section
//and disable button "Save Username" and text input 
const username = localStorage.getItem('username');
if (username) {
    userNameLabel.textContent = username;
    userNameInput.readOnly = true;
    userSaveButton.disabled = true;
} else {
    userNameLabel.textContent = GUEST_WORD;
    userNameInput.readOnly = false;
    userSaveButton.disabled = false;
}

//Verify if a current wishlist exists on local storage and display it
const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
displayWishlist(wishlist);

//Verify if there are any previous suggestions saved in session storage when page is loaded
const prevSelectedOptions = JSON.parse(sessionStorage.getItem('prevSelectedOptions')) || {};
const prevSuggestions = JSON.parse(sessionStorage.getItem("prevSuggestions")) || [];
if (prevSelectedOptions && prevSuggestions.length > 0) {
    //show previous recommendations
    displaySelectedOptions(prevSelectedOptions, true);
    displayBookSuggestions(prevSuggestions);
} else {
    //set default status
    clearSelectedOptions();
}

//  Save User Event handler
userSaveButton.addEventListener('click', function() {
    const userForm = document.querySelector("#user-form");
    if (!userForm.checkValidity()) {
        userForm.classList.add('was-validated');
    } else {
        //save username in local storage to keep it after browser is closed
        const username = userNameInput.value;

        localStorage.setItem('username', username);
        userNameLabel.textContent = username;

        //clear username fields
        userNameInput.readOnly = true;
        userSaveButton.disabled = true;

        //enable "Add to wishlist" buttons
        document.querySelectorAll('.btn-wish').forEach(button => {
            button.disabled = false;
        });
    }
});

// Delete User event handler
userDeleteButton.addEventListener("click", (e) => {
    localStorage.removeItem('username');
    userNameLabel.textContent = GUEST_WORD;
    userNameInput.value = "";
    userNameInput.readOnly = false;
    userSaveButton.disabled = false;
    clearWishlist();

    document.querySelectorAll('.btn-wish').forEach(button => {
        button.disabled = true;
    });
});

wishlistDeleteButton.addEventListener("click", (e) => {
    clearWishlist();
});

//  Event handler para el formulario
document.querySelector("#suggestions-options-form").addEventListener("submit", (e) => {
    //avoid page refresh
    e.preventDefault();

    //clean selected options
    clearSelectedOptions();

    //clean recommendations section
    clearBookSuggestions();

    //load books from the REST API
    loadBooks();
});

//  Event handler for "Clear" suggestions button
document.getElementById("suggestions-delete-button").addEventListener("click", (e) => {
    clearSelectedOptions();
    clearBookSuggestions();

    //clear session storage
    sessionStorage.removeItem('prevSuggestions');
    sessionStorage.removeItem('prevSelectedOptions');
});

/* -------------- FUNCTIONS -------------- */
function saveSelectedOptions() {
    //get selected genre
    const suggestionsGenreSelect = document.querySelector("#suggestions-genre-select");
    const genreText = suggestionsGenreSelect.options[suggestionsGenreSelect.selectedIndex].label;
    
    //get suggestions quantity
    const qty = parseInt(document.getElementById("suggestions-qty-input").value);

    //save current selection in session storage
    let currentSelection = { genre: genreText, qty: qty };
    sessionStorage.setItem('prevSelectedOptions', JSON.stringify(currentSelection));

    //display selected genre and suggestions quantity
    displaySelectedOptions(currentSelection);
}

//Load books from Open Library REST API
async function loadBooks() {
    const suggestionsGenreSelect = document.querySelector("#suggestions-genre-select");
    const genre = suggestionsGenreSelect.value;

    //show spinner to indicate data is being loaded
    document.querySelector('.lds-spinner').style.display = "block";

    try {
        const response = await fetch(`${SEARCH_API_URL.replace("_GENRE_", genre)}`);
        if (!response.ok) {
            throw new Error("Something went wrong!");
        } 
        
        const data = await response.json();

        //get suggestions quantity
        const qty = parseInt(document.getElementById("suggestions-qty-input").value);

        //map property values (rating and book details)
        const mappedBooks = getBookSuggestions(qty, data.docs);
        let bookSuggestions = mappedBooks.map((current) => {
            let roundedRating = Number(current.ratings_average).toFixed(2);
            return {...current, selected_genre: genre, ratings_average: roundedRating};
        });
        
        //save book data matching current selection in session storage
        sessionStorage.setItem('prevSuggestions', JSON.stringify(bookSuggestions));

        //display book details and cover 
        displayBookSuggestions(bookSuggestions);

        //save selected options in session storage and display message
        saveSelectedOptions();

    } catch (error) {
        //show alert with error message
        showErrorAlert(error.message);
    } finally {
        //hide spinner once the request is done
        document.querySelector('.lds-spinner').style.display = "none";
    }
}

function loadBookDetails(book) {
    const genreList = book.subject.map(item => `<span class="badge bg-primary mb-1 me-1">${item}</span>`);
    Swal.fire({
        title: `<strong>${book.title}</strong>`,
        html: `
            <p>${book.first_sentence && book.first_sentence.length > 0 ? book.first_sentence[0] : ""}</p>
            <p><strong>Autor:</strong> ${book.author_name.join(', ')}</p>
            <p><strong>Publish Date:</strong> ${book.first_publish_year}</p>
            <p><strong>Rating:</strong> ${book.ratings_average} <i class="bi bi-star"></i> <i>(${book.ratings_count} ratings)</i></p>
            <h6>Subjects:</h6>
            <p>${genreList.join('')}</p>
        `,
        imageUrl: getImageSrc(book.cover_i),
        imageAlt: book.title,
        showCloseButton: true
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message
    });
}

function getBookSuggestions(qty, catalog) {
    // loop to get random book suggestions
    const suggestions = [];
    do {
        let book = catalog[getRandomIndex()];
        //avoid duplicated references to the same book
        if (!suggestions.includes(book)) {
            suggestions.push(book);
        }
    } while (suggestions.length < qty);
    return suggestions;
}

function getRandomIndex() {
    //when using floor, the max value is not included in the result
    return Math.floor(Math.random() * MAX_BOOKS);
}

function clearSelectedOptions() {
    //clear content and hide elements
    const element = document.getElementById('selected-options-content');
    element.innerHTML = "";
    element.hidden = true;
}

function clearBookSuggestions() {
    const element = document.getElementById('suggestions-content');
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function displaySelectedOptions(selectedOptions, previousSession = false) {
    const selectedOptionsContent = document.getElementById('selected-options-content');
    const word = selectedOptions.qty > 1 ? "results" : "results";
    selectedOptionsContent.hidden = false;
    selectedOptionsContent.innerHTML = "";

    if (previousSession) {
        selectedOptionsContent.innerHTML = `
        <div class="alert alert-primary d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Info:"><use xlink:href="#info-fill"/></svg>
            <div>
                This was your previous selection: <span class="fw-bold">${selectedOptions.qty}</span> ${word} from genre <span class="fw-bold">"${selectedOptions.genre}"</span>
            </div>
        </div>
        `;
    } else {
        selectedOptionsContent.innerHTML = `
        <div class="alert alert-success d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>
            <div>
                Showing <span class="fw-bold">${selectedOptions.qty}</span> ${word} from genre <span class="fw-bold">"${selectedOptions.genre}"</span>
            </div>
        </div>
        `;
    }
}

function getImageSrc(coverId) {
    return COVER_URL.replace("_COVER_I_", coverId);
}

function displayBookSuggestions(recs) {
    const suggestionsContent = document.getElementById("suggestions-content");
    recs.forEach(book => {
        const bookCard = document.createElement("div");
        bookCard.className = "col";
        bookCard.innerHTML = `
            <div class="card text-center pb-2">
                <img src="${getImageSrc(book.cover_i)}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted text-capitalize fw-light">${book.author_name}</h6>
                    <span class="badge bg-light text-dark">${book.ratings_average} <i class="bi bi-star"></i></span>
                    <button type="button" id="book_share_button_${book.key}" class="btn btn-light btn-sm" data-book-key="${book.key}">
                        <span class="bi-box-arrow-up"></span>
                    </button>
                    <div class="d-grid gap-2 col-8 mx-auto">
                        <button id="book_show_button_${book.key}" class="btn btn-link btn-sm text-reset mb-2" type="button">Show more<i class="bi bi-chevron-down ms-1"></i></button>
                    </div>
                    <button id="btn_wish_${book.key}" class="btn-wish btn btn-outline-secondary btn-sm" type="button"><i class="bi bi-heart-fill"></i> Add to Wishlist</button>
                </div>
            </div>
        `;
                    
        suggestionsContent.appendChild(bookCard);

        //add event listener to wishlist button
        const btnWishlist = document.getElementById(`btn_wish_${book.key}`);
        btnWishlist.dataset.book = JSON.stringify(book);
        btnWishlist.addEventListener("click", addBookToWishlist);

        //add event listener to share button
        const btnShareBook = document.getElementById(`book_share_button_${book.key}`);
        btnShareBook.addEventListener("click", openSharePopup);

        //add event listener to show more button
        const btnShowMore = document.getElementById(`book_show_button_${book.key}`);
        btnShowMore.addEventListener("click", function() {
            loadBookDetails(book);
        });
    });

    //Disable add to wishlist buttons if the book has already been added to the wishlist
    //or if there is no saved username
    enableWishlistButtons();
}

function openSharePopup(e) {
    let bookKey = e.currentTarget.dataset.bookKey;
    let url = `https://openlibrary.org/${bookKey}`;
    Swal.fire({
        title: "Share",
        html: `
            <div class="d-grid gap-2 col-8 mx-auto">
                <button type="button" id="book_copy_button_${bookKey}" class="btn btn-light btn-lg">
                    <span class="bi-share me-2"></span>Copy Link
                </button>
                <button type="button" id="book_open_button_${bookKey}" class="btn btn-light btn-lg mb-2">
                    <span class="bi bi-box-arrow-up-right me-2"></span>Open Link in New Tab
                </button>
            </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        focusConfirm: false
    });

    //add event listener to buttons
    const btnCopyLink = document.getElementById(`book_copy_button_${bookKey}`);
    btnCopyLink.addEventListener("click", function() {
        copyUrlToClipboard(url);
    });
    const btnOpenLink = document.getElementById(`book_open_button_${bookKey}`);
    btnOpenLink.addEventListener("click", function() {
        openUrl(url);
    });
}

async function copyUrlToClipboard(url) {
    try {
        await navigator.clipboard.writeText(url);
        Toastify({
            text: "Link copied to clipboard successfully!",
            duration: 3000
            }).showToast();
    } catch(err) {
        showErrorAlert(`Failed to copy text: ${err.message}`);
    }
}

function openUrl(url) {
    window.open(url, "_blank");
}

function addBookToWishlist(e) {
    const book = JSON.parse(e.currentTarget.dataset.book);
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (!wishlist.find(item => item.key === book.key)) {
        //add book to the wishlist only if it hasn't been added previously
        wishlist.push(book);
        //save updated array in localStorage
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        displayWishlist(wishlist);
    }

    //disable button
    e.currentTarget.disabled = true;

    //show sweet alert to confirm book was added to wishlist
    Swal.fire({
        title: 'Added to your wishlist',
        icon: 'success',
        confirmButtonText: 'Ok'
    });
}

function displayWishlist(wishlist = []) {
    const wishlistDiv = document.querySelector("#wishlist");

    if (wishlist.length === 0) {
        wishlistDiv.innerHTML = `
        <div class="alert alert-secondary" role="alert">
            There are no books in your Wishlist
        </div>
        `;
    } else {
        wishlistDiv.innerHTML = "";
        wishlist.forEach(book => {
            //get genre display name
            let genre = [...document.querySelector("#suggestions-genre-select").options].find(opt => opt.value === book.selected_genre);
            
            const card = document.createElement('div');
            card.classList.add('card', 'mb-3');
            card.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-3">
                        <img src="${getImageSrc(book.cover_i)}" class="img-fluid rounded-start" alt="${book.title}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body text-start">
                            <h6 class="card-title text-start">${book.title}</h6>
                            <span class="card-text"><small class="text-muted">${book.author_name}</small></span>
                            <span class="badge bg-dark ms-1">${genre.label}</span><br/>
                            <button id="wish_show_button_${book.key}" class="btn btn-link btn-sm text-reset mt-2 ps-0" type="button">Show more<i class="bi bi-chevron-down ms-1"></i></button>
                            <button id="wish_delete_button_${book.key}" class="btn btn-light btn-sm mt-2" data-key="${book.key}"><i class="bi bi-trash3"></i></button><br/>
                        </div>
                    </div>
                </div>
            `;
            wishlistDiv.appendChild(card);

            //add event handler to delete book from wishlist
            const btnDeleteBook = document.getElementById(`wish_delete_button_${book.key}`);
            btnDeleteBook.addEventListener("click", removeBookFromWishlist);

            //add event listener to show more button
            const btnShowMore = document.getElementById(`wish_show_button_${book.key}`);
            btnShowMore.addEventListener("click", function() {
                loadBookDetails(book);
            });
        });
    }
}

function removeBookFromWishlist(e) {
    const bookId = e.currentTarget.dataset.key;

    //show alert to confirm if book should be removed from wishlist
    Swal.fire({
        title: "Are you sure?",
        text: "The book will be permanently removed from your wishlist.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const username = localStorage.getItem('username');
            let index = wishlist.findIndex(book => book.key === bookId);
            if (index !== -1) {
                wishlist.splice(index, 1);
                //update wishlist in local storage and display it again
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                displayWishlist(wishlist);

                //show confirmation message
                Swal.fire({
                    title: "Deleted!",
                    text: "The book has been deleted from your wishlist.",
                    icon: "success"
                });

                //change add to wishlist button disabled attribute if available
                const addButton = document.getElementById(`btn_wish_${bookId}`);
                if (addButton)
                    addButton.disabled = !username;
            }
        }
    });
}

function enableWishlistButtons() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const username = localStorage.getItem('username');
    document.querySelectorAll('.btn-wish').forEach(button => {
        const bookIndex = wishlist.findIndex(book => book.key === JSON.parse(button.dataset.book).key);
        button.disabled = bookIndex > -1 || !username;
    });
}

function clearWishlist() {
    //remove wishlist from local storage
    localStorage.removeItem('wishlist');
    //remove wishlist items from DOM
    displayWishlist();
    //disable "Add to wishlist" buttons
    document.querySelectorAll('.btn-wish').forEach(boton => {
        boton.disabled = !username;
    });
}