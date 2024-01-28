// Namespace Category search
console.log("Namespace Category Search");

let activeNamespaces = [];
let mainCategoryList = [];
let currentPageCategoryList = [];
let namespaceTotal = 0;
let namespaceCount = 0;
let currentNamespace = currentUrl.split("/")[5];

let zen1;
let zen1Height;
let propertyPane;
let propertyPaneHeight
let body_62;
let body_62Height
let settingsForm;
let settingsFormHeight;


currentNamespace = currentNamespace.toUpperCase();
console.log("currentNamespace", currentNamespace);

createNamespaceCategorySearchBar(document);
namespaceCategorySearchButton(document);

function minimiseiFrame(Document, iframeDiv) {
	let minimiseBtn = Document.createElement('btn');
	
	minimiseBtn.classList.add("minimiseiFrameBtn");
	
	minimiseBtn.title = "Close";
	minimiseBtn.innerText = "x";
	minimiseBtn.addEventListener('click', () => {
		minimiseBtn.parentElement.style.display = "none";
	})
	//console.log("buttonBar", messageBtnBar, messageDiv.id);
	iframeDiv.appendChild(minimiseBtn);
}	

window.addEventListener("load", function() { 

	// Get category list for this page
	let categorySelect = document.getElementById("id_Category");
	for (let i = 0; i < categorySelect.options.length; i++ ) {
		currentPageCategoryList.push(categorySelect.options[i].textContent);
	}
	
	zen1 = document.getElementById("zen1");
	zen1Height = zen1.style.height;
	propertyPane = document.getElementById("propertyPane");
	propertyPaneHeight = propertyPane.style.height;
	propertyPane.style.resize = "both";
	body_62 = document.getElementById("body_62");
	if (body_62 == undefined) {
		// Ensemble
		body_62 = document.getElementById("body_59");
	}
	body_62Height = body_62.style.height;
	settingsForm = document.getElementById("settingsForm");
	settingsFormHeight = settingsForm.style.height;

	let zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_60");
	if (zenLayoutTableCell_60 == undefined) {
		// Ensemble
		zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_57");
	}
	zenLayoutTableCell_60.style.overflow = "auto";

});


let frameLoadedEvent; // The custom event that will be created
frameLoadedEvent = document.createEvent("HTMLEvents");
frameLoadedEvent.initEvent("frameLoaded", true, true);
frameLoadedEvent.eventName = "frameLoaded";

var click = new CustomEvent('click');
var change = new CustomEvent('change');

// When category list is chosen
document.addEventListener("categoryListSelection", function(e) { 
	let eventValue
		if (e.optionValue.includes("*")) {
			eventValue = e.optionValue.split("*")[1]
		} else {
			eventValue = e.optionValue
	}
	
	let currentPageCategoryDropDown = document.getElementById("id_Category");
	updateCategoryList(currentPageCategoryDropDown, eventValue);
 
	//e.target.value // our option value
	//console.log(e.optionValue);
	//console.log("categoryListSelectionEvent",e);
	let matchingNamespaces = 0;
	for (let i = 0; i < activeNamespaces.length; i++ ) {
		let iframe = activeNamespaces[i].iframe;
		if (activeNamespaces[i].hostname == currentNamespace) {
			// Hide current production
			iframe.parentElement.style.display = "none";
		} else {
			let categoryList = activeNamespaces[i].categoryList;
			if ((categoryList != undefined) && (categoryList.includes(eventValue))) {
				matchingNamespaces++
				let iframeCategoryDropDown = iframe.contentDocument.getElementById("id_Category");
				//console.log("iframeCategoryDropDown", iframeCategoryDropDown);
				iframe.parentElement.style.display = "";
				updateCategoryList(iframeCategoryDropDown, eventValue);			
			} else {
				iframe.parentElement.style.display = "none";
			}
		
		}
		
	}
	//console.log("matchingNamespaces", matchingNamespaces);
	if (matchingNamespaces > 0) {
		// Resize window to 50% for ease of viewing all productions

		zen1.style.height = "525px";
		propertyPane.style.height = "325px";
		propertyPane.style.overflow = "auto";
		body_62.style.height = "325px";
		settingsForm.style.height = "325px";

		let zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_60");
		if (zenLayoutTableCell_60 == undefined) {
			// Ensemble
			zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_57");
		}
		zenLayoutTableCell_60.style.overflow = "auto";
	} else {
		
		zen1.style.height = zen1Height;
		propertyPane.style.height = propertyPaneHeight;
		body_62.style.height = body_62Height;
		settingsForm.style.height = settingsFormHeight;

		let zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_60");
		if (zenLayoutTableCell_60 == undefined) {
			// Ensemble
			zenLayoutTableCell_60 = document.getElementById("zenLayoutTableCell_57");
		}
		zenLayoutTableCell_60.style.overflow = "auto";
		
	}

})

function updateCategoryList(categoryListObject, category) {
	if (category == "All") {
		category = "";
	}
	for (let x = 0; x < categoryListObject.options.length; x++) {
		if (categoryListObject.options[x].value == category) {
			categoryListObject.click();
			categoryListObject.value = category
			categoryListObject[x].selected = true;
			categoryListObject.dispatchEvent(change);
			categoryListObject.parentElement.click();
			delay(200).then(() => {
				categoryListObject.click();
				categoryListObject.value = category;
				categoryListObject[x].selected = true;
				categoryListObject.dispatchEvent(change);
				categoryListObject.parentElement.click();
			});
			break
		}
	}
	
}

