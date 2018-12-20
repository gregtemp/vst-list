const request = require('request');
const colors = require('colors');

// max no. of items to lookup (each page has 20 results)
// current max is set really low to not be spammy
let max = 20;
let urlList = [];

// insert pages to request until max
for (var i = 0; i < max; i+=20){
	let url = `https://www.kvraudio.com/plugins/windows/macosx/instruments/effects/hosts/free/newest/start${i}`;
	urlList.push(url);
}

urlList.forEach((url, i) => {
	// 1 sec. cooldown to prevent spamminess
	setTimeout(() => {
		request(url, (error, response, body) => {
			if (error){
				// print error in red if request fails outright
				console.log(`${error} on ${url}`.red);
			} else {
				let status = response.statusCode;
				// print green if OK, red if any sort of error
				if (status >= 200 && status < 300){
					console.log(`${response.statusCode} on ${url}`.green);
				} else {
					console.log(`${response.statusCode} on ${url}`.red);
				}

				// this doesn't work yet but the idea is to feed the body of each listing page
				// into a function which loops through the target html elements and constructs valid URLs 
				// which would then be saved into a JSON file or DB
				// constructURLs(body);
			}
		});
	}, 1000 * i);
});


// @TODO fix this with cheerio somehow. body right now is just block of text. need to parse as if it were real html in browser.
function constructURLs(body){
	// get node list containing all product boxes on each page
	let productBoxes = document.querySelectorAll(".kvrpboximg");
	let disallowedCharacters = ["{", "}", "|", "\\", "^", "~", "[", "]", "`", " ", ":", "."];
	let productUrlList = [];

	productBoxes.forEach((product) => {
		// get the child nodes of each product box
		let children = product.nextElementSibling.childNodes;
		// break off strings from product's child nodes to get names
		let productName = children[0].innerText;
		let authorName = children[1].childNodes[2].data;

		// replace disallowed characters with hyphens
		disallowedCharacters.forEach((character) => {
			productName = findAndReplace(productName, character, "-");
			authorName = findAndReplace(authorName, character, "-");
		});

		// handle case where 2 disallowed characters occur back to back
		productName = findAndReplace(productName, "--", "-");
		authorName = findAndReplace(authorName, "--", "-");

		// concatenate (hopefully) valid URLs
		let url = `https://www.kvraudio.com/product/${productName}${authorName}`;
		productUrlList.push(url);
		console.log(productUrlList);
	});
}

function findAndReplace(string, target, replacement){
	for (let i = 0; i < string.length; i++) {
		string = string.replace(target, replacement);
	}

	return string;
}

//@TODO test individual product URLs like we did above with the product listings pages