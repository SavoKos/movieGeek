const movieContainer = document.querySelector('.container__display-movies');
const nextPage = document.querySelector('.nextpage');
const prevPage = document.querySelector('.prevpage');
const currentPageContainer = document.querySelector('.page');
const search = document.querySelector('.inputSearch');
const searched = document.querySelector('.searchedLabel');
const genreLabel = document.querySelector('.filterGenre');
const filterContainer = document.querySelector('.filter-container');
const filterDropdown = document.querySelector('.filter-dropdown');
let movieHashTitle = window.location.hash;
let genre = undefined;

let currentTab = `movie/popular`;

if (movieHashTitle.length > 0) currentTab = movieHashTitle;
const goToNextPage = function () {
  let page = +currentPageContainer.textContent;
  if (
    movieContainer.firstElementChild === null ||
    movieContainer.firstElementChild.className === 'search-failed'
  ) {
    page = 0;
  }

  fetchMovies(page + 1, genre);
  currentPageContainer.textContent = `${page + 1}`;
  //     const currentPage = +currentPageContainer.textContent.slice(0, 1);
  //   fetchMovies(3);
  //   currentPageContainer.textContent = currentPage + 1;
  //   return;
};

const goToPrevPage = function () {
  let page = +currentPageContainer.textContent.slice(0, 1);
  if (page < 2) return;
  fetchMovies(page - 1, genre);
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
    const searchedString = currentTab.split('_').join(' ').replace('/', ' - ');
    searched.textContent = `🔎 ${searchedString}`;
    searched.dataset.type = `${currentTab}`;
    movies.forEach(mov => {
      if (currentTab.includes('tv')) {
        mov.media_type = 'tv';
        genreLabel.style.display = 'none';
      }
      renderMovie(mov);
    });
  } catch (error) {
    console.log(error);
  }
};

const genreFilter = async function (genre) {
  try {
    const data = await res.json();
    const movies = data.results;
    movieContainer.innerHTML = '';
    const genreFetch = await fetchMovieGenre(movie);
    if (genreFetch === genre) movies.forEach(mov => renderMovie(mov));
  } catch (error) {
    alert(error);
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
      if (!movie.genre_ids) return;
      if (genr.id === movie.genre_ids[0]) genreReturn = genr.name;
    });
    return genreReturn;
  } catch (error) {
    console.log(error);
  }
};

const renderMovie = async function (movie, def = 'Genre') {
  try {
    // abort render if movie doesn't have image
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
      <div class="col-md-3" data-id=${movie.id}>
      <img src=${
        movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : `/src/img/defaultposter.png`
      } alt="" />
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

// fetching movies on load, on filter, dropdown menu
const fetchMovies = async function (page = 1, genre = 'undefined') {
  try {
    let res = '';
    // checking if movie is already searched
    if (currentTab.includes('#')) {
      searched.textContent = `🔎 ${window.location.hash.slice(1)}`;
      searched.dataset.type = `${window.location.hash}`;
      res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}&query=${
          currentTab.slice(1) || search.value
        }`
      );
      genreLabel.style.display = 'none';
    } else {
      res = await fetch(
        `https://api.themoviedb.org/3/${currentTab}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}`
      );

      const searchedString = currentTab
        .split('_')
        .join(' ')
        .replace('/', ' - ');
      searched.textContent = `🔎 ${searchedString}`;
      searched.dataset.type = `${currentTab}`;
    }
    const data = await res.json();
    const movies = data.results;

    movieContainer.innerHTML = '';

    // genre filtering
    if (genre !== 'undefined') {
      filterDropdown.classList.add('hidden');
      let dataFilter;
      let moviesArray = [];
      const target = currentPageContainer.textContent * 15;
      for (let i = target - 14; i < target; i++) {
        const resFilter = await fetch(
          `https://api.themoviedb.org/3/${currentTab}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${i}`
        );
        dataFilter = await resFilter.json();
        moviesArray.push(dataFilter.results);
      }
      const moviesFlatArray = moviesArray.flat();
      moviesFlatArray.forEach(async function (mov) {
        const g = await fetchMovieGenre(mov);
        if (g === genre) renderMovie(mov);
      });
    } else {
      movies.forEach(mov => {
        // setting media_type because tv doesn't have it by default
        if (currentTab.includes('tv')) mov.media_type = 'tv';
        renderMovie(mov);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

fetchMovies();

// used just for searching movies
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
    console.log(movies);
    movieContainer.innerHTML = '';
    currentPageContainer.textContent = `${page}`;
    if (movies.length < 1) {
      movieContainer.innerHTML = `<h1 class="search-failed">No results found. Try again!<h1>`;
      return;
    }
    genreLabel.style.display = 'none';
    movies.forEach(mov => renderMovie(mov));
    window.location.hash = search.value;
    currentTab = `#${search.value}`;
    searched.textContent = `🔎 ${window.location.hash.slice(1)}`;
    searched.dataset.type = `${window.location.hash}`;
    search.value = '';
  } catch (error) {
    console.log(error);
  }
};

const renderFullMovieInfo = async function (movieID) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieID}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US`
  );
  const data = await res.json();
  window.open(`../../movieInfo.html#${movieID}`);
};

document.querySelector('form').addEventListener('submit', searchMovie);
nextPage.addEventListener('click', goToNextPage);
prevPage.addEventListener('click', goToPrevPage);
document.querySelector('.logo').addEventListener('click', displayHomePage);

document.querySelectorAll('.media-dropdown').forEach(dropdown => {
  dropdown.addEventListener('click', function () {
    window.location.hash = '';
    const media = this.dataset.media;
    const type = this.dataset.type;
    currentTab = `${media}/${type}`;
    console.log(currentTab);
    genreLabel.style.display = 'flex';
    dropdownSelection(
      `https://api.themoviedb.org/3/${media}/${type}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US&page=1`
    );
  });
});
filterDropdown.addEventListener('click', function (e) {
  if (!e.target.dataset.genre) return;
  if (window.location.hash[2]) {
    return;
  }

  fetchMovies(1, e.target.dataset.genre);
  genre = e.target.dataset.genre;
  filterDropdown.classList.toggle('hidden');
  currentPageContainer.textContent = 1;
});

genreLabel.addEventListener('click', function () {
  filterDropdown.classList.toggle('hidden');
});

movieContainer.addEventListener('click', function (e) {
  if (e.target === this) return;
  const movieID = +e.target.closest('.col-md-3').dataset.id;
  renderFullMovieInfo(movieID);
});
//
