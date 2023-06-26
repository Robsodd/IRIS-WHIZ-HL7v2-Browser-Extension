/// Navigate to given session's Visual Trace page

document.getElementById("traceButton").addEventListener("click", goToTrace);
let instances;

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


chrome.storage.local.get(['instances'], function(loadedInstances) {
	instances = loadedInstances;
	console.log("instances", instances);
})


async function goToTrace() {
	/// Takes user to the given trace ID
	let tab = await getTabID();
	var sessionId = document.querySelector("#sessionId").value;
	
	for (var i = 0; i < instances["instances"].length; i ++) {
		if (tab.includes(instances["instances"][i].url)) {
			for (var x = 0; x < instances["instances"][i].namespaces.length; x ++) {
				if ((tab.includes(instances["instances"][i].namespaces[x].namespace)) || (tab.includes("NAMESPACE=" + instances["instances"][i].namespaces[x].namespace.toUpperCase()))){
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