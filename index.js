var fs = require("fs");
var brain = require("brain.js");
const Storage = require( 'node-storage' );
const translations = new Storage( "translations.db" );
var translationReference = JSON.parse( fs.readFileSync( "translations.db" ) );
var phrases = Object.keys( translationReference );

var nonEnglishPhrases = phrases.filter( x => {
  var t = translations.get( x );
  return t.lang != "en-en";
});
var englishPhrases = phrases.filter( x => {
  var t = translations.get( x );
  return t.lang == "en-en";
});

console.log( nonEnglishPhrases.length );
console.log( englishPhrases.length );

var trainingData = [];
englishPhrases.forEach( x => {
  trainingData.push( {
    input: encode( x ),
    output: { english: 1 }
  });
});
nonEnglishPhrases.forEach( x => {
  trainingData.push( {
    input: encode( x ),
    output: { not: 1 }
  });
});

function encode(arg) {
   return arg.substr(0, 32).split('').map(x => (x.charCodeAt(0) / 255));
}

console.log( trainingData );

const net = new brain.NeuralNetwork();
var result = net.train( trainingData, {
  iterations: 50,
  callback: console.log
} );
console.log( result );

var ComfyJS = require("comfy.js");
ComfyJS.onChat = ( user, message, flags ) => {
  // console.log( message );
  var output = net.run( encode( message ) );
  console.log( message, output );
}
ComfyJS.Init( "instafluff" );
