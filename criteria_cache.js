/// Message Viewer Criteria Caching
console.log("Criteria Cache Script Loaded");

let numberOfCriterionToCache = 10;
let extendedCriteria;
let extendedCriteriaClone;
let criterionCache = []; // Copy of storage criterion cache
let criterion = [];
let searchDateTime;
let searchButton;
let globalIncrement = 0;

let modal;
let modalBtn;
let modalSpan;
let modalContent;

// Used in debugging.
//deleteCache();

// Update the local criterion cache with cache from storage
function getCriterionCache() {
	chrome.storage.local.get(['CriterionCache'], function(cache) {
		criterionCache = [];
		if (cache.CriterionCache == undefined) {
			criterionCache = [];
		} else {
			for (let i = 0; i < cache.CriterionCache.length; i++) {
				criterionCache[i] = cache.CriterionCache[i];
				criterionCache[i].div = document.createElement("div");
				criterionCache[i].div.innerHTML = "<div><h3>" + cache.CriterionCache[i].datetime.formatted + " - " + cache.CriterionCache[i].tieInfo.instance + "/ " +  cache.CriterionCache[i].tieInfo.namespace + "</h3></div>" + cache.CriterionCache[i].data.amended;
			}
		}
		searchButton.addEventListener("click", function() { 
		saveCache();
	});
		//console.log("Cache retreived:", cache, criterionCache);
	});
}

// Remove all cached searches from storage
function deleteCache() {
	chrome.storage.local.set({CriterionCache: []}, function() {
		//console.log('criterionCache deleted:');
	});
}

// Save cache to local storage
function saveCache() {

	/// Copy the criteria section
	let extendedCriteriaTable = document.getElementById("extendedCriteriaTable");
	//console.log("extendedCriteriaTable", extendedCriteriaTable);
	extendedCriteriaTableClone = extendedCriteriaTable.cloneNode(true);
	searchDateTime = getDate();
	
	// Rename the element's IDs so they don't clash and cause errors
	renameIds(extendedCriteriaTableClone, searchDateTime.raw);
	//console.log("extendedCriteriaClone", extendedCriteriaTableClone);
	let titleVals = document.getElementsByClassName("portalTitleInfoVal"); //
	//console.log("titleVals", titleVals);
	let currentCriteriaObject = {
		"tieInfo": {
			"instance": titleVals[0].innerText.split(" ")[0],
			"namespace": titleVals[1].innerText.split(" ")[0],
		},
		"datetime": {
			"raw": searchDateTime.raw, 
			"formatted": searchDateTime.formatted
		},
		"data": {
			"raw": extendedCriteriaTable.outerHTML,
			"amended": extendedCriteriaTableClone.outerHTML
		}
	}
	


	let savedCache = [];
	let duplicate = false;
	let x = 0;
	// Check to see if current criterion object already exists in cache
	for (let i = 0; i < criterionCache.length; i++) {
		x++
		//console.log("duplicate check: ", criterionCache[i].data.raw, " === ", currentCriteriaObject.data.raw, (criterionCache[i].data.raw === currentCriteriaObject.data.raw))
		if (criterionCache[i].data.raw === currentCriteriaObject.data.raw) {
			// skip, the criterion object is identical to one already in the cache
			x--
			duplicate = true;
			break
		} else {

		}
	}
	
	if (duplicate) {
		//console.log("Duplicate detected");
		//chrome.storage.local.set({CriterionCache: criterionCache,}, function() {
			//console.log('Saved criterionCache is set to:',  criterionCache);
		//});
	} else {
		
		// Limit criterionCache to numberOfCriterionToCache, delete oldest
		while (criterionCache.length > numberOfCriterionToCache) {
			criterionCache.pop();
		}
		// Add current object to the cache
		for (let i = 0; i < criterionCache.length; i++) {
			//console.log("Adding to saved cache: ", criterionCache[i]);
			savedCache[i] = {
				datetime: criterionCache[i].datetime, 
				data: criterionCache[i].data,
				tieInfo: criterionCache[i].tieInfo
				}
		}
		criterionCache.unshift(currentCriteriaObject);
		savedCache.unshift(currentCriteriaObject);
		
		//console.log("criterionCache, current object added", criterionCache);
		//console.log("saveCache", savedCache);
		chrome.storage.local.set({CriterionCache: savedCache,}, function() {
			//console.log('Saved criterionCache is set to:',  savedCache);
		});
		for (let i = 0; i < savedCache.length; i++) {
			criterionCache[i] = savedCache[i];
			criterionCache[i].div = document.createElement("div");
			criterionCache[i].div.innerHTML = savedCache[i].data.amended;
		}
	}

}

