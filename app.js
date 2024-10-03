const apiUrl = 'https://testb-0b49.restdb.io/rest/netflix-viewing-history';
const apiKey = '66fe5979f368d415f5577b26';
let currentPage = 1; // Initialize currentPage at the top
const itemsPerPage = 30;
let allMovies = [];
let filteredMovies = []; // Movies filtered by search

// Fetch all movies from RESTdb
async function fetchMovies() {
    try {
        const response = await fetch(`${apiUrl}?sort=Date&dir=-1`, { // Fetch all movies without pagination
            method: 'GET',
            headers: {
                'x-apikey': apiKey
            }
        });
        allMovies = await response.json(); // Store all movies
        renderMovieList(); // Render the movie list for the first time
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Add a new movie
document.getElementById('movieForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;

    const newMovie = {
        Title: title,
        Date: new Date().toISOString().split('T')[0]  // Set current date in YYYY-MM-DD format
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': apiKey
            },
            body: JSON.stringify(newMovie)
        });
        if (response.ok) {
            document.getElementById('title').value = '';  // Clear the input field
            fetchMovies();  // Refresh the list
        }
    } catch (error) {
        console.error('Error adding movie:', error);
    }
});

// Render the movie list
function renderMovieList() {
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    // Determine the movies to display based on the search term
    const moviesToDisplay = filteredMovies.length > 0 ? filteredMovies : allMovies;

    // Pagination logic for displayed movies
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMovies = moviesToDisplay.slice(startIndex, startIndex + itemsPerPage);

    paginatedMovies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        
        // Format date correctly before displaying it
        const formattedDate = movie.Date.split('T')[0]; // Extract only the YYYY-MM-DD part
        
        movieItem.innerHTML = `
            <strong>${movie.Title}</strong>
            <span class="date">${formattedDate}</span>
            <div>
                <button onclick="editMovie('${movie._id}', '${movie.Title}')">Edit</button>
                <button onclick="deleteMovie('${movie._id}')">Delete</button>
            </div>
        `;
        movieList.appendChild(movieItem);
    });

    // Update pagination
    updatePagination(moviesToDisplay.length);
}

// Search movies
document.getElementById('search-bar').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    
    if (searchTerm) {
        // Filter the movies based on the search term
        filteredMovies = allMovies.filter(movie => movie.Title.toLowerCase().includes(searchTerm));
    } else {
        // Reset the filteredMovies to an empty array to show all movies
        filteredMovies = [];
    }
    
    currentPage = 1; // Reset to the first page when searching
    renderMovieList(); // Re-render the list with filtered movies
});

// Delete a movie
async function deleteMovie(movieId) {
    try {
        const response = await fetch(`${apiUrl}/${movieId}`, {
            method: 'DELETE',
            headers: {
                'x-apikey': apiKey
            }
        });
        if (response.ok) {
            fetchMovies();  // Refresh the movie list
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
    }
}

// Edit a movie
async function editMovie(movieId, currentTitle) {
    const newTitle = prompt('Edit Movie Title:', currentTitle); // Prompt the user for a new title
    if (newTitle) {
        const updatedMovie = { Title: newTitle };

        try {
            const response = await fetch(`${apiUrl}/${movieId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-apikey': apiKey
                },
                body: JSON.stringify(updatedMovie)
            });
            if (response.ok) {
                fetchMovies();  // Refresh the movie list after editing
            }
        } catch (error) {
            console.error('Error updating movie:', error);
        }
    }
}

// Pagination control
function updatePagination(displayedCount) {
    const pageInfo = document.getElementById('pageInfo');
    const totalPages = Math.ceil(displayedCount / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Enable/disable buttons based on current page
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0; // Disable if no pages left
}

// Move to the next page
function nextPage() {
    const totalPages = Math.ceil((filteredMovies.length > 0 ? filteredMovies.length : allMovies.length) / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderMovieList(); // Re-render with the new current page
    }
}

// Move to the previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderMovieList(); // Re-render with the new current page
    }
}

// Initial fetch for all movies
async function initialize() {
    await fetchMovies(); // Fetch all movies on initialization
}

initialize();
