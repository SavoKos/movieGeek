const movieContainer = document.querySelector('.container__display-movies');
const nextPage = document.querySelector('.nextpage');
const prevPage = document.querySelector('.prevpage');
const footer = document.querySelector('.footer');
const search = document.querySelector('.inputSearch');
const searched = document.querySelector('.searchedLabel');
const filterContainer = document.querySelector('.filter-container');
const filterDropdown = document.querySelector('.filter-dropdown');
let page = 0;
let lastElementMovie;
let genre = undefined;
let urlMedia = '';
let currentTab = `movie/popular`;
let movieHashTitle = window.location.hash;
if (movieHashTitle.length > 0) currentTab = movieHashTitle;

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
    searched.textContent = `🔎 ${currentTab}`;
    searched.dataset.type = `${currentTab}`;
    movies.forEach(mov => {
      if (currentTab.includes('tv')) {
        mov.media_type = 'tv';
      }
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
    let IMDbID = undefined;
    if (urlMedia === 'tv') IMDbID = await fetchIMDbID();
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
      <div class="col-md-3" data-id=${movie.id} data-media=${
      movie.media_type
        ? movie.media_type
        : currentTab.slice(0, currentTab.indexOf('/'))
    }>
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
        <span
        class="imdbRatingPlugin"
        data-user="ur129890334"
        data-title="${movie.imdb_id || IMDbID}"
        data-style="p3"
        ><a href="https://www.imdb.com/title/${
          movie.imdb_id || IMDbID
        }/?ref_=plg_rt_1"
          ><img
            src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_37x18.png"
            alt=""
          /> </a
      ></span>
        </div>
      </div>
    </div>
      `;
    movieContainer.insertAdjacentHTML('beforeend', html);
  } catch (error) {
    console.log(error);
  }
};

// fetching movies on load, dropdown menu
const fetchMovies = async function (genre = 'undefined') {
  try {
    page++;
    let res = '';
    urlMedia = currentTab.slice(0, currentTab.indexOf('/'));
    console.log(urlMedia);
    // checking if movie is already searched
    if (!searched) return;
    if (currentTab.includes('#')) {
      searched.textContent = `🔎 ${window.location.hash.slice(1)}`;
      searched.dataset.type = `${window.location.hash}`;
      res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}&query=${
          currentTab.slice(1) || search.value
        }`
      );
    } else {
      res = await fetch(
        `https://api.themoviedb.org/3/${currentTab}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&page=${page}`
      );

      searched.textContent = `${currentTab}`;
      searched.dataset.type = `${currentTab}`;
    }
    const data = await res.json();
    const movies = data.results;
    console.log(movies);
    // movieContainer.innerHTML = '';
    movies.forEach(mov => {
      // setting media_type because tv doesn't have it by default
      if (currentTab.includes('tv')) mov.media_type = 'tv';
      renderMovie(mov);
    });
    fetchNewMovieOnScroll();
  } catch (error) {
    console.log(error);
  }
};

fetchMovies(page);

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
    footer.textContent = `${page}`;
    searched.textContent = `🔎 ${window.location.hash.slice(1)}`;
    searched.dataset.type = `${window.location.hash}`;
    window.location.hash = search.value;
    currentTab = `#${search.value}`;
    if (movies.length < 1) {
      movieContainer.innerHTML = `<h1 class="search-failed">No results found. Try again!<h1>`;
      return;
    }
    movies.forEach(mov => renderMovie(mov));
    search.value = '';
  } catch (error) {
    console.log(error);
  }
};

const fetchNewMovieOnScroll = function () {
  const options = {
    root: null,
    rootMargin: '500px',
    threshold: 0.1,
  };

  const fetchIMDbID = async function () {
    urlID = window.location.hash.slice(1, window.location.hash.indexOf('/'));
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${urlID}/external_ids?api_key=${APIKey}&language=en-US`
    );
    const data = await res.json();
    console.log(data);
    return data.imdb_id;
  };

  const callback = function (entries, _) {
    entries.forEach(ent => {
      console.log(ent);
      if (ent.isIntersecting) {
        fetchMovies();
        observer.unobserve(footer);
      }
    });
  };
  setTimeout(() => {
    observer.observe(footer);
  }, 2000);
  const observer = new IntersectionObserver(callback, options);
};

const hamburgerMenuHandler = function () {
  const hamburgerDropdown = document
    .querySelector('.hamburger-dropdown')
    .classList.toggle('hidden');
};

const renderFullMovieInfo = async function (movieID, media) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieID}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US`
  );
  const data = await res.json();
  console.log(data);
  window.open(`../../movieInfo.html#${movieID}/${media}`, '_self');
};

document.querySelector('form').addEventListener('submit', searchMovie);
document.querySelector('.logo').addEventListener('click', displayHomePage);

document.querySelectorAll('.media-dropdown').forEach(dropdown => {
  dropdown.addEventListener('click', function () {
    window.location.hash = '';
    const media = this.dataset.media;
    const type = this.dataset.type;
    currentTab = `${media}/${type}`;
    dropdownSelection(
      `https://api.themoviedb.org/3/${media}/${type}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US&page=1`
    );
  });
});

document
  .querySelector('.hamburger-menu')
  .addEventListener('click', hamburgerMenuHandler);

if (movieContainer)
  movieContainer.addEventListener('click', function (e) {
    if (e.target === this) return;
    const movieID = +e.target.closest('.col-md-3').dataset.id;
    const movieMedia =
      e.target.closest('.col-md-3').dataset.media ||
      currentTab.slice(0, currentTab.indexOf('/'));
    renderFullMovieInfo(movieID, movieMedia);
  });
//
