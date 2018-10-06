require("dotenv").config();
var keys = require("./keys")
var request = require("request");
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
var function_type = process.argv[2];
var temp_response = process.argv;
temp_response.splice(0, 3);
var search_query = temp_response;

function spotify_search(search_q) {
    spotify.search({
        type: "track", query: search_q
    }, function (err, data) {
        if (err) {
            return console.log("Error Result: " + err);
        }
        var search_result = data.tracks.items[0];
        console.log("You searched for a song named: " + search_q.join(" ") + "...")
        console.log("...");
        console.log("...");
        console.log("Artist Name: " + search_result.artists[0].name);
        console.log("------")
        console.log("Track Name: " + search_result.name);
        console.log("------")
        console.log("Preview URL (if available): " + search_result.preview_url);
        console.log("------")
        console.log("Album Name: " + search_result.album.name);
        fs.appendFile("log.txt", "\n\nYou searched for a song named: " + search_q.join(" ") + "...\n...\n...\nArtist Name: "
            + search_result.artists[0].name + "\n------\nTrack Name: " + search_result.name +
            "\n------\nPreview URL (if available): " + search_result.preview_url +
            "\n------\nAlbum Name: " + search_result.album.name, function (err, data) {
                if (err) {
                    console.log("Errored: " + err);
                }
                console.log("Successfully logged");
            })
    })
}
function check_tweet() {
    var params = { screen_name: '@chlauper' };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            var tweets_history = [];
            console.log("You searched for your latest tweets...");
            console.log("...");
            console.log("...");
            console.log("Here are your tweets starting from the latest: ")
            for (var i = 0; i < tweets.length; i++) {
                console.log("#" + (i + 1) + ': "' + tweets[i].text + '"');
                console.log("----");
                tweets_history.push("#" + (i + 1) + ': "' + tweets[i].text + '"');
            }
            fs.appendFile("log.txt",
                "\n\nYou searched for your latest tweets...\n...\n...\Here are your tweets starting from the latest: \n"
                + tweets_history.join("\n"), function (err, data) {
                    if (err) {
                        console.log("Errored: " + err);
                    }
                    console.log("Successfully logged");
                })
        }
    });
}

function movie_search(movie_title) {
    request("http://www.omdbapi.com/?t=" + movie_title + "&y=&plot=short&apikey=trilogy", function (error, response, body) {

        if (!error && response.statusCode === 200) {
            // console.log("Information about movie: " + body);
            // console.log("Look into movie info with JSON.parse: " + JSON.stringify(JSON.parse(body)))
            console.log("You searched for a movie named: " + movie_title.join(" ") + "...");
            console.log("...");
            console.log("...");
            console.log("Movie Title: " + JSON.parse(body).Title);
            console.log("----");
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("----");
            console.log("IMDb Rating: " + JSON.parse(body).imdbRating);
            console.log("----");
            console.log("Rotten Tomato Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("----");
            console.log("Country of Origin: " + JSON.parse(body).Country);
            console.log("----");
            console.log("Language(s): " + JSON.parse(body).Language);
            console.log("----");
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("----");
            console.log("Cast Members: " + JSON.parse(body).Actors)
            fs.appendFile("log.txt", "\n\nYou searched for a movie named: " + movie_title.join(" ") +"...\n...\n...\nMovie Title: "
                + JSON.parse(body).Title + "\n------\nRelease Year: " + JSON.parse(body).Year +
                "\n------\nIMDb Rating: " + JSON.parse(body).imdbRating +
                "\n------\nRotten Tomato Rating: " + JSON.parse(body).Ratings[1].Value +
                "\n------\nCountry of Origin: " + JSON.parse(body).Country +
                "\n------\nLanguage(s): " + JSON.parse(body).Language +
                "\n------\nPlot: " + JSON.parse(body).Plot +
                "\n------\nCast Members: " + JSON.parse(body).Actors, function (err, data) {
                    if (err) {
                        console.log("Errored: " + err);
                    }
                    console.log("Successfully logged");
                })
        }
    });
}

switch (function_type) {
    case "spotify-this-song":
        if (!search_query) {
            search_query = "The Sign"
        }
        spotify_search(search_query);
        break;
    case "my-tweets":
        check_tweet()
        break;
    case "movie-this":
        if (!search_query) {
            search_query = "Mr. Nobody"
        }
        movie_search(search_query);
        break;
    case "do-what-it-says":
        fs.readFile("random.txt", "utf8", function (e, content) {
            if (e) {
                return console.log("Error: " + e);
            }
            var formatted_content = content.split(",")
            switch (formatted_content[0]) {
                case "spotify-this-song":
                    spotify_search(formatted_content[1]);
                    break;
                case "my-tweets":
                    check_tweet()
                    break;
                case "movie-this":
                    movie_search(formatted_content[1]);
                    break;
                default:
                    console.log("random.txt file has incorrect command content. Please correct and try again.")
            }
        })
        break;
    default:
        console.log("Incorrect Format, Please Try Again");
}