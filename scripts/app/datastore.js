/*
 * See defaults.js for storage schema
 */

var storageKey = 'com.goletaworks.movie.search';
var defaultData = Defaults;

var get = function(path){
    var json = localStorage.getItem(storageKey);
    if(!json){
        // initialize with default structure
        json = JSON.stringify(defaultData);
    }
    var data = JSON.parse(json);
    if(path){
        var parts = path.split('.');
        var i=0;
        while(i <= parts.length && data.hasOwnProperty(parts[i])){
            data = data[parts[i]];
            i++;
        }
    }
    return data;
};

var set = function(data){
    var json = JSON.stringify(data);
    localStorage.setItem(storageKey, json);
};

var setPreference = function(key, value){
    var db = get();
    if(!('preferences' in db)){
        db.preferences = {};
    }
    db.preferences[key] = value;
    set(db);
};

var getPreference = function(key){
    var db = get();
    if(!('preferences' in db)){
        db.preferences = {};
    }
    return db.preferences[key];
};

var restoreDefaultPreferences = function(){
    var db = get();
    db.preferences = Defaults.preferences;
    set(db);
};


var Datastore = {
    get,
    set,
    setPreference,
    getPreference,
    restoreDefaultPreferences
};