/// Allow changes to cache to be seen on all tabs
chrome.storage.onChanged.addListener(function(changes, areaName) {
	getCriterionCache();
	//console.log("cache updated!");
});



window.addEventListener("load", function() {
	getCriterionCache();
	extendedCriteria = document.getElementById("extendedCriteriaTable");
	searchButton = document.getElementById("command_searchButton");
	
	createModal();
});


// Creates the modal and button to activate it
function createModal() {
	
	// Create the modal
	modal = document.createElement("div");
	modal.className = "modal";
	modal.id = "cacheModal";
	modal.style.display = "none";
	modal.style.position = "fixed";
	modal.style.zIndex = "1";
	modal.style.right = "0";
	modal.style.top = "60px";
	modal.style.width = "50%";
	modal.style.height = "100%";
	modal.style.overflow = "auto";

	// Create the button that opens the modal
	modalBtn = document.createElement("button");
	buttonStyling(modalBtn);
	modalBtn.style.backgroundColor = "#05c705";
	modalBtn.style.position = "absolute";
	modalBtn.style.marginLeft = "5px";
	modalBtn.style.bottom = "5px";
	modalBtn.innerText = "Search History";

	document.body.appendChild(modal);
	document.body.appendChild(modalBtn);
	
	// When the user clicks the button, open the modal 
	modalBtn.onclick = function() {
		// remove any existing criterion
		modal.textContent = "";		
		
		// make modal visible
		modal.style.display = "block";
		
		// create Div for content.
		modalContent = document.createElement("div");
		modalContent.id = "cacheModalContent";
		modalContent.className = "cacheModalContent";
		modalContent.style.margin = "auto";
		modalContent.style.padding = "20px";
		modalContent.style.border = "1px solid #888"; 
		modalContent.style.backgroundColor = "rgba(255,255,255,0.9)";
		modalContent.style.height = "85%";
		modalContent.style.overflow = "auto";
		modalContent.innerHTML = "<h3>Extended Criteria Search History</h3>";
		modal.appendChild(modalContent);

		// Adds close button that hides parent modal when clicked
		let closeButton = closeButtonHide(document);
		closeButton.addEventListener('click', () => {
			closeButton.parentElement.parentElement.style.display = "none";
		});
		modalContent.appendChild(closeButton);

		// Iterate through criterionCache and create divs
		for (let i = 0; i < criterionCache.length; i++) {
			globalIncrement++
			//console.log(criterionCache[i]); /// Currently no DIV here? Why???
			modalContent.appendChild(criterionCache[i].div);
			//console.log("criterionCache[", i,"]",criterionCache[i]);
			if (criterionCache[i].div.style.margin != "20px") {
				criterionCache[i].div.style.border = "1px grey solid";
				criterionCache[i].div.style.borderRadius = "5px";
				criterionCache[i].div.style.background = "rgba(255,255,255,1)";
				criterionCache[i].div.style.margin = "20px";
				criterionCache[i].div.style.padding = "10px";
				criterionCache[i].div.style.position = "relative";
				criterionCache[i].div.className = "criterion_" + String(globalIncrement);
				
				// Add close buttons to crieterion elements
				let closeButton = closeButtonDelete(document);
				closeButton.addEventListener('click', () => {			
					//console.log("criterionCache before delete",criterionCache);
					for (let x = 0; x < criterionCache.length; x++) {
						if (closeButton.parentElement.childNodes[1].id.includes(criterionCache[x].datetime.raw)) {
							//skip, the criterion object is identical to one in the cache							
							//console.log("DELETE MATCH!");
							criterionCache.splice(x,1);
							//console.log("criterionCache after delete",criterionCache);
							// Save changes
							saveCache();
							break
						} else {

						}
					}
					
				})
				criterionCache[i].div.appendChild(closeButton);
			}
			//console.log("criterionCache[", i,"].div.childNodes", criterionCache[i].div.childNodes);
			// Add hover and click behaviour to criterion elements
			for (let x = 0; x < criterionCache[i].div.childNodes.length; x++) {
				//console.log("criterionCache[", i,"].div.childNodes[", x, criterionCache[i].div.childNodes[x]);
				if (criterionCache[i].div.childNodes[x].tagName == "TABLE") {
					//criterionCache[i].div.childNodes[x].style.background = "red";
					for (let z = 0; z < criterionCache[i].div.childNodes[x].childNodes[0].childNodes.length; z++) {
						criterionCache[i].div.childNodes[x].childNodes[0].childNodes[z].style.background = "rgba(255,255,255,1)";
						criterionCache[i].div.childNodes[x].childNodes[0].childNodes[z].style.cursor = "pointer";
						
						criterionCache[i].div.childNodes[x].childNodes[0].childNodes[z].addEventListener("mouseenter", function(event) {
							addHoverLogic(event.target, event.target);
						});
						
						criterionCache[i].div.childNodes[x].childNodes[0].childNodes[z].addEventListener("mouseleave", function(event) {
							removeHoverLogic(event.target, event.target);
						});
						
						criterionCache[i].div.childNodes[x].childNodes[0].childNodes[z].addEventListener("click", function(event) {
							addClickLogic(event.target);
						});
						
					}
				}
			}
		}
	}
}

