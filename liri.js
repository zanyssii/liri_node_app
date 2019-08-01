
require("dotenv").config(); 
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require('moment');
var Spotify = require('node-spotify-api');
var colors = require('colors/safe');



var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var omdb_api_key = keys.OMDB.key;
var bit_api_key = keys.BIT.key;


var beautifiedDate = "";
var consoleOutput = "";
var logOutput = "";
var timeStamp = moment().format("LT, MMM Do, YYYY")



function askQuestions(){
    
    
    liriIn();

    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Get Band/Artist Info", "Spotify a Song", "Get Movie Info", "Let Liri decide!"],
            name: "currentCommand"
        },
        {
            
            type: "input",
            message: 'Great! For which artist or band would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Get Band/Artist Info";
            }
        },
        {
            
            type: "input",
            message: 'Great! For which song would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Spotify a Song";
            }
        },
        {
            
            type: "input",
            message: 'Great! For which movie would you like info?',
            name: "currentParameter",
            when: function (answers) {
                return answers.currentCommand==="Get Movie Info";
            }
        }
    ]).then(function(answers) {
        command = answers.currentCommand;
        parameter = answers.currentParameter;
        userCommand (command, parameter);
    });
}


function userCommand (command, parameter) {

    
    switch (command) {
        case "Get Band/Artist Info":
            getConcert(parameter);
            break;
        case "Spotify a Song":
            getSpotify(parameter);
            break;
        case "Get Movie Info":
            getMovie(parameter);
            break;
        case "Let Liri decide!":
            getBot();
            break;
    }
}


function getConcert(parameter) {

    if (parameter=="") {
        parameter = "Beatles";
    }
    axios
    .get("https://rest.bandsintown.com/artists/" + parameter + "/events?app_id=" + bit_api_key)
    .then(function(response){

        
        var JsonData = response.data;

        
        consoleOutput = "";
        for (var i=0; i < JsonData.length; i++){
            
            
            consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n\n");
            consoleOutput += colors.yellow("Venue") + colors.green(" : ") + colors.cyan(JsonData[i].venue.name + "\n");
            if ( JsonData[i].venue.region != "") {
                consoleOutput += colors.yellow("Location") + colors.green(" : ") + colors.white(JsonData[i].venue.city + ", " + JsonData[i].venue.region + ", " + JsonData[i].venue.country + "\n");
            } else {
                consoleOutput += colors.yellow("Location") + colors.green(" : ") + colors.white(JsonData[i].venue.city + ", " + JsonData[i].venue.country + "\n");
            }
            beautifiedDate = moment(JsonData[i].datetime).format("MMM Do, YYYY");
            consoleOutput += colors.yellow("Date") + colors.green(" : ") + colors.white(beautifiedDate + "\n");
            consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n");

        }
        
        
        okStatus(command, parameter, consoleOutput)

    })
    .catch(function(){

        
        errorStatus("venues");

    });
}


function getSpotify(parameter) {

    if (parameter=="") {
        parameter = "The Sign";
    }
    spotify
    .search({ type: "track", query: parameter })
    .then(function(response) {

        
        var JsonData = response.tracks.items;
        
        
        consoleOutput = "";
        for (var i=0; i < JsonData.length; i++){

            
            consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n\n");
            consoleOutput += colors.yellow("Artist") + colors.green(" : ") + colors.white(JsonData[i].artists[0].name + "\n\n");
            consoleOutput += colors.yellow("Song") + colors.green(" : ") + colors.white(JsonData[i].name + "\n\n");
            if (JsonData[i].preview_url == null){
                consoleOutput += colors.yellow("Preview") + colors.green(" : ") + colors.red("No Preview \n\n");
            } else {
                consoleOutput += colors.yellow("Preview") + colors.green(" : ") + colors.cyan(JsonData[i].preview_url + "\n\n");
            }
            consoleOutput += colors.yellow("Album") + colors.green(" : ") + colors.white(JsonData[i].album.name + "\n\n");
            consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n\n");
        }

        
        okStatus(command, parameter, consoleOutput)
        
    })
    .catch(function() {
        
        
        errorStatus("songs");

    });

}


