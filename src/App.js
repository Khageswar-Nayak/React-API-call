import React, { useState, useEffect } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryTimeout, setRetryTimeout] = useState(null);

  useEffect(() => {
    return () => {
      // Clear the retry timeout when the component unmounts
      clearTimeout(retryTimeout);
    };
  }, [retryTimeout]);

  async function fetchMoviesHandler() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://swapi.dev/api/film/");
      if (!response.ok) {
        throw new Error("Something went wrong ...Retrying");
      }
      const data = await response.json();
      const transFormedData = data.results.map((moviesData) => {
        return {
          id: moviesData.episode_id,
          title: moviesData.title,
          openingText: moviesData.opening_crawl,
          releaseDate: moviesData.release_date,
        };
      });
      setMovies(transFormedData);
    } catch (error) {
      console.log(error);
      setError(error.message);
      // Start retrying after 2 seconds
      const timeout = setTimeout(fetchMoviesHandler, 2000);
      setRetryTimeout(timeout);
    }
    setIsLoading(false);
  }

  function handleCancelRetry() {
    // Clear the retry timeout and reset error state
    clearTimeout(retryTimeout);
    setError(null);
  }

  let content = <p>Found No Movies.</p>;
  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }
  if (error) {
    content = (
      <React.Fragment>
        <p>{error}</p>
        <button onClick={handleCancelRetry}>Cancel Retry</button>
      </React.Fragment>
    );
  }
  if (isLoading) {
    content = <p>Loading...</p>;
  }
  return (
    <React.Fragment>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
