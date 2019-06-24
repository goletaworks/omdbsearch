// OMDB API url: http://www.omdbapi.com/?i=tt3896198&apikey=9969b1c7
// REQ1: link to IMDB for aditionnal info (e.g.: https://www.imdb.com/title/tt2290065/parentalguide?ref_=tt_stry_pg#advisory-nudity)

let omdbBaseUrl = 'http://www.omdbapi.com';
let imdbBaseUrl = 'https://www.imdb.com';
let defaultList = 'Highest Rated Horror';

// ------------------------------------------------------------------------------------------------
let onGetMovieDetails = async function(info, tab){
    let selText = info.selectionText;
    if(typeof selText == 'undefined'){
        return;
    }
    let result = await doMovieTitleSearch(selText);
    let resultWin = window.open('', 'omdb_movie_' + result.imdbID);
    let html = generateDetailPage(result);
    resultWin.document.write(html);
};

// ------------------------------------------------------------------------------------------------
let onAddToList = async function(info, tab){
    let selText = info.selectionText;
    if(typeof selText == 'undefined'){
        return;
    }
    let result = await doMovieTitleSearch(selText);
    // TODO: allow selecting a specific list (for now, using the default "Highest Rated Horror")
    let listName = defaultList;
    addMovieToList(result, listName);
};

// ------------------------------------------------------------------------------------------------
let addMovieToList = function(movie, listName){
    let db = Datastore.get();
    let list = db.lists[listName];
    if(!list){
        alert(`You don't have a movie list named ${listName}`);
        return;
    }

    let found = list.items.findIndex((item) => {
        return item.imdbID === movie.imdbID;
    });

    if(found === -1){
        list.items.push(movie);
        Datastore.set(db);
    }
};

// ------------------------------------------------------------------------------------------------
let doMovieTitleSearch = async function(text){
    let url = omdbBaseUrl + `/?apikey=${omdbApiKey}&t=${text}`;
    let result = await doPostRequest(url);
    //alert(JSON.stringify(result));
    return result;
};

// ------------------------------------------------------------------------------------------------
let doPostRequest = async function(url){
    let opts = { method: 'POST', 'Content-type':'application/json' };
    return fetch(url, opts)
    .then(resp => {
        return resp.json();
    })
    .catch(err => {
        console.error(err);
        return false;
    });
};

// ------------------------------------------------------------------------------------------------
let generateComparisonPage = function(result){
    let reviews = '', colHeadings = '';
    result.Ratings.forEach( rating => {
        colHeadings += `<th>${rating.Source}</th>`;
        reviews += `<td>${rating.Value}</td>`;
    });

    let imdbUrl = `${imdbBaseUrl}/title/${result.imdbID}`;

    let html =
            '<html><head><title>Movie Search Results</title><style>' +
            'body, p { font-family: sans-serif; font-size: 16px; padding: 10px; } table { text-align: left; } td { padding : 5px; }' +
            '</style></head><body><div class="movie-comparison">' +
            '<table>' +
            `<tr><th style="width: 100px">Title/year</th><th>Runtime</th><th>Genre</th>${colHeadings}<th>Plot</th></tr>` +
            '<tr>' +
            `<td><a href="${imdbUrl}" target="imdb">${result.Title} (${result.Year})</a></td>` +
            `<td>${result.Runtime}</td>` +
            `<td>${result.Genre}</td>` +
            `${reviews}` +
            `<td>${result.Plot}</td></tr></table>` +
            '</body></html>';
    return html;
};

// ------------------------------------------------------------------------------------------------
let generateDetailPage = function(result){
    let reviews = '';
    result.Ratings.forEach( rating => {
        reviews += `<th>${rating.Source}</th><td>${rating.Value}</td></tr>`;
    });
    reviews = `<table>${reviews}</table>`;

    let nakedUrl = `${imdbBaseUrl}/title/${result.imdbID}/parentalguide?ref_=tt_stry_pg#advisory-nudity`;

    let html =
            `<html><head><title>${result.Title} - Movie Search</title><style>` +
            'body, p { font-family: sans-serif; font-size: 16px; padding: 10px; } table { text-align: left; } td { padding : 5px; }' +
            '</style></head><body><div class="movie-details">' +
            `<h1>${result.Title} (${result.Year})</h1>` +
            '<table>' +
            `<tr><th>Rated</th><td>${result.Rated}</td></tr>` +
            `<tr><th>Runtime</th><td>${result.Runtime}</td></tr>` +
            `<tr><th>Genre</th><td>${result.Genre}</td></tr>` +
            `<tr><th>Director</th><td>${result.Director}</td></tr>` +
            `<tr><th>Writer</th><td>${result.Writer}</td></tr>` +
            `<tr><th>Actors</th><td>${result.Actors}</td></tr>` +
            '</table>' +
            `<h2>Ratings</h2><div id="reviews">${reviews}</div>` +
            `<h2>Plot</h2><p>${result.Plot}</p></div>` +
            '<h2>Sex & Nudity</h2>' +
            `<p>Go to IMDB's <a href="${nakedUrl}" target="naked_info">Sex & Nudity details</a></p>` +
            '</body></html>';
    return html;
};

// ------------------------------------------------------------------------------------------------
let initialize = function(){

    chrome.contextMenus.create({
            id : 'get_movie_details',
            title : 'Get Movie Details',
            contexts : ['all'],
            onclick : MovieSearch.onGetMovieDetails
        }, function onCreated(){
            console.log('created onGetMovieDetails context menu item');
        }
    );

    // TODO: not implemented yet
    chrome.contextMenus.create({
            id : 'add_to_list',
            title : 'Add To List',
            contexts : ['all'],
            onclick : MovieSearch.onAddToList
        }, function onCreated(){
            console.log('created onAddToList context menu item');
        }
    );
};

// ------------------------------------------------------------------------------------------------
let MovieSearch = {
    onGetMovieDetails,
    onAddToList
};

initialize();
