const contentContainer = document.querySelector('.content');
const APIKey = `7325ea7f7ce78a5adf1d879ccbbe0117`;
let recommendedContainer;
let urlMedia = window.location.hash.slice(
  window.location.hash.indexOf('/') + 1
);
let trailerKey;
let urlID = window.location.hash.slice(1, window.location.hash.indexOf('/'));
const renderFullMovieInfo = async function (movieID) {
  contentContainer.innerHTML = '';
  urlMedia = window.location.hash.slice(window.location.hash.indexOf('/') + 1);
  const res = await fetch(
    `https://api.themoviedb.org/3/${urlMedia}/${movieID}?api_key=${APIKey}&language=en-US`
  );
  const data = await res.json();
  insertMovieContent(data);
  // fetchRecommendedMovies();
};

const insertMovieContent = async function (movie) {
  console.log(movie);
  let IMDbID = undefined;
  if (urlMedia === 'tv') IMDbID = await fetchIMDbID();
  const hoursRuntime = Math.floor(movie.runtime / 60) || 0;
  const minutesRuntime =
    movie.runtime - 60 * hoursRuntime || movie.episode_run_time[0];
  const recommended = await fetchRecommendedMovies(movie.id, urlMedia);
  const tagline = movie.tagline === '' ? '' : `"${movie.tagline}"`;
  const IMDbLink = movie.imdb_id ? `` : '';
  const cast = await fetchCast();
  const releaseDate = movie.release_date
    ? movie.release_date.slice(0, 4)
    : movie.first_air_date.slice(0, 4);
  trailerSrc = await fetchTrailer(movie, urlMedia);
  const html = `
  <div class="container movie-info">
        <div class="poster">
        <img src=${
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : `/src/img/defaultposter.png`
        } alt="" />
          <a class="trailer"
            >Watch Trailer</a
          >
        </div>
        <div class="details">
          <h1 class="title">${
            movie.title || movie.original_name
          }<span>(${releaseDate})</span></h1>
          <div class="genre">
          ${displayGenres(movie)}
            <a class="time">${hoursRuntime}h ${minutesRuntime}min</a>
          </div>
          <p class="overview">${movie.overview}</p>
          <h3 class="tagline">${tagline}</h3>
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
            <div class="tmdb">
              <img src="/src/img/tmdb.jpg" alt="" class="tmdb-logo" />
              <p class="vote">${movie.vote_average}/10 <span class="spanVote">${
    movie.vote_count
  } votes</span></p>
            </div>
          </div>
          <div class="redirect">
            <a href="${
              movie.homepage || `/index.html`
            }" class="homepage">Homepage</a>
            ${IMDbLink}
            <a href=https://www.imdb.com/title/${
              movie.imdb_id || IMDbID
            } class="imdb">IMDb</a>
          </div>
        </div>
      </div>
        <div class="container cast">
        <h1>Cast</h1>
        <section class="slider owl-carousel">
          ${cast}
        </section>
      </div>  
        </section>
        <div class="container recommended">
          <h1>Recommended</h1>
          <div class="row">
          ${recommended}
          </div>
        </div>
      </div>
      <div class="modal-window hidden">
      <div class="content-modal">
        <img src="/src/img/close.svg" alt="" class="close-modal" />
        <iframe
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
  document.title = `${movie.title || movie.name} (${releaseDate}) - movieGeek`;
  contentContainer.insertAdjacentHTML('afterbegin', html);
  imdbPlugin(document, 'script', 'imdb-rating-api');
  sliderFunctionality();

  document
    .querySelector('.recommended')
    .addEventListener('click', renderRecommendedMovie);
  document
    .querySelector('.trailer')
    .addEventListener('click', modalWindowHandler);
  document.querySelector('.tmdb-logo').addEventListener('click', tmdbRedirect);
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.querySelector('.modal-window').addEventListener('click', closeModal);
};

const renderRecommendedMovie = function (e) {
  if (e.target === this) return;
  const recommID = +e.target.closest('.col-md-2').dataset.id;
  const recommMedia = e.target.closest('.col-md-2').dataset.media;
  window.location.hash = `${recommID}/${recommMedia}`;
  renderFullMovieInfo(recommID, recommMedia);
};

const sliderFunctionality = function () {
  $('.slider').owlCarousel({
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    dotsEach: true,
    responsive: {
      1100: { items: 4, nav: false },
      800: { items: 3, nav: false },
      550: { items: 2, nav: false },
      300: { items: 1, nav: false },
    },
  });
};

const displayGenres = function (movie) {
  const genre = movie.genres.map(gen => `<a>${gen.name}</a>`);
  return genre.join('');
};

const fetchTrailer = async function (movie, media) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${media}/${movie.id}/videos?api_key=${APIKey}&language=en-US`
    );
    const data = await res.json();
    if (!data.results[0]) throw new Error('No trailers found!');
    let youtubeTrailer = data.results.find(res =>
      Object.values(res).includes('Trailer')
    );
    if (!youtubeTrailer) youtubeTrailer = data.results[0].key;

    return `https://www.youtube.com/embed/${youtubeTrailer.key}`;
  } catch (error) {
    console.log(error);
  }
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