/// Renames element's ID and all child nodes IDs by appending the current datetime (prevent display issues from elements with identical IDs)
function renameIds(element, datetime) {
	if (element.id) {
		element.id = element.id + "_" + String(datetime);
	}
	for (let i = 0; i < element.children.length; i++) {
		renameIds(element.children[i], String(datetime));
	}
}

/// ON HOVER LOGIC
function addHoverLogic(element, hoveredElement) {
	highlightCheckNextNode(element, hoveredElement);
	highlightCheckPreviousNode(element, hoveredElement);
}

let highlightColour = "rgba(50, 250,0.4)";

function highlightCheckNextNode(element, hoveredElement) {
	if (((element.id) && (element.id.includes("criterion_")) && (element != hoveredElement))) {
		/// Skip
	} else {
		element.style.background = highlightColour;
		if (element.nextElementSibling) {
			highlightCheckNextNode(element.nextElementSibling);
		}
		
	}
}

function highlightCheckPreviousNode(element, hoveredElement) {
	if ((element.id) && (element.id.includes("criterion_"))) {
		/// Skip
		element.style.background = highlightColour;
	} else {
		element.style.background = highlightColour;
		if (element.previousElementSibling) {
			highlightCheckPreviousNode(element.previousElementSibling);
		}
	}
}



// ON REMOVE HOVER LOGIC
function removeHoverLogic(element, hoveredElement) {
	unhighlightCheckNextNode(element, hoveredElement);
	unhighlightCheckPreviousNode(element, hoveredElement);
}

let unhighlightColour = "rgba(255, 255, 255, 1)";

function unhighlightCheckNextNode(element, hoveredElement) {
	if (((element.id) && (element.id.includes("criterion_")) && (element != hoveredElement))) {
		/// Skip
	} else {
		element.style.background = unhighlightColour;
		if (element.nextElementSibling) {
			unhighlightCheckNextNode(element.nextElementSibling);
		}
		
	}
}

function unhighlightCheckPreviousNode(element, hoveredElement) {
	if (((element.id) && (element.id.includes("criterion_")) && (element != hoveredElement))) {
		/// Skip
		element.style.background = unhighlightColour;
	} else {
		element.style.background = unhighlightColour;
		if (element.previousElementSibling) {
			unhighlightCheckPreviousNode(element.previousElementSibling);
		}
	}
}

// ON CLICK LOGIC
let clickColour = "rgba(255,0,0,0)";

// Adds click logic to provided element
function addClickLogic(element) {
	let clickedElement = getTopElement(element);
	let clickedCriteria = getClickedCriteria(clickedElement);
	addCriteriaToSearch(clickedCriteria);
}

