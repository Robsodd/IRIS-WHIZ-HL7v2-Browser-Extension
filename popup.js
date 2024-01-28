/// Navigate to given session's Visual Trace page


let instances;
let titles;

document.querySelector('#optionsPage').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});


document.getElementById('pdfViewerBtn').addEventListener('click', function() {
	let base64 = document.getElementById('base64').value
	try {
		console.log(base64);
		decode(base64);
	} catch {
		alert("Unable to convert base64 text to PDF. Make sure you're highlighting the whole text.");
	}
});
let pageTitlesSearch = document.getElementById("pageTitlesSearch");
pageTitlesSearch.addEventListener('keyup', function(e) { 
	searchPageTitles(e);
});

const keys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "Control", "Shift"]
function searchPageTitles(e) {
	console.log(e);
	let key = e.key;
	let eValue = e.target.value;
	if (keys.includes(key)) {
		//console.log(e.key, "skipped")
		return
	}
	
	let textSearch = eValue.toLowerCase();
	textSearch = textSearch.replace(/\s/gm, " ");

	for (var i = titles.length - 1, page; page = titles[i]; i--) {
		console.log("Check page: ", page);
		//console.log((row.childNodes[4].innerText.toUpperCase() == (textSearchArray[1].toUpperCase())));
		let compareText = page.title.replace(/\s/gm, " ");
		compareText = compareText.toLowerCase();
		if (compareText.includes(textSearch)) {
			document.getElementById(page.id).style.display = "";
		} else {
			document.getElementById(page.id).style.display = "none";
		}

	}		
	
}

let pageTitlesBtnClicked = false;
document.getElementById('pageTitlesBtn').addEventListener('click', function() {
	if (pageTitlesBtnClicked) {
		return
	}
	pageTitlesBtnClicked = true;
	try {
		let pageContainerDiv = document.getElementById("pageContainerDiv");
		let length = titles.length
		for (i = 0; i < length; i++) {
			let pageDiv = createPageDiv(titles[i])
			if (i >= 5) {
				pageDiv.style.display = "none";
				pageContainerDiv.appendChild(pageDiv);
			} else {
				pageContainerDiv.appendChild(pageDiv);
			}
		}
		
		
		
	} catch {
		alert("Unable to load pages.");
	}
});

function createPageDiv(page) {
	let pageContainerDiv = document.createElement("div");
	pageContainerDiv.classList.add("pageContainerDiv");
	pageContainerDiv.innerHTML = "<a href='"+page.url+"' target='_blank' rel='noopener noreferrer'>"+page.title+"</a>"
	pageContainerDiv.title = page.url;
	pageContainerDiv.id = page.id;

	let datetimeP = document.createElement("p");
	const d = new Date(page.id)
	//datetimeP.innerText = d;
	datetimeP.innerText = d.toLocaleString('en-GB', { timeZone: 'UTC' });
	pageContainerDiv.appendChild(datetimeP);
	// Close button
	let closeButton = document.createElement("div");
	closeButton.innerText = "X";
	closeButton.classList.add("closeBtnDelete");
	closeButton.addEventListener("click", () => {
		pageContainerDiv.parentElement.removeChild(pageContainerDiv);
		// Delete page from titles object
		for (let i = 0; i < titles.length; i++) {
			if (titles[i].id == page.id) {
				console.log(titles);
				titles.splice(i, 1);
				console.log(titles);
				chrome.storage.local.set({ titles: titles }).then(() => {
					console.log("titles is set");
				  });
				return
			}
		}		
	})
	pageContainerDiv.appendChild(closeButton);
	return pageContainerDiv;
}

chrome.storage.local.get(['instances'], function(loadedInstances) {
	instances = loadedInstances;
	console.log("instances", instances);
})

// Load saved page titles
chrome.storage.local.get({
	titles: []
	}, function(stored) { 
		titles = stored.titles;
});

async function goToTrace() {
	console.log("go to trace...", instances);
	if (instances == undefined) {
		return
	}
	/// Takes user to the given trace ID
	let tab = await getTabID();
	
	var sessionId = document.querySelector("#sessionId").value;
	console.log("current tab:", tab, "\nsession id: ", sessionId);
	let instancesLength = instances["instances"].length;
	for (var i = 0; i < instancesLength; i ++) {
		if (tab.includes(instances["instances"][i].url)) {
			let  namespacesLength = instances["instances"][i].namespaces.length;
			for (var x = 0; x < namespacesLength; x ++) {
				if ((tab.includes(instances["instances"][i].namespaces[x].namespace.toLowerCase())) || (tab.includes("NAMESPACE=" + instances["instances"][i].namespaces[x].namespace.toUpperCase()))){
					let domain = tab.split("/")[2]
					let protocol = tab.split("/")[0]
					// Edit this URL as needed
					let trace_url = protocol + "//" + domain + "/csp/healthshare/" + instances["instances"][i].namespaces[x].namespace + "/EnsPortal.VisualTrace.zen?SESSIONID=" + sessionId
					chrome.tabs.update({
						url: trace_url
					});
				break
				}
			}
		}
	}
}

function getTabID() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                active: true,
            }, function (tabs) {
                resolve(tabs[0].url);
            })
        } catch (e) {
            reject(e);
        }
    })
}



var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");


    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
	  this.nextElementSibling.children[1].focus();
    }
  });
}


document.getElementById("traceButton").addEventListener("click", function() {
	console.log("Clicked traceButton");
	 goToTrace()
	
	});