function getMovie(parameter) {

    if (parameter=="") {
        parameter = "Mr. Nobody";
    }
    axios
    .get("https://www.omdbapi.com/?t=" + parameter + "&y=&plot=short&apikey=" + omdb_api_key)
    .then(function(response){

        
        var JsonData = response.data;

        
        consoleOutput = "";

        
        consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n\n");
        consoleOutput += colors.yellow("Title") + colors.green(" : ") + colors.cyan(JsonData.Title + "\n\n");
        consoleOutput += colors.yellow("Year") + colors.green(" : ") + colors.white(JsonData.Year + "\n\n");
        consoleOutput += colors.yellow("IMDB Rating") + colors.green(" : ") + colors.white(JsonData.Ratings[0].Value + "\n\n");
        for (i=0; i<JsonData.Ratings.length; i++) {
            consoleOutput +=  colors.yellow(JsonData.Ratings[i].Source) + colors.green(" : ") + colors.white(JsonData.Ratings[i].Value + "\n\n");
        }
        consoleOutput += colors.yellow("Country") + colors.green(" : ") + colors.white(JsonData.Country + "\n\n");
        consoleOutput += colors.yellow("Language") + colors.green(" : ") + colors.white(JsonData.Language + "\n\n");
        consoleOutput += colors.yellow("Plot") + colors.green(" : ") + colors.white(JsonData.Plot + "\n\n");
        consoleOutput += colors.yellow("Actors") + colors.green(" : ") + colors.white(JsonData.Actors + "\n\n");
        consoleOutput += colors.gray("________________________________________________________________________________________________________________________\n\n");
        
        
        okStatus(command, parameter, consoleOutput)

    })
    .catch(function() {
        
        
        errorStatus("movies");

    });
}


function getBot() {
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        }
        
        var dataArr = data.split(",");
        
        userCommand(dataArr[0], dataArr[1]);

    });
};


function logData(command, parameter, result) {

    
    logOutput = "";

    
    logOutput += "\n";
    logOutput += "***********************************************************************************************************************************************************\n\n";
    logOutput += "Logged: " + timeStamp + "\n\n";
    logOutput += "****************************************\n";
    logOutput += "Command: " + command + "\n";
    logOutput += "Search: " + parameter + "\n";
    logOutput += "****************************************\n\n";
    logOutput += "Result:\n";
    logOutput += "=======================================================================================================================================\n";
    logOutput += result + "\n";
    logOutput += "=======================================================================================================================================\n";
    logOutput += "***********************************************************************************************************************************************************\n\n";
    
    
    fs.appendFile("log.txt", logOutput, function(err) {
        if (err) {
          console.log(err);
        }
    });
}


function errorStatus(type) {

    
    consoleOutput = "";

    
    consoleOutput += colors.gray("________________________________________\n\n");
    consoleOutput += colors.red("No " + type + " found.\n");
    consoleOutput += colors.gray("________________________________________\n\n");

    
    logData(command, parameter, consoleOutput);

    
    console.log(consoleOutput);

    
    repeatQuestions();

}


function okStatus(command, parameter, consoleOutput) {

    
    logData(command, parameter, consoleOutput);

    
    console.log(consoleOutput);

    
    repeatQuestions();
}


function repeatQuestions(){

    
    liriIn();

    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to search something else?",
            choices: ["Yes", "No"],
            name: "play"
        }
    ]).then(function(answers) {

        
        if (answers.play === "Yes") {

            
            console.log('\033c');

            
            askQuestions();

        } else {

            
            consoleOutput = "";

            
            consoleOutput = "";
            consoleOutput += "\n\n";
            consoleOutput += colors.red("******************************************\n");
            consoleOutput += colors.red("*                                        *\n");
            consoleOutput += colors.red("*") + colors.magenta("           Liri") + colors.white(" out. Goodbye!           ") + colors.red("*\n");
            consoleOutput += colors.red("*                                        *\n");
            consoleOutput += colors.red("******************************************\n");
           
            
            console.log(consoleOutput);

        }
    });
}

function initialize() {

    
    console.log('\033c');
    
    
    consoleOutput = "";
    
    
    consoleOutput += colors.red("******************************************\n");
    consoleOutput += colors.red("*                                        *\n");
    consoleOutput += colors.red("*") + colors.white("          Welcome to ") + colors.magenta("Liri") + colors.grey(" Bot") + colors.white("!          ") + colors.red("*\n");
    consoleOutput += colors.red("*                                        *\n");
    consoleOutput += colors.red("*") + colors.yellow("      Author") + colors.green("  :  ") + colors.white("Argiris Balomenos      ") + colors.red("*\n");
    consoleOutput += colors.red("*") + colors.yellow("      Date") + colors.green("    :  ") + colors.white("February 25, 2019      ") + colors.red("*\n");
    consoleOutput += colors.red("*                                        *\n");
    consoleOutput += colors.red("******************************************\n\n");
    console.log(consoleOutput);

    
    askQuestions();

}

function liriIn(){

    
    consoleOutput = "";

    
    consoleOutput += "\n\n";      
    consoleOutput += colors.gray("___________________________________________________________\n\n");
    consoleOutput += colors.magenta("Liri ") + colors.grey("Bot") + colors.white("...\n");

    
    console.log(consoleOutput);

}



initialize();