// Create and trigger the event to be processed by the message_search script
function addCriteriaToSearch(clickedCriteria) {
	var messageSearchEvent = new Event('messageSearch');

	// Set messageSearchEvent.criterionTitle to determine the header field
	let criterionTitle = clickedCriteria[0].outerText.split("/")[0];
	//console.log("CRITERION TITLE = ", criterionTitle); 
		
	// Header Criteria
	if (criterionTitle.includes("Ens.MessageHeader")) {
		messageSearchEvent.criterionType = "Header";
		messageSearchEvent.selector = "Ens.MessageHeader";
		
	// HL7 Message Criteria
	} else if (criterionTitle.includes("EnsLib.HL7.Message")) {
		/// TODO: Eventually do a loop here for each conditionRow instead of accessing clickedCriteria[1]
		messageSearchEvent.selector = "EnsLib.HL7.Message";
		if (clickedCriteria[1].childNodes[1].textContent.includes(":{")) {
			// Square bracket suggests VDocPath has been used
			messageSearchEvent.criterionType = "VDocPath";
			
		} else {
			// :{ - curly bracket suggests VDocSegment
			messageSearchEvent.criterionType = "VDocSegment";
		}
	} else {
		/// Sorry, criteria type not yet supported.
		window.alert("Sorry, criteria type not yet supported.");
		return
	}
	//console.log("Clicked criterionType = ", messageSearchEvent.criterionType);
	messageSearchEvent.criterionRows = [];
	for (let x = 1; x < clickedCriteria.length; x++) {
		let row;
		if (clickedCriteria[x].className == "conditionRow") {			
			let innerText = clickedCriteria[x].innerText.split("\t");
			let cond_Val_1;
			let cond_Val_2;
			//console.log("innerText =", innerText);
			
			if (innerText[1].includes(":{")) {
				// VDocSegment
				cond_Val_1prep = innerText[1].split(":{");
				cond_Val_1 = cond_Val_1prep[0];
				cond_Val_2prep = innerText[1].split(":{");
				cond_Val_2 = cond_Val_2prep[1].slice(0, -1);
			} else if (innerText[1].includes(":[")){
				// VDocPath
				cond_Val_1prep = innerText[1].split(":[");
				cond_Val_1 = cond_Val_1prep[0];
				//console.log("cond_Val_1",cond_Val_1);
				cond_Val_2prep = innerText[1].split(":[")[1];
				//console.log(cond_Val_2prep);
				cond_Val_2 = cond_Val_2prep.slice(0, -1);
			} else {
				// Header
				cond_Val_1 = innerText[0];
				cond_Val_2 = innerText[1];
			}
			let opSelect = innerText[2];
			let val = innerText[3];
			
			row = { 
				cond_Val_1: cond_Val_1,
				cond_Val_2: cond_Val_2,
				opSelect: opSelect,
				val: val,
				joinSelect: false,
			}
		
		} else if (clickedCriteria[x].className == "joinRow") {
			row = {
				joinSelect: clickedCriteria[x].innerText
			}
		}
		messageSearchEvent.criterionRows.push(row);
	}
		
	// TODO: Add more criterion types as needed. This is a good start.
	document.dispatchEvent(messageSearchEvent);
}

function getClickedCriteria(element) {
	let array = [];
	element.style.background = clickColour;
	let array2 = searchBack(element, array);
	let array3 = searchForward(element.nextElementSibling, array2);
	return array3
}

/// returns the top element eligible for this click logic
function getTopElement(element) {
	let topElement;
	if (element.parentElement.tagName == "TBODY") {
		// End!
		topElement = element;
	} else {
		// Check again
		//console.log(element);
		topElement = getTopElement(element.parentElement);
		 
	}
	return topElement
}

/// returns all elements before provided element that are part of this criterion
function searchBack(element, array) {
	//console.log("element id includes criterion? ", element.id.includes("criterion_"), element);
	if ((element) && (element.id.includes("criterion_"))) {
		/// Skip
		element.style.background = clickColour;
		array.unshift(element);
	} else {
		element.style.background = clickColour;
		array.unshift(element);
		if (element.previousElementSibling) {
			searchBack(element.previousElementSibling, array);
		}
	}
	return array
}

/// returns all elements after provided element that are part of this criterion
function searchForward(element, array) {
	if (element) {
		if (((element) && (element.id.includes("criterion_")))) {
		/// Skip
		} else {
			element.style.background = clickColour;
			array.push(element);
			if (element.nextElementSibling) {
				searchForward(element.nextElementSibling, array);
			}
		}
	}
	return array
}

