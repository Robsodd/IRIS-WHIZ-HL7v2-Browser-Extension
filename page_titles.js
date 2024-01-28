
// page titles
chrome.storage.local.get({
    titles: []
    }, function(stored) {
        let length = stored.titles.length
        for (i = 0; i < length; i++) {
            if (stored.titles[i].url == currentUrl) {
                document.title = stored.titles[i].title;
            }
        }
})


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		// Process on-page context menu message searches
		if (request.type == "page_title") {
			console.log("page_title triggered");
			
			try {
				changePageTitle(request.tabUrl);
			} catch {
				alert("Unable to change page title.");
				sendResponse({response: "Unable to change page title."});
			}

			sendResponse({response: "Page title updated"});
			return true
		}
		else {
			//console.log(String(request.type) + " request type unknown");
		}
		//return true
});

function changePageTitle(tabUrl) {
	// check saved for title
	let title = window.prompt("Enter new page title")
	let oldTitle = document.title;
	document.title = title;

	chrome.storage.local.get({
		titles: []
		}, function(stored) {
			let foundTitle
			// find title
			let length = stored.titles.length
			for (i = 0; i < length; i++) {
				if (stored.titles[i].url == tabUrl) {
					foundTitle = i;
				}
			}

			if (title == "") {
				//remove from saved
				if (foundTitle == undefined) {
					// pass
				} else {
					//Remove from stored.titles
					document.title = stored.titles[foundTitle].oldTitle
					stored.titles.splice(foundTitle, 1);

					// Now update storage...
				}
			} else {
				if (foundTitle == undefined) {
					const id = Date.now();
					stored.titles.push({title: title, oldTitle: oldTitle, url: tabUrl, id: id});
					// Now update storage...
				} else {
					stored.titles[foundTitle].title = title;
					// Now update storage...
				}
			}
			chrome.storage.local.set({
				titles: stored.titles
			}, function() {
				//console.log('Instances is set to:',  object);
				successAlert("Title Updated");				
			});
		}
	);
}