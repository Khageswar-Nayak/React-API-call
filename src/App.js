import React, { useState, useEffect, useCallback } from "react";

import MoviesList from "./components/MoviesList";
import "./App.css";
import AddMovie from "./components/AddMovie";

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

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://react-http-b76b2-default-rtdb.firebaseio.com/movies.json"
      );
      if (!response.ok) {
        throw new Error("Something went wrong ...Retrying");
      }
      const data = await response.json();
      const loadedMovies = [];
      for (const key in data) {
        loadedMovies.push({
          id: key,
          title: data[key].title,
          openingText: data[key].openingText,
          releaseDate: data[key].releaseDate,
        });
      }

      setMovies(loadedMovies);
    } catch (error) {
      console.log(error);
      setError(error.message);
      // Start retrying after 2 seconds
      const timeout = setTimeout(fetchMoviesHandler, 2000);
      setRetryTimeout(timeout);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  async function addMovieHandler(movie) {
    const response = await fetch(
      "https://react-http-b76b2-default-rtdb.firebaseio.com/movies.json",
      {
        method: "POST",
        body: JSON.stringify(movie),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);
  }

  function handleCancelRetry() {
    // Clear the retry timeout and reset error state
    clearTimeout(retryTimeout);
    setError(null);
  }

  const deleteMovieHandler = async (movieId) => {
    try {
      await fetch(
        `https://react-http-b76b2-default-rtdb.firebaseio.com/movies/${movieId}.json`,
        {
          method: "DELETE",
        }
      );
      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.id !== movieId)
      );
    } catch (error) {
      console.log(error);
    }
  };

  let content = <p>Found No Movies.</p>;
  if (movies.length > 0) {
    content = (
      <MoviesList movies={movies} deleteMovieHandler={deleteMovieHandler} />
    );
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
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
