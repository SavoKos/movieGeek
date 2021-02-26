const renderFullMovieInfo = async function (movieID) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieID}?api_key=7325ea7f7ce78a5adf1d879ccbbe0117&language=en-US`
  );
  const data = await res.json();
  console.log(data.title);
};

document.querySelector('.logo').addEventListener('click', function () {
  window.open('../../index.html', '_self');
});
renderFullMovieInfo(window.location.hash.slice(1));
