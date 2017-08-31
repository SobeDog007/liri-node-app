// Steven Sober
// 08-28-2017
// LIRI Bot Homework
// liri.js

// Supported Commands:

// my-tweets
// spotify-this-song
// movie-this
// do-what-it-says

// ***************************************************************************
// Global Variables and Functions
// ***************************************************************************

// Node module variables:
var Twitter = require('twitter');
var Spotify = require("node-spotify-api");
var request = require("request");
var fs      = require("fs");

var logFile    = "log.txt";
var randomFile = "random.txt";

// Function to write entry to the log file.
var logEntry = function(filename, infoBlock) {

	fs.appendFile(filename, "\n" + infoBlock, function(err) {

		if (err) {
			return console.log(err);
		}
	});
};

// ***************************************************************************
// Main Program Execution
// ***************************************************************************

var command = process.argv[2];

console.log("\nCommand = " + command);

var input   = "";

// Handle the "do-what-it-says" case first since it will call one of the
// other three commands.
if (command === "do-what-it-says")
{
	fs.readFile(randomFile, "utf8", function(error, data) {

	  	// If the code experiences any errors it will log the error to the console.
	  	if (error) {
	    	return console.log(error);
	  	}	

	  	// Then split it by commas (to make it more readable)
	  	var dataArr = data.split(",");

	  	command = dataArr[0];
	  	console.log("\nDWIS Command: " + command);

	  	input   = dataArr[1];
	  	console.log("DWIS Input: " + input + "\n");

	  	commandSwitch(command, true);
	});
}

else
{
	commandSwitch(command);
}

// Choose action based on the passed in command (or the one in "random.txt").
function commandSwitch(command, doWhatItSays = false)
{
	switch (command)
	{
   	case "my-tweets":
       
	   	// Show user's last 20 tweets and when they were created.
			var tKeys = require("./key.js");
			
			// Set up the API authentication.
			var client = new Twitter( {
			   consumer_key: tKeys.twitterKeys.consumer_key,
			   consumer_secret: tKeys.twitterKeys.consumer_secret,
			   access_token_key: tKeys.twitterKeys.access_token_key,
			   access_token_secret: tKeys.twitterKeys.access_token_secret
			});
			 
			var params = {stevenUNCBCtest: 'nodejs'};

			client.get('statuses/user_timeline', params, 
				function(error, tweets, response) {

				if (!error) {

					var infoBlock = "\nTweets: \n\n";

					// Cycle through the tweets; parse and console log each one.
			   	tweets.forEach(function(element) {

			   		console.log("\n" + element.created_at);
			   		console.log(element.text);

			   		infoBlock += "\n" + element.created_at + "\n" +
			   		             element.text + "\n";
			   	});

			   	// Write the tweets to the log file.
		  			logEntry(logFile, infoBlock);
			  	}
			});

	      break;

	   case "spotify-this-song":

	   	// Provide the artist(s), song name, preview link, and album.
	       console.log(doWhatItSays);
	      // Grab the input song (if one wasn't provided by "do-what-it-says").
	      if (!doWhatItSays)
	      {
	      	input = process.argv.slice(3).join("+");

	      	// If no input song exists, default to "The Sign" by Ace of Base.
	      	if (input === "")
	      	{
	      		input = "The Sign";
	      	}
	      }
	 
	      console.log("\nInput: " + input);

	 		// Set up the API authentication.
			var spotify = new Spotify( {

	  			id: "bbc17caf6c8a455ea3e8f22a1708a357",
	  			secret: "633d38ddc40a41bd9f382a4f6513987a"
			});
	 
	 		// Make the API call to Spotify.
			spotify.search({ type: "track", query: input }, function(err, data) {

		  		if (err) {
		    		return console.log("Spotify API Error: " + err);
		  		}
		 
		  		// Parse and console log the song info.
		  		var info = data.tracks.items[0];

		  		var infoBlock = "\nSong Name: " + info.name + 
		  		                "\nArtist(s): " + info.artists[0].name + 
		  		                "\nAlbum:     " + info.album.name + 
		  		                "\nPreview:   " + info.preview_url;

		  		console.log(infoBlock);

		  		// Write the info to the log file.
				logEntry(logFile, infoBlock);

			});
	      
	      break;

	   case "movie-this":
	        
	      // Provide the following movie information from OMDB: title, year,
	      // IMDB rating, Rotten Tomatoes rating, country of production,
	      // language, plot, and actors.

	 		// Grab the input movie (if one wasn't provided by "do-what-it-says").
	 		if (!doWhatItSays)
	      {
	      	input = process.argv.slice(3).join("+");

				// If no input movie exists, default to "Mr. Nobody".
	      	if (input === "")
	      	{
	      		input = "Mr. Nobody";
	      	}
	      }

	 		// Make the API call to OMDB.
			request("http://www.omdbapi.com/?t=" + input + "&apikey=40e9cece", 
				function(error, response, body) {

		  		// If the request is successful (i.e. if the response status code is 200).
		  		if (!error && response.statusCode === 200)
		  		{
					// Parse and console log the movie info.
			  		var info = JSON.parse(body);

			  		// Ensure the title and rotten tomatoes values are defined to
			  		// to prevent errors in case movie input is bad.
			  		if ((info.Title !== undefined) && (info.Ratings[1] !== undefined))
			  		{
			  			var infoBlock = "\nTitle:       " + info.Title + 
			  		   	             "\nYear:        " + info.Year + 
			  		      	          "\nIMDB Rating: " + info.imdbRating + 
			  		         	       "\nR. Tomatoes: " + info.Ratings[1].Value +
			  		            	    "\nCountry:     " + info.Country +
			  		               	 "\nLanguage     " + info.Language +
			  		                 	 "\nPlot:        " + info.Plot +
			  		                 	 "\nActors:      " + info.Actors;

			  			console.log(infoBlock);

			  			// Write the info to the log file.
			  			logEntry(logFile, infoBlock);
			  		}

			  		else
			  		{
			  			console.log("\nMovie Not Found!");
			  		}
		  		}
			});

	      break;

	   default:

	        console.log("Unsupported Command!  Please try again!");

	}    // End: switch statement
};      // End: commandSwitch function
