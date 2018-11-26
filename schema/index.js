import { gql } from "apollo-server-express"
import fetch from "node-fetch"

const API_KEY = "ac9aa1940782d32e686d674790dc699d";
const typeDefs = gql`
  type Movie {
    id: Int,
    title: String,
    rating: Float,
    releaseDate: String,
    plotSummary: String,
    thumbnailUri: String,
    posterImageUrl: String,
    originalLanguage: String
    
  }
  type Query {
    movies(title: String): [Movie],
    movie(id: Int!): Movie
  }
`;
const resolvers = {
	Query: {
		movies: (root, { title }) => getMoviesByTitle(title),
		movie: (root, { id }) => this.movies.then(movies => movies.find(movie => movie.id === id))
	}
};

export default {
	typeDefs,
	resolvers
}

function getTransformedMovies(movies) {
	return movies.map(movie => {
		const camelCasedObject = Object.entries(movie).reduce((acc, [key, value]) => {
			return {
				...acc,
				[getCamelCased(key)]: value
			}
		}, {});
		const {
			posterPath,
			voteAverage,
			overview,
			...rest
		} = camelCasedObject;

		return {
			...rest,
			plotSummary: overview,
			rating: voteAverage,
			thumbnailUri: getThumbnailUri(posterPath),
			posterImageUrl: getPosterImageUril(posterPath)
		};
	})
}

function getCamelCased(str) {
	return str.replace(/_\w/g, match =>
		match
			.slice(1)
			.toUpperCase());
}

function getBaseImageURL() {
	return "https://image.tmdb.org/t/p";
}

function getThumbnailUri(posterPath) {
	return `${getBaseImageURL()}/w92/${posterPath}`;
}

function getPosterImageUril(posterPath) {
	return `${getBaseImageURL()}/w500/${posterPath}`;
}

function getMoviesByTitle(query) {
	const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
		query
	)}`;
	return fetch(url)
		.then(response => response.json())
		.then(jsonResponse => getTransformedMovies(jsonResponse.results))
}
