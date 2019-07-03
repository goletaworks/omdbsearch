document.addEventListener('DOMContentLoaded', function() {
    jQuery('#btn-clear-movies').on('click', function(){
        if(confirm('Are you sure you want to delete all collected movies? (Search data will not be affected.)')){
            Datastore.clearMovies();
            initialize();
        }
    });

    jQuery('#btn-restore-defaults').on('click', function(){
        if(confirm('Are you sure you want to restore preferences to their defaults? (The movie list will not be affected.)')){
            Datastore.restoreDefaultPreferences();
            initialize();
        }
    });

    jQuery('#movie-lists').on('click', '.btn-remove-movie', function(){
        let btn = jQuery(this);
        let movieTitle = btn.attr('data-title');
        if(confirm(`Are you sure you want to remove "${movieTitle}"? from this list?`)){
            let listTitle = btn.parents('table.movie-list').attr('data-title');
            let imdbId  = btn.attr('data-id');
            if(removeMovie({imdbId, listTitle})){
                btn.parents('tr.movie-row').remove();
            }
        }
    });

    chrome.tabs.getSelected(null, function(tab) {
        initialize();
    });
}, false);

// ------------------------------------------------------------------------------------------------
var initialize = function(){
    console.log('popup initialize');
    var movieListsEl = jQuery('#movie-lists');
    var prefsJson = jQuery('#prefs-json');
    var db = Datastore.get();
    var lists = db.lists;

    var ndx = 0;
    movieListsEl.empty();

    var movieListTitles = Object.keys(lists);
    movieListTitles.sort();
    var size = movieListTitles.length;
    for (var i=0; i<size; i++){
        var movieListTitle = movieListTitles[i];
        var movieListEl = createMovieListCard(movieListTitle, lists[movieListTitle].items, ndx++);
        movieListsEl.append(movieListEl);
    }
    console.log(`movieListsEl length: ${movieListsEl.length}`);

    prefsJson.text(JSON.stringify(db.preferences));
};

// ------------------------------------------------------------------------------------------------
var createMovieListCard = function(movieListTitle, movies, id){
    var moviesTable = '';
    movies.sort(function(a, b){
        return new Date(a.ts) > new Date(b.ts) ? -1 : 1;
    });

    movies.forEach(function(movie){
        moviesTable += addMovieRow(movie);
    });

    var card = `<div class="card"><div class="card-header" id="heading-${id}"><div>` +
            `<a href="#" data-toggle="collapse" data-target="#collapse-${id}" aria-expanded="true" aria-controls="collapse-${id}">` +
            `${movieListTitle}</a></div></div>` +
            `<div id="collapse-${id}" class="collapse" aria-labelledby="heading-${id}" data-parent="#collapseMovieLists">` +
            `<div class="card-body">` +
            `<table class="movie-list" data-title="${movieListTitle}"><thead>` +
            `<tr><th></th><th style="width: 200px">Title/year</th><th>Runtime</th><th>Genre</th><th>IMDB</th><th>Metacritic</th><th>Rotten Tomatoes</th><th>Plot</th></tr>` +
            `</thead>` +
            `<tbody>${moviesTable}</tbody></table></div>` +
            `</div></div>`;
    return card;
};

// ------------------------------------------------------------------------------------------------
let addMovieRow = function(movie){
        let imdbUrl = 'https://www.imdb.com/title/' + movie.imdbID;
        let ratings = getRatingsValues(movie);
        return '<tr class="movie-row">' +
                `<td><button class="btn-remove-movie" data-id="${movie.imdbID}" data-title="${movie.Title}">X</button></td>` +
                `<td><a href="${imdbUrl}" target="imdb">${movie.Title} (${movie.Year})</a></td>` +
                `<td>${movie.Runtime}</td>` +
                `<td>${movie.Genre}</td>` +
                `${ratings}` +
                `<td><div class="cell-content-h-max">${movie.Plot}</div></td></tr>`;
};

// ------------------------------------------------------------------------------------------------
let getRatingsValues = function(movie){
    let ratings = '';
    let sources = ['Internet Movie Database', 'Metacritic', 'Rotten Tomatoes'];
    for( ndx in sources){
        let found = movie.Ratings.find(function(rating){
            return rating.Source == sources[ndx];
        });
        ratings += '<td>' + (found ? found.Value : 'N/A') + '</td>';
    }
    return ratings;
};

// ------------------------------------------------------------------------------------------------
let removeMovie = function(opts){
    let imdbId = opts.imdbId;
    let listTitle = opts.listTitle;
    let db = Datastore.get();

    if(!(listTitle in db.lists)){
        alert(`You don't have a movie list named "${listTitle}"`);
        return false;
    }
    let list = db.lists[listTitle];
    let foundNdx = list.items.find((movie)=>{
        return movie.imdbId = imdbId;
    });

    if(foundNdx === -1){
        alert(`This movie list doesn't have a movie that matches IMDB ID "${imdbId}"`);
        return false;
    }

    db.lists[listTitle].items.splice(foundNdx, 1);
    Datastore.set(db);
    return true;
};

initialize();
