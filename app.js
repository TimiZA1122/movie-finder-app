document.addEventListener('DOMContentLoaded', () => {
  const apiKey = '3327790c4e9da72d8587ca70c9ec6c29'; // Replace with your actual API key
  const movieContainer = document.getElementById('movieContainer');
  const genreFilter = document.getElementById('genreFilter');

  // Fetch and display available genres in the dropdown
  async function fetchGenres() {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    data.genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreFilter.appendChild(option);
    });
  }

  // Function to fetch movies based on search query and/or genre
  async function fetchMovies(query) {
    const genreId = genreFilter.value;
    let url;

    movieContainer.innerHTML = ''; // Clear previous results

    if (genreId) {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;
      if (query) {
        url += `&query=${query}`;
      }
    } else {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      displayMovies(data.results);
    } else {
      movieContainer.innerHTML = '<p>No results found.</p>';
    }
  }

  // Display movie search results
  function displayMovies(movies) {
    movieContainer.innerHTML = ''; // Clear previous results
    movies.forEach((movie, index) => {
      const movieCard = document.createElement('div');
      movieCard.classList.add('col-md-4', 'mb-4', 'movie-card'); // Add movie-card class for animation
      movieCard.innerHTML = `
        <div class="card h-100">
          <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'default.jpg'}" 
               class="card-img-top" alt="${movie.title}">
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">Year: ${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
            <button class="btn btn-outline-primary" onclick="fetchMovieDetails(${movie.id})">Details</button>
          </div>
        </div>
      `;
      movieContainer.appendChild(movieCard);

      setTimeout(() => {
        movieCard.classList.add('loaded');
      }, index * 100); // Delay for staggered effect
    });
  }

  // Fetch detailed information for a single movie and include a trailer if available
  async function fetchMovieDetails(id) {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
      const movie = await response.json();

      // Fetch the videos for the movie to find the trailer
      const videoResponse = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`);
      const videoData = await videoResponse.json();

      // Find the YouTube trailer video
      const trailer = videoData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

      const modalBody = document.getElementById('modalBody');
      modalBody.innerHTML = `
        <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : 'default.jpg'}" 
             class="img-fluid mb-3" alt="${movie.title}">
        <h5>${movie.title}</h5>
        <p><strong>Genre:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
        <p><strong>Released:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ${movie.vote_average}</p>
        <p>${movie.overview}</p>
      `;

      if (trailer) {
        modalBody.innerHTML += `
          <h5>Trailer</h5>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" 
                  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        `;
      } else {
        modalBody.innerHTML += `<p><em>No trailer available</em></p>`;
      }

      const movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
      movieModal.show();
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  }

  window.fetchMovieDetails = fetchMovieDetails;

  document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    fetchMovies(query);
  });

  document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = document.getElementById('searchInput').value.trim();
      fetchMovies(query);
    }
  });

  genreFilter.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = document.getElementById('searchInput').value.trim();
      fetchMovies(query);
    }
  });

  fetchGenres();
});
