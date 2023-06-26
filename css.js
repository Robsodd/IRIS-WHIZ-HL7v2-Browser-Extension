/// CSS page updates
// Grey, Blue, Red, Yellow
/*console.log("!?!??$!?$!?$!?$!?$?!?$?$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  CSS SCRIPT RUN");

chrome.storage.local.get(['instances'], function(stored) {
	console.log("instances", stored.instances);
	console.log("url", window.location.href);
	let instances = stored.instances
	let match
	for (var i = 0; i < instances.length; i ++ ){
		if (match) {
			break			
		}
		let url = window.location.href
		
		//console.log(my_groups)
		//console.log("evaluate tab vs group: " + my_groups[i].name)
		if (!url.includes(instances[i].url)) {
				console.log(instances[i].name + "= FALSE");
		}
		else 
		{
			let colour = instances[i].colour
			
			update_title_colour(colour);
			match = true
		}
	}
});



chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		// Process on-page context menu message searches
		if (request.type == "css") {
			console.log("css triggered");
			update_title_colour(request.colour);
			sendResponse({response: "CSS updated"});
		}
		else {
			
			sendResponse({response: "No handling defined for this message type."});
		}
});


function update_title_colour(colour) {
	let titles = document.querySelectorAll(".portalTitle");
	let alt_titles = document.querySelectorAll(".stdTitle");
	console.log("titles", titles);
	console.log("alt_titles", alt_titles);
	colour = colour_switcher(colour)
	titles.forEach(title => {
		console.log("title");
		title.style.setProperty("background", colour, "important");
		title.style.setProperty("color", "white", "important");
	});
	alt_titles.forEach(alt_title => {
		console.log("alt_title");
		alt_title.style.setProperty("background", colour, "important");		
		//alt_title.style.background = colour;
	});
}


function colour_switcher(colour) {
	let returned_colour
	if (colour == "pink") {
		returned_colour = "rgb(237,47,209)"
	} else if (colour == "blue") {
		returned_colour = "rgb(0,102,255)" 
	} else if (colour == "red") {
		returned_colour = "rgb(200,0,0)" 
	} else {
		return colour
	}
	return returned_colour
	
}
*/