const fetchCast = async function () {
  const castArray = [];
  const res = await fetch(
    `https://api.themoviedb.org/3/${urlMedia}/${urlID}/credits?api_key=${APIKey}&language=en-US`
  );

  const data = await res.json();
  const cast = data.cast;
  console.log(cast);
  cast.forEach(act => {
    if (!act.profile_path) return;
    castArray.push(`
  <div class="card">
    <div class="img">
      <img src="https://image.tmdb.org/t/p/w300${act.profile_path}" alt="" />
  </div>
  <div class="content">
   <p>
   <span>${act.name}</span>
   <br />
   ${act.character}
   </p>
  </div>
 </div>
  `);
  });
  return castArray.join('');
};

const tmdbRedirect = function () {
  window.open(`https://www.themoviedb.org/movie/${urlID}`, '_blank');
};

const fetchRecommendedMovies = async function (movieID, media) {
  const res = await fetch(
    `https://api.themoviedb.org/3/${media}/${movieID}/recommendations?api_key=${APIKey}&language=en-US&page=1`
  );
  const data = await res.json();
  const allRecommendations = data.results;
  const recommendations = allRecommendations.filter(
    recc => allRecommendations.indexOf(recc) < 6
  );
  const displayRecommended = recommendations.map(recc => {
    return `<div class="col-md-2 box-container" data-id="${
      recc.id
    }" data-media=${recc.media_type || media}>
    <img src=${
      recc.poster_path
        ? `https://image.tmdb.org/t/p/w500${recc.poster_path}`
        : `/src/img/defaultposter.png`
    } alt="" />
      <h2>${recc.title || recc.name}</h2>
    </div>`;
  });
  return displayRecommended.join('');
};

const modalWindowHandler = function () {
  const modalContainer = document.querySelector('.modal-window');
  const iframe = document.querySelector('iframe');

  window.scroll(0, 0);
  document.body.style.overflow = 'hidden';
  modalContainer.style.display = 'block';
  modalContainer.classList.remove('hidden');
  if (!trailerSrc) {
    const noTrailer = document.createElement('h1');
    noTrailer.textContent = 'No trailers found!';
    document.querySelector('.content-modal').appendChild(noTrailer);
    return;
  }
  iframe.src = trailerSrc;
};

const closeModal = function (e) {
  if (
    !(
      e.target.classList.contains('modal-window') ||
      e.target.classList.contains('close-modal')
    )
  )
    return;
  const modalContainer = document.querySelector('.modal-window');
  const iframe = document.querySelector('iframe');

  document.body.style.overflow = 'auto';
  iframe.src = '';
  modalContainer.classList.add('hidden');
  setTimeout(() => {
    modalContainer.style.display = 'none';
  }, 700);
};

const imdbPlugin = function (d, s, id) {
  let js,
    stags = d.getElementsByTagName(s)[0];

  js = d.createElement(s);
  js.id = id;
  js.src =
    'https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/js/rating.js';
  stags.parentNode.insertBefore(js, stags);
};

document.querySelector('.logo').addEventListener('click', function () {
  window.open('../../index.html', '_self');
});

document.addEventListener('loadedmetadata', renderFullMovieInfo(urlID));
document.querySelector('.back').addEventListener('click', function () {
  window.open('/index.html', '_self');
});