// Remove loading message
let loaded = 0;
document.addEventListener("frameLoaded", function(e) {
	loaded ++
	let namespaceCategoryDropDown = document.getElementById("namespaceCategoryDropDown");
	for (let i = 0; i < activeNamespaces.length; i++) {
		if ((activeNamespaces[i].loaded == undefined) || activeNamespaces[i].loaded == false)  {
			namespaceCategoryDropDown.options[0].textContent = "Fetching active productions: " + loaded + "/" + activeNamespaces.length;
			return
		}
	}
	
		

	for (let x = 0; x < mainCategoryList.length; x++) {
		if (currentPageCategoryList.includes(mainCategoryList[x])) {
			mainCategoryList[x] = "*" + mainCategoryList[x]
		}	
	}
	
	let sortedCategoryList = mainCategoryList.sort();
	for (let x = 0; x < sortedCategoryList.length; x++) {
		createOption(sortedCategoryList[x]);
	}
	
	if (namespaceCategoryDropDown.options[0].textContent.includes("Fetching active productions:")) {
		namespaceCategoryDropDown.remove(0);
	}
});


// When categoryList button clicked
document.addEventListener("categoryList", function(e) {
	//optionsLoading();
	let homepageIframe = document.createElement("iframe");	
	homepageIframe.src = currentURLBeforeCSP + "/csp/sys/%25CSP.Portal.Home.zen?disableComponentReport=true"
	homepageIframe.style.display = "none";
	document.body.appendChild(homepageIframe);
	homepageIframe.addEventListener("load", function() {
	let ndDidYou = homepageIframe.contentDocument.getElementsByClassName("ndDidYou");
	linksContainer = homepageIframe.contentDocument.getElementById("messagePanel");
	let links = linksContainer.getElementsByClassName("ndLink");
	console.log("LINKS:", links);
	let linksLength = links.length;
	for (let x = 0; x < linksLength; x ++) { 
		let isRunning
		if (ndDidYou.length != 0) {
			//ensemble
			isRunning = links[x].parentNode.previousSibling.previousSibling.innerText.includes("Running")
		} else {
			//iris
			isRunning = links[x].parentNode.previousElementSibling.innerText.includes("Running")

		}
	
		if (links[x].href.includes("EnsPortal.ProductionConfig.zen") && (isRunning)) {
			namespaceTotal ++
			activeNamespaces.push({
								href: String(links[x].href),
								hostname: links[x].parentNode.previousSibling.previousSibling.previousElementSibling.outerText.split(" in ")[1],
								status: links[x].parentNode.previousSibling.previousSibling.innerText.includes("Running")}
							);
			}
		}

		let namespacesLength = activeNamespaces.length; 
		console.log("activeNamespaces", activeNamespaces);
		for (let i = 0; i < namespacesLength; i ++) {
			//console.log("compare namespace names", activeNamespaces[i].hostname, currentNamespace);
			/*if (activeNamespaces[i].hostname == currentNamespace) {
				activeNamespaces[i].loaded = true;
				continue
			}*/
			namespaceCount ++
			let iframe = document.createElement("iframe");	

			iframe.src = String(activeNamespaces[i].href) + "&disableNamespaceCategorySearch=true"
			iframe.namespace = String(activeNamespaces[i].hostname)
			activeNamespaces[i].iframe = iframe;
			activeNamespaces[i].loaded = false;
			iframe.style.width = "100%";
			iframe.style.height = "500px";
			//iframe.style.display = "none";
			iframe.style.resize = "both";
			iframe.style.overflow = "auto";
			activeNamespaces[i].categoryList = [];
			
			let iframeDiv = document.createElement("div");
			minimiseiFrame(document, iframeDiv);
			iframeDiv.appendChild(iframe);
			document.body.appendChild(iframeDiv);
			
			iframe.addEventListener("load", function() {
				// this is where we need to hide the headers, grab the categories and 
				
				// Hide header
				let iframeTable = iframe.contentDocument.getElementById("group_1");
				iframeTable.rows[0].style.display = "none";
				//iframeTable.rows[4].style.display = "none";
				// Update title to be namespace 

				//let nametoolRibbon = iframeTable.getElementById("nametoolRibbon");
				let ribbonTitle =iframe.contentDocument.getElementsByClassName("ribbonTitle");
				ribbonTitle[0].innerText = iframe.namespace;
				
				let iframeCategoryList = iframe.contentDocument.getElementById("id_Category");
				for (let x = 0; x < iframeCategoryList.options.length; x++ ) {
					let iterationOption = iframeCategoryList.options[x].textContent
					if (mainCategoryList.includes(iterationOption)) {
						//Already includes this category list, skip
						activeNamespaces[i].categoryList.push(iterationOption);
					} else {
						mainCategoryList.push(iterationOption);
						activeNamespaces[i].categoryList.push(iterationOption);
					}
				}
				activeNamespaces[i].loaded = true;
				document.dispatchEvent(frameLoadedEvent);
			});

		}	
		
	});
		
});

// Get namespace homepage

function createOption(optionText) {
	let namespaceCategoryDropDown = document.getElementById("namespaceCategoryDropDown");
	let thisOption = document.createElement('option');
	let thisOptiontext = document.createTextNode(optionText);
	thisOption.appendChild(thisOptiontext);
	namespaceCategoryDropDown.appendChild(thisOption);
}


function optionsLoading() {
	delay(500).then(() => {
		let namespaceCategoryDropDown = document.getElementById("namespaceCategoryDropDown");
		let loadingstring = namespaceCategoryDropDown.options[0].textContent
		if (loadingstring.includes("Loading")) {
			let count = (loadingstring.match(/\./g) || []).length
			if (count > 3) {
				loadingstring = "Loading"
			} else {
				loadingstring = loadingstring + "."
			}
			namespaceCategoryDropDown.options[0].textContent = loadingstring
			optionsLoading();
		}
	});
	
}


