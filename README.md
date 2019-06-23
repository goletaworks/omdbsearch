# omdb_movie_search

This Chrome plugin adds a context menu item that allows you to search for movies
on OMDB (http://www.omdbapi.com/). Nothing fancy.

To use it, you first need to add a file in the root folder named apikey.js and
add this line:

let omdbApiKey = '<your_api_key>';

Change <your_api_key> to an api key you get from
http://www.omdbapi.com/apikey.aspx

(TODO: add the api setting to the config screen and package this plugin
properly. Currently, browser's dev mode must be enabled and installed unpacked.)

Then, on any web page, select the text of a movie title, right-click, and choose
OMDB Movie Search -> Get Movie Details. A new web page is displayed showing the
movie details, including ratings from IMDB, Rotten Tomatoes, and Metacritic.

TODO: allow creating movie lists, automatically sorted based on user-specified
criteria.
