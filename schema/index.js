import { gql } from "apollo-server-express"
import moviesResponse from "../data/movies";

const movies = getTransformedMovies(moviesResponse.results);

const typeDefs = gql`
  type Movie {
    id: Int,
    title: String,
    rating: Float,
    plotSummary: String,
    thumbnailUri: String,
    posterImageUrl: String,
    originalLanguage: String
    
  }
  type Query {
    movies: [Movie],
    movie(id: Int!): Movie
  }
`;

const resolvers = {
	Query: {
		movies: () => movies,
		movie: (root, { id }) => movies.find(movie => movie.id === id)
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
