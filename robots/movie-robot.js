const request = require('request')
const state = require('../robots/state.js')
const settings = require('../settings/general-settings.json')
const theMovieDatabaseApiKey = require('../credentials/the-movie-database.json').apiKey
const moviesLanguage = require('../settings/general-settings.json').moviesLanguage

async function fetchMovieInTMDB(movieId) {
    const options = { 
        method: 'GET',
        url: 'https://api.themoviedb.org/3/movie/' + movieId,
        qs: { language: moviesLanguage, api_key: theMovieDatabaseApiKey },
        body: '{}' 
    }
  
    const resultado = await new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            if (error)
                reject(error)

            resolve(body)
        });
    })

    const TMDBMovie = JSON.parse(resultado);
    const TMDBMovieImages = await fetchMovieImagesInTMDB(movieId);
    const movieContent = mountMovieContent(TMDBMovie, TMDBMovieImages);
    
    return movieContent




    function mountMovieContent(TMDBMovie, TMDBMovieImages){
        const movieContent = {
            id: TMDBMovie.id,
            title: TMDBMovie.title,
            overview: TMDBMovie.overview,
            popularity: TMDBMovie.popularity,
            releaseDate: TMDBMovie.release_date,
            runtime: TMDBMovie.runtime,
            tagline: TMDBMovie.tagline,
            originalLanguage: TMDBMovie.original_language,
            originalTitle: TMDBMovie.original_title,
            genres: TMDBMovie.genres, 
            posterPath: TMDBMovie.poster_path,
            images: TMDBMovieImages,
            voteAverage: TMDBMovie.vote_average,
            voteCount: TMDBMovie.vote_count
        }

        return movieContent
    }

    async function fetchMovieImagesInTMDB(movieId) {
        const options = { 
            method: 'GET',
            url: 'https://api.themoviedb.org/3/movie/' + movieId + '/images',
            qs: { api_key: theMovieDatabaseApiKey },
            body: '{}' 
        };

        const images = []
        const resultado = await new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (error)
                    reject(error);

                resolve(body)
            });
        })

        const backdrops = JSON.parse(resultado).backdrops
        backdrops.forEach((backdrop) => {
            images.push(backdrop.file_path)
        })

        return images
    }
}

function saveMovieData(movieContent) {
    state.save(movieContent, settings.moviesPath + movieContent.id + '/' + settings.movieContentFileName)
}

module.exports = {
    fetchMovieInTMDB,
    saveMovieData
}