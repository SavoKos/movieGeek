const movieContainer = document.querySelector('.container__display-movies');
const nextPage = document.querySelector('.nextpage');
const prevPage = document.querySelector('.prevpage');
const currentPageContainer = document.querySelector('.page');
const search = document.querySelector('.inputSearch');
let movieHashTitle = window.location.hash;

let currentTab = `movie/popular`;
if (movieHashTitle.length > 0) currentTab = movieHashTitle;
const goToNextPage = function () {
  let searched = false;
  let page = +currentPageContainer.textContent;
  if (window.location.href.includes('#')) searched = true;
  console.log(movieContainer.firstElementChild);
  if (
    movieContainer.firstElementChild === null ||
    movieContainer.firstElementChild.className === 'search-failed'
  ) {
    page = 0;
  }

  fetchMovies(page + 1);
  currentPageContainer.textContent = `${page + 1}`;
  //     const currentPage = +currentPageContainer.textContent.slice(0, 1);
  //   fetchMovies(3);
  //   currentPageContainer.textContent = currentPage + 1;
  //   return;
};

const goToPrevPage = function () {
  let page = +currentPageContainer.textContent.slice(0, 1);
  if (page < 2) return;
  fetchMovies(page - 1);
  currentPageContainer.textContent = `${page - 1}`;
};

const displayHomePage = function () {
  window.location.href = '';
  fetchMovies();
};

const dropdownSelection = async function (url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const movies = data.results;
    movieContainer.innerHTML = '';
    movies.forEach(mov => {
      if (currentTab.includes('tv')) mov.media_type = 'tv';
      renderMovie(mov);
    });
  } catch (error) {
    console.log(error);
  }
};

const fetchMovieGenre = async function (movie) {
  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/genre/movie/list?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US'
    );
    const data = await res.json();
    const genre = data.genres;
    let genreReturn = '';
    genre.forEach(genr => {
      if (genr.id === movie.genre_ids[0]) genreReturn = genr.name;
    });
    return genreReturn;
  } catch (error) {
    console.log(error);
  }
};

const renderMovie = async function (movie, def = 'Genre') {
  try {
    if (!movie.poster_path) return;
    let title = '';
    let releaseDate = '';

    if (movie.media_type === 'tv') {
      title = movie.name;
      releaseDate = movie.first_air_date.slice(0, 4);
    } else {
      title = movie.title;
      if (!movie.release_date) return;
      releaseDate = movie.release_date.slice(0, 4);
    }

    const genre = await fetchMovieGenre(movie);
    //   const releaseDate = movie.release_date.slice(0, 4);
    const html = `
      <div class="col-md-3">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="" />
      <div class="movie-details">
        <h2 class="movie-title">${title}<span>(${releaseDate})</span></h2>
      </div>
      <div class="movie-review">
        <h4 class="genre">${genre || def}</h4>
        <div class="review">
          <img src="/src/img/star.svg" alt="" class="star" />
          <h6>${movie.vote_average}</h6>
        </div>
      </div>
    </div>
      `;
    movieContainer.insertAdjacentHTML('beforeend', html);
  } catch (error) {
    console.log(error);
  }
};

const fetchMovies = async function (page = 1) {
  try {
    let res = '';
    if (currentTab.includes('#'))
      res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}&query=${
          currentTab.slice(1) || search.value
        }`
      );
    else
      res = await fetch(
        `https://api.themoviedb.org/3/${currentTab}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}`
      );
    const data = await res.json();
    const movies = data.results;
    console.log(movies);
    movieContainer.innerHTML = '';

    movies.forEach(mov => {
      if (currentTab.includes('tv')) mov.media_type = 'tv';
      renderMovie(mov);
    });
  } catch (error) {
    console.log(error);
  }
};

fetchMovies();

const searchMovie = async function (e, mov = undefined, page = 1) {
  try {
    if (e) e.preventDefault();
    if (!search.value) {
      displayHomePage();
      return;
    }
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}&query=${
        mov || search.value
      }`
    );

    const data = await res.json();
    const movies = data.results;
    movieContainer.innerHTML = '';
    currentPageContainer.textContent = `${page}`;
    if (movies.length < 1) {
      movieContainer.innerHTML = `<h1 class="search-failed">No results found. Try again!<h1>`;
      return;
    }
    movies.forEach(mov => renderMovie(mov));
    window.location.hash = search.value;
    currentTab = `#${search.value}`;
    search.value = '';
  } catch (error) {
    console.log(error);
  }
};

document.querySelector('form').addEventListener('submit', searchMovie);
nextPage.addEventListener('click', goToNextPage);
prevPage.addEventListener('click', goToPrevPage);
document.querySelector('.logo').addEventListener('click', displayHomePage);

const dropdowns = [
  document.querySelector('.movies-toprated'),
  document.querySelector('.movies-popular'),
  document.querySelector('.movies-upcoming'),
  document.querySelector('.movies-theatres'),
];

document.querySelectorAll('.media-dropdown').forEach(dropdown => {
  dropdown.addEventListener('click', function () {
    const media = this.dataset.media;
    const type = this.dataset.type;
    currentTab = `${media}/${type}`;
    console.log(currentTab);
    dropdownSelection(
      `https://api.themoviedb.org/3/${media}/${type}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US&page=1`
    );
  });
});
