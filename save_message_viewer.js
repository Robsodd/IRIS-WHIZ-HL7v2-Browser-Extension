/// Share Message Viewer Page
/// Share Message Viewer Page
console.log("Share Message Viewer Script");


const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);

window.addEventListener("load", function() { 

	// Create the button that creates share link
	saveMessageViewerBtn = document.createElement("button");
	buttonStyling(saveMessageViewerBtn);
	saveMessageViewerBtn.style.backgroundColor = "purple";
	saveMessageViewerBtn.style.color = "white";
	saveMessageViewerBtn.style.position = "absolute";
	saveMessageViewerBtn.style.marginLeft = "110px";
	saveMessageViewerBtn.style.bottom = "5px";
	saveMessageViewerBtn.innerText = "Share Search";
	saveMessageViewerBtn.title = "Copy the current URL and search to clipboard";

	document.body.appendChild(modal);
	document.body.appendChild(saveMessageViewerBtn);

	saveMessageViewerBtn.addEventListener("click", function() {
		saveSearch();
	});

	if (urlParams.has("savedSearch")) {
		let searchID = urlParams.get('savedSearch')
		openSearch(searchID);
	}
});


function openSearch(searchId) {
	let selectBox = document.getElementById("control_61");
	selectBox.value = searchId;
	var change = new Event('change');
	selectBox.dispatchEvent(change);
	let deleteButton = document.getElementById("searchDeleteTxt");
	deleteButton.click();
	let searchButton = document.getElementById("command_searchButton");
	searchButton.click();

}


function saveSearch() {
	let saveAsBtn = document.getElementById("saveSearchAsTxt");
	saveAsBtn.click();
	let date = getDate();
	let timestamp = "zz" + date.raw;
	let saveTxt = document.getElementById("control_63");
	let copyTxt  = document.createElement("textarea");
	let shareUrl = currentUrl.split(".zen")

	shareUrl = shareUrl[0];
	shareUrl = shareUrl + ".zen?savedSearch=" + timestamp;
	
	saveTxt.value = timestamp;
	copyTxt.value = shareUrl;
	copyTxt.innerText = timestamp;
	document.body.appendChild(copyTxt);
	copyTxt.focus();
	copyTxt.select();
	
	
	var text = timestamp;
	
	try {
		document.execCommand('copy');
		document.body.removeChild(copyTxt);
		successAlert("URL Copied to clipboard");
	} catch (err) {
		console.error('Unable to copy to clipboard', err);
	}
		
	let confirmSaveBtn = document.getElementById("image_65"); 
	confirmSaveBtn.click();
}

