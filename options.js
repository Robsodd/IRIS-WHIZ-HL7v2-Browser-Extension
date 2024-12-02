let instances = []
let settings = []
console.log(instances.length)
//console.log(instances);
let currentInstanceSelected;
loadReadMe();
let exportWhiz = {};
exportWhiz.settings = {};
let instanceTable;
let namespaceTable;

exportWhiz.settings.AutoTab = false;
exportWhiz.settings.AutoTabNameSpace = false;
exportWhiz.settings.CSS = false;
exportWhiz.settings.SortOrder = false;
exportWhiz.settings.TimeFormat = false;
exportWhiz.settings.TextCompareOn = false;
exportWhiz.settings.HomepageReports = false;
exportWhiz.settings.LastUpdated = false;
exportWhiz.settings.BookmarkFolderName = false; 
exportWhiz.settings.ButtonsShow = false;
exportWhiz.settings.SaveAnalysis = false;
exportWhiz.settings.ChatGPTKey = "";
exportWhiz.settings.CustomColours = [];

let colourChangeEvent; // The custom event that will be created
colourChangeEvent = document.createEvent("HTMLEvents");
colourChangeEvent.initEvent("colourChange", true, true);
colourChangeEvent.eventName = "colourChange";

const namespaceNameTitle = "How you would like your namespace to appear in Tab groups.";
const namespaceURLTitle = "The namespace slug as appears in the URL and without slashes. E.g. /csp/";
const namespaceColourTitle = "Specify a colour to use a colour that's different to the Instance.";
const namespaceDeleteTitle = "Delete this namespace from your instances object.";


const instanceNameTitle = "How you would like your instance to appear in Tab groups.";
const instanceUrlTitle = "DNS for your instance. Do not add http(s):// or trailing slashes.";
const instanceNamespacesTitle = "Click this field to expand, edit and add namespaces for the instance.";
const instanceColourTitle = "Choose a colour for your tab group.";
const instanceDeleteTitle = "Deletes this instance.";

let defaultColours = ["grey", "blue","red","yellow","green","pink","purple","cyan","orange"]
let customColours = [];

// Export
chrome.storage.local.get({
			settings: [],
			instances: [],
			}, function(stored) {
	if (Object.keys(stored).length === 0) {
		instances = [];
	} else {
		instances = stored.instances;
		settings = stored.settings;
		//document.getElementById('export').value = JSON.stringify(instances, null, 1);
		exportString = JSON.stringify(stored, null, 1);
		//console.log("exportWhiz", exportString);
		if (settings.CustomColours != undefined) {
			customColours = settings.CustomColours;
		}
		document.getElementById('export').value = JSON.stringify(exportString, null, 1);
	}
	createInstanceTable();
	createCustomColoursTable();
	/*
	//console.log("instances after!", instances);
	chrome.storage.local.get(['settings'], function(stored) {
		let settings = stored.settings;
		exportWhiz.settings = JSON.stringify(settings, null, 1);
		document.getElementById('export').value = JSON.stringify(exportWhiz, null, 1);
	
	});
	*/
});


chrome.storage.onChanged.addListener(function(changes, areaName) {
	updateImportText();
});

//var refresh = document.getElementById('refreshInstances');
//refresh.onclick = refreshInstances();


function refreshInstances() {
	chrome.storage.local.get({
			settings: [],
			instances: [],
			}, function(stored) {
		if (Object.keys(stored).length === 0) {
			instances = [];
		} else {
			instances = stored.instances;
			//console.log("I SHOULD NOT SEE THIS");
			stored.settings.ChatGPTKey = replaceLetters(stored.settings.ChatGPTKey);
			document.getElementById('export').value = JSON.stringify(stored, null, 1);
		}
		// Remove Instances from dropdown
		//removeInstances();
		// Add back to dropdown
		//getInstances();
		// Remove namespaces from dropdown
		//removeNamespaces();
	});

}

/// Get instance number so you don't have to iterate through every time
function getInstanceNumber(instanceName) {
	let instancesLength = instances.length;
	for (var i = 0; i < instancesLength; i ++ ){
		if (instanceName == instances[i].name) {
			return i;
		}
	}
}


/// Get namespace number so you don't have to iterate through every time
function getNamespaceNumber(instanceNumber, namespaceName) {
	let namespacesLength = instances[instanceNumber].namespaces.length;
	for (var i = 0; i < namespacesLength; i ++ ) {
		if (namespaceName == instances[instanceNumber].namespaces[i].name) {
			return i;
		}
	}
}

/// Saves the on-page text instance object 
function importInstances() {
	let text = document.getElementById('export').value
	let object = JSON.parse(text)
	
	if (object.settings == undefined) {
		chrome.storage.local.set({
			instances: object,
			settings: [],
		}, function() {
			//console.log('Instances is set to:',  object);
			successAlert("Instances Imported");
			refreshInstances();
			
		});
	} else {
		chrome.storage.local.set({
		instances: object.instances,
		settings: object.settings,
		}, function() {
			//console.log('Instances is set to:',  object);
			successAlert("Instances and Settings Imported");
			refreshInstances();
			
		});
		
	}
	delay(2000).then(() => {
		location.reload();
	});
	

}


function updateImportText() {
	chrome.storage.local.get({
		settings: [],
		instances: [],
		}, function(stored) {
			stored.settings.ChatGPTKey = replaceLetters(stored.settings.ChatGPTKey);
			exportString = JSON.stringify(stored, null, 1);
			document.getElementById('export').value = exportString;
		}
	);
}



/// Saves settings to local storage
function saveSettings() {
		// var Bookmarks = document.getElementById('Bookmarks').checked;
		exportWhiz.settings.AutoTab = document.getElementById('AutoTab').checked;
		exportWhiz.settings.AutoTabNameSpace = document.getElementById('AutoTabNameSpace').checked;
		exportWhiz.settings.CSS = document.getElementById('CSS').checked;
		exportWhiz.settings.SortOrder = document.getElementById('MVSortOrder').checked;
		exportWhiz.settings.TimeFormat = document.getElementById('MVTimeFormat').checked;
		exportWhiz.settings.TextCompareOn = document.getElementById('TextCompareOn').checked;
		exportWhiz.settings.HomepageReports = document.getElementById('HomepageReports').checked;
		exportWhiz.settings.LastUpdated = new Date().toLocaleString();
		exportWhiz.settings.BookmarkFolderName = document.getElementById('BookmarkFolderName').value; 
		exportWhiz.settings.ButtonsShow = document.getElementById('ButtonsShow').checked;
		exportWhiz.settings.SaveAnalysis = document.getElementById('SaveAnalysis').checked;;
		if (document.getElementById('ChatGPTKey').value.includes("****")) {
			// Don't overwrite
			exportWhiz.settings.ChatGPTKey = settings.ChatGPTKey
		} else {
			exportWhiz.settings.ChatGPTKey = document.getElementById('ChatGPTKey').value; 
		}
		
		exportWhiz.settings.CustomColours = settings.CustomColours;

		chrome.storage.local.set({
			settings: exportWhiz.settings,
		}, function() {
			// Update status to let user know options were saved.
			successAlert("Settings Saved");
			//updateImportText();
		});
}

function replaceLetters(text) {
	if ((text == "") || (text == undefined))
	{
		return ""
	}
	const length = text.length;
	const lastFour = text.slice(-4);
  
	// Create a new string with leading "*" characters and append the last four
	const modifiedText = "*".repeat(length - 4) + lastFour;
  
	return modifiedText;
  }

function successAlert(displayText) {
	var status = document.getElementById('status');
			status.textContent = displayText;
			status.style.background = "green"
			status.style.display = "block"
			setTimeout(function() {
			status.textContent = '';
			status.style.display = "none"
			}, 2000);
}


function errorAlert(displayText) {
	var status = document.getElementById('status');
			status.textContent = displayText;
			status.style.background = "red"
			status.style.display = "block"
			setTimeout(function() {
			status.textContent = '';
			status.style.display = "none"
			}, 3000);
}

/// Restores select box and checkbox state from local storage
function restoreOptions() {
	  // Use default value color = 'red' and likesColor = true.
		chrome.storage.local.get({
			settings: {},
		}, function(items) {
			//console.log("retreiving settings:", items.settings)
			if (items.settings.AutoTab === undefined) {
				//console.log("can't retrieve!")
				return
			} else {
				// document.getElementById('Bookmarks').checked = items.Bookmarks;
				document.getElementById('AutoTab').checked = items.settings.AutoTab;
				document.getElementById('AutoTabNameSpace').checked = items.settings.AutoTabNameSpace;
				document.getElementById('CSS').checked = items.settings.CSS;
				document.getElementById('MVSortOrder').checked = items.settings.SortOrder;
				document.getElementById('MVTimeFormat').checked = items.settings.TimeFormat;
				document.getElementById('TextCompareOn').checked = items.settings.TextCompareOn;
				document.getElementById('HomepageReports').checked = items.settings.HomepageReports;
				document.getElementById('BookmarkFolderName').value = items.settings.BookmarkFolderName;
				document.getElementById('ButtonsShow').checked = items.settings.ButtonsShow;
				document.getElementById('SaveAnalysis').checked = items.settings.SaveAnalysis;
				document.getElementById('ChatGPTKey').value = replaceLetters(items.settings.ChatGPTKey);
			}
			
			// document.getElementById('ContextMenu').checked = items.ContextMenu;
	  });
}


function loadReadMe() {
	let readMeText = chrome.runtime.getURL("README.txt");
	let readMeDiv = document.getElementById("readme");
	
	fetch(readMeText).then(readMe => readMe.text())
	.then(body => {readMeDiv.innerText = body})
	

	 //.replace(/\s\s\s/g, "\n");
}


/// Perform a delay in miliseconds
function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

// EVENT LISTENERS

document.addEventListener('DOMContentLoaded', restoreOptions);
//document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('import').addEventListener('click', importInstances);

document.getElementById('AutoTab').addEventListener('change', saveSettings);
document.getElementById('AutoTabNameSpace').addEventListener('change', saveSettings);
document.getElementById('CSS').addEventListener('change', saveSettings);
document.getElementById('MVSortOrder').addEventListener('change', saveSettings);
document.getElementById('MVTimeFormat').addEventListener('change', saveSettings);
document.getElementById('TextCompareOn').addEventListener('change', saveSettings);
document.getElementById('HomepageReports').addEventListener('change', saveSettings);
document.getElementById('BookmarkFolderName').addEventListener('change', saveSettings);
document.getElementById('ButtonsShow').addEventListener('change', saveSettings);
document.getElementById('SaveAnalysis').addEventListener('change', saveSettings);
document.getElementById('ChatGPTKey').addEventListener('change', saveSettings);



window.addEventListener("load", function() { 
	instances = []
	refreshInstances();
})


// Instance Editor 

let instanceTableArray = [];


function createInstanceTable() {
	
	let instanceTableDiv = document.getElementById("instanceTableDiv");
	
	instanceTable = document.createElement("table");
	
	instanceTableDiv.appendChild(instanceTable);
	let caption = document.createElement("caption");
	caption.innerText = "Instances";
	instanceTable.appendChild(caption);

	
	let instanceTableHeaders = instanceTable.insertRow(0)
	
	createInstanceTableHeaders(instanceTableHeaders);
	
	// for (let x = 0; x < Object.keys(instances[0]).length; x++) {
		// let headerCell = instanceTableHeaders.insertCell(x)
		// headerCell.textContent = Object.keys(instances[0])[x].toUpperCase();
	// }
	
	
	for (let i = 0; i < instances.length; i++) {
		createInstanceRow(instances[i]);
	}
	
	createInstanceRow();
	
	
}
/*
document.getElementById("addInstance").addEventListener("click", ()=> {
	createInstanceRow()
})*/


function createInstanceRow(instance = undefined) {
	let instanceRow = instanceTable.insertRow();
	instanceRow.instanceReference = instance;
	
	let instanceRowName = instanceRow.insertCell();
	let instanceRowUrl = instanceRow.insertCell();
	let instanceRowNamespaces = instanceRow.insertCell();
	let instanceRowColour = instanceRow.insertCell();
	let instanceDelete = instanceRow.insertCell();

	instanceRowName.title = instanceNameTitle;
	instanceRowUrl.title = instanceUrlTitle;
	instanceRowNamespaces.title = instanceNamespacesTitle;
	instanceRowColour.title = instanceColourTitle;
	instanceDelete.title = instanceDeleteTitle;	
	
	instanceRowName.onclick = function () { beginEdit(this); };
	instanceRowUrl.onclick = function () { beginEdit(this); };
	instanceRowColour.onclick = function () { beginEditColour(this); };
	instanceDelete.onclick = function () { deleteInstance(this); };
	
	instanceRowName.key = "name";
	instanceRowUrl.key = "url";
	instanceRowNamespaces.key = "namespaces";
	instanceRowColour.key = "colour";

	instanceRowNamespaces.style.textAlign = "center";
	let selector
	//New Namespace Row
	if (instance == undefined) {
		instanceRowName.textContent = "";
		instanceRowUrl.textContent = "";
		instanceRowNamespaces.textContent = "fetching";
		selector = createColourSelector("instance");
		instanceRowColour.insertBefore(selector, instanceRowColour.firstChild);
		selector.onchange = function () { endEdit(this); };
		
		instanceRowUrl.style.display = "none";
		instanceRowNamespaces.style.display = "none";
		instanceRowColour.style.display = "none";
		instanceDelete.style.display = "none";
		instanceRowName.classList.add("newInstanceField");
		
	} else {
		
		instanceRowName.textContent = instance.name;
		instanceRowUrl.textContent = instance.url;
		instanceRowNamespaces.textContent = "fetching";
		instanceRow.classList.add(instance.url);
		selector = createColourSelector("instance");
		instanceRowColour.insertBefore(selector, instanceRowColour.firstChild);
		selector.onchange = function () { endEdit(this); };
		
		if ((instance.colour == undefined) || (instance.colour == "")) {
			console.log("Inherit colour option");
			for (let y = 0; y < selector.options.length; y ++) {
				if (selector.options[y].value == "grey") {
					selector.options[y].selected = true;
				}
			}
		} else {
			for (let y = 0; y < selector.options.length; y ++) {
				if (selector.options[y].value == instance.colour) {
					selector.options[y].selected = true;
				}
			}
		}
		
	}

	document.addEventListener("colourChange", function() {
		let newSelector = createColourSelector("instance")
		selector.replaceWith(newSelector);
		colourSelectorOption(newSelector);
		newSelector.onchange = function () { endEdit(this); };
	});
	instanceDelete.textContent = "DELETE";
	instanceDelete.classList.add("instanceDelete");


	if ((instance == undefined) || (instance.namespaces.length == 0)) {
		instanceRowNamespaces.textContent = "0 [+]";
	} else {
		instanceRowNamespaces.textContent = String(instance.namespaces.length) + " [+]";
	}
		
	instanceRowNamespaces.style.cursor = "pointer";
	
	instanceRowNamespaces.addEventListener('click', function(e) { 
		//console.log("clicked - instance reference", instanceRow.instanceReference);
		instance = instanceRow.instanceReference;
		
		let display
		if ((instanceRowNamespaces.clicked == undefined) || (instanceRowNamespaces.clicked == false) ) {
			// Check if there are no namespaces and just create header
			/*
			if (instance.namespaces.length == 0) {
				createNamespaceTable(instance, instanceRow, instanceRow.rowIndex);
			}*/
			instanceRowNamespaces.classList.add("selected");
			display = "";
			instanceRowNamespaces.clicked = true;
			let length = instanceRow.instanceReference.namespaces.length;
			instanceRowNamespaces.textContent = String(length) + " [-]";

			// CREATE floating Instance table
			createNamespaceTable(instance, instanceRowNamespaces);
			
		} else {
			instanceRowNamespaces.classList.remove("selected");
			instanceRowNamespaces.clicked = false;
			instanceRowNamespaces.textContent = String(instanceRow.instanceReference.namespaces.length) + " [+]";;
		} 
	})		
}

function deleteInstance(deleteCell) {
	if (confirm("Delete instance?")) {
		let instance = deleteCell.parentElement.instanceReference
		//console.log("DELETE instance", instance);
		for (let i = 0; i < instances.length; i++) {
			if (instances[i].name == instance.name) {
				instances.splice(i, 1);
				autoSaveInstances();
			}
		}
		
		deleteCell.parentElement.parentElement.removeChild(deleteCell.parentElement);
	} 
	
};


function createInstanceTableHeaders(instanceTableHeaders) {
	
	let instanceHeaderName = instanceTableHeaders.insertCell();
	let instanceHeaderUrl = instanceTableHeaders.insertCell();
	let instanceHeaderNamespaces = instanceTableHeaders.insertCell();
	let instanceHeaderColour = instanceTableHeaders.insertCell();
	let instanceDelete = instanceTableHeaders.insertCell();
	
	instanceHeaderName.textContent = "Instance Name";
	instanceHeaderUrl.textContent = "URL";
	instanceHeaderNamespaces.textContent = "Namespaces";
	instanceHeaderColour.textContent = "Colour";
	instanceDelete.textContent = "DELETE";

	instanceHeaderName.title = instanceNameTitle;
	instanceHeaderUrl.title = instanceUrlTitle;
	instanceHeaderNamespaces.title = instanceNamespacesTitle;
	instanceHeaderColour.title = instanceColourTitle;
	instanceDelete.title = instanceDeleteTitle;
	
	instanceTableHeaders.classList.add("instanceHeaders");	
}

function closeButtonDelete(Document, messageBtnBar) {
	
	let closeBtnDelete = Document.createElement('btn');
	closeBtnDelete.classList.add("whizButton");
	closeBtnDelete.classList.add("closeBtnDelete");
	

	closeBtnDelete.title = "Close";
	closeBtnDelete.innerText = "x";

	//messageBtnBar.appendChild(closeBtnDelete);
	let li = Document.createElement('li');
	li.append(closeBtnDelete);
	messageBtnBar.appendChild(li);
	
	return closeBtnDelete
}

// Button bar for individual messages
function messageButtonBar(Document, messageId) {
	let messageBtnBar = Document.createElement('ul');
	messageBtnBar.classList.add("messageBtnBar");
	messageBtnBar.id = "buttonBar" + String(messageId);
	return messageBtnBar
}

// This iterates through an instance's namespaces and adds a row for each
function createNamespaceTable(instance, instanceRowNamespaces) {
	let namespaceContainer = document.createElement("div");

	let messageBtnBar = messageButtonBar(document, "0000");

	let closeBtn = closeButtonDelete(document, messageBtnBar);
	closeBtn.style.right = "0px";
	closeBtn.style.top = "5px";
	let tableContainer = document.createElement("div");

	tableContainer.appendChild(messageBtnBar);

	tableContainer.classList.add("tableContainer");
	namespaceContainer.classList.add("namespaceContainer");
	document.body.appendChild(namespaceContainer);
	namespaceContainer.appendChild(tableContainer);
	document.body.style.overflow = "hidden";

	closeBtn.addEventListener('click', () => {
		document.body.style.overflow = "auto";
		namespaceContainer.parentElement.removeChild(namespaceContainer);
		instanceRowNamespaces.classList.remove("selected");
		instanceRowNamespaces.clicked = false;
		instanceRowNamespaces.textContent = String(instanceRowNamespaces.parentElement.instanceReference.namespaces.length) + " [+]";

		messageBtnBar.parentNode.parentNode.parentNode.removeChild(messageBtnBar.parentNode.parentNode);

	})
	/*namespaceContainer.addEventListener("click", (e) => {
		if (e.target == namespaceContainer) {
			document.body.style.overflow = "auto";
			namespaceContainer.parentElement.removeChild(namespaceContainer);
			instanceRowNamespaces.classList.remove("selected");
			instanceRowNamespaces.clicked = false;
			instanceRowNamespaces.textContent = String(instanceRowNamespaces.parentElement.instanceReference.namespaces.length) + " [+]";
		}
	})*/

	namespaceTable = document.createElement("table");
	tableContainer.appendChild(namespaceTable)
	let caption = document.createElement("caption");
	caption.innerText = instance.name + " Namespaces";
	namespaceTable.appendChild(caption);


	let namespaceTableHeaders = namespaceTable.insertRow();
	namespaceTableHeaders.classList.add("tableHeader");

	namespaceTableHeaders.classList.add(instance.url);
	
	let namespaceHeaderName = namespaceTableHeaders.insertCell();
	let namespaceHeaderURL = namespaceTableHeaders.insertCell();
	let namespaceHeaderColour = namespaceTableHeaders.insertCell();
	let namespaceHeaderDelete = namespaceTableHeaders.insertCell();
	
	namespaceHeaderName.textContent = "Namespace Name";
	namespaceHeaderURL.textContent = "Namespace URL slug";
	namespaceHeaderColour.textContent = "Colour";
	namespaceHeaderDelete.textContent = "DELETE";

	namespaceHeaderName.title = namespaceNameTitle;
	namespaceHeaderURL.title = namespaceURLTitle;
	namespaceHeaderColour.title = namespaceColourTitle;
	namespaceHeaderDelete.title = namespaceDeleteTitle;
	
	namespaceHeaderColour.classList.add("namespaceHeaders");
	namespaceHeaderDelete.classList.add("namespaceHeaders");
	
	namespaceHeaderName.classList.add("namespaceHeaders");
	namespaceHeaderURL.classList.add("namespaceHeaders");
	namespaceTableHeaders.instanceReference = instance;
	// The BLANK row at the bottom
	
	
	//console.log("newNamespaceRow", newNamespaceRow);
	if ((instance.namespaces == undefined) || (instance.namespaces.length == 0)) {
		let newNamespaceRow = createNewNamespaceRow(namespaceTable, instance);
		return
	} 
	// Add namespaces to table
	for (let i = 0; i < instance.namespaces.length; i++) {
		let namespaceRow

		namespaceRow = namespaceTable.insertRow();

		namespaceRow.parentRow = instance.url;
		namespaceRow.classList.add(instance.url);
		//namespaceRow.style.display = "inherit";
		let namespaceRowName = namespaceRow.insertCell();
		let namespaceRowURL = namespaceRow.insertCell();
		let namespaceRowColour = namespaceRow.insertCell();
		let namespaceRowDelete = namespaceRow.insertCell();

		namespaceRowName.title = namespaceNameTitle;
		namespaceRowURL.title = namespaceURLTitle;
		namespaceRowColour.title = namespaceColourTitle;
		namespaceRowDelete.title = namespaceDeleteTitle;
		
		namespaceRow.instanceReference = instance;
		//console.log("namespaceRow.instanceReference", namespaceRow.instanceReference)
		namespaceRow.namespaceReference = instance.namespaces[i];
		namespaceRowDelete.namespaceReference = instance.namespaces[i];
		namespaceRowDelete.instanceReference = instance;
		
		namespaceRowName.key = "namespaceName";
		namespaceRowURL.key = "namespaceNamespace";
		namespaceRowColour.key = "namespaceColour";
		namespaceRowDelete.classList.add("namespaceDelete");
				
		
		
		namespaceRowName.textContent = instance.namespaces[i].name;
		namespaceRowURL.textContent = instance.namespaces[i].namespace;
		
		let selector = createColourSelector("namespace");
		namespaceRowColour.insertBefore(selector, namespaceRowColour.firstChild);
				

		//
		if ((instance.namespaces[i].colour == undefined) || (instance.namespaces[i].colour == "") || (instance.namespaces[i].colour == "Inherit")) {
			console.log("Inherit colour option");
			for (let y = 0; y < selector.options.length; y ++) {
				if (selector.options[y].value == "Inherit") {
					selector.options[y].selected = true;
				}
			}
			//selector.selectedOptions = inheritColourOption;
			//namespaceRowColour.textContent = "Inherit";
		} else {
			for (let y = 0; y < selector.options.length; y ++) {
				if (selector.options[y].value == instance.namespaces[i].colour) {
					selector.options[y].selected = true;
				}
			}
			//namespaceRowColour.textContent = instance.namespaces[i].colour;
		}
		selector.onchange = function () { endEdit(this); };
		namespaceRowDelete.textContent = "DELETE";
		
		namespaceRowName.onclick = function () { beginEdit(this); };
		namespaceRowURL.onclick = function () { beginEdit(this); };
		namespaceRowColour.onclick = function () { beginEditColour(this); };
		namespaceRowDelete.onclick = function () { deleteNamespace(this); };
		document.addEventListener("colourChange", function() {
			let newSelector = createColourSelector("namespace")
			selector.replaceWith(newSelector);
			colourSelectorOption(newSelector);
			newSelector.onchange = function () { endEdit(this); };
		});
		
	}
	let newNamespaceRow = createNewNamespaceRow(namespaceTable, instance);
}


function colourSelectorOption(selector) {
	console.log("colourSelectorOption ", selector);
	let colour
	if ((selector.parentElement != undefined) && (selector.parentElement.parentElement.instanceReference != undefined)) {
		colour = selector.parentElement.parentElement.instanceReference.colour
	}
	console.log("colour picked ", colour);
	/*if (selector.parentElement.parentElement.namespaceReference != undefined) {
		if ((selector.parentElement.parentElement.namespaceReference.colour != undefined) && (selector.parentElement.parentElement.namespaceReference.colour != "")) {
			colour = selector.parentElement.parentElement.namespaceReference.colour
		} else {
			colour = "Inherit"
		}
		
	} else if (selector.parentElement.parentElement.instanceReference) {
		colour = selector.parentElement.parentElement.instanceReference.colour
	}*/

	for (let y = 0; y < selector.options.length; y ++) {
		if (selector.options[y].value == colour) {
			selector.options[y].selected = true;
			return
		}
	}

}

function createColourSelector(type = "instance") {
	
	let selector;
	selector = document.createElement('select');
	selector.style.border = "0px";
	selector.style.fontFamily = "inherit";
	selector.style.fontSize = "inherit";
	selector.style.textAlign = "inherit";
	selector.style.backgroundColor = "LightGoldenRodYellow";
	if (type == "namespace") {
		var inheritColourOption = document.createElement('option');
		let colourOptionText = document.createTextNode("Inherit");
		inheritColourOption.appendChild(colourOptionText);
		selector.appendChild(inheritColourOption);
	} else {
		defaultColours.forEach(function(colour) {
			var colourOption = document.createElement('option');
			let colourOptionText = document.createTextNode(colour);
			colourOption.appendChild(colourOptionText);
			selector.appendChild(colourOption);
		});
	}
	
	customColours.forEach(function(colour) {

		if (defaultColours.includes(colour.name)) {
			return
		}
		var colourOption = document.createElement('option');
		let colourOptionText = document.createTextNode(colour.name);
		colourOption.appendChild(colourOptionText);
		selector.appendChild(colourOption);
	});
	
	return selector
}


function deleteNamespace(deleteCell) {
	//console.log("deleteCell.namespaceReference", deleteCell.namespaceReference);
	//console.log("deleteCell.parentElement.namespaceReference", deleteCell.parentElement.namespaceReference);
	if (confirm("Delete namespace?")) {
		let instance = deleteCell.parentElement.instanceReference
		//console.log("DELETE namespace", instance);
		for (let i = 0; i < instances.length; i++) {
			if (instances[i].name == instance.name) {
				for (let y = 0; y < instances[i].namespaces.length; y++) {
					if ((instances[i].namespaces[y].name == deleteCell.namespaceReference.name) && (instances[i].namespaces[y].namespace == deleteCell.namespaceReference.namespace)) {
						instances[i].namespaces.splice(y, 1);
						updateReferenceInstances(instances[i]);
						autoSaveInstances();
					}
				}
				
			}
		}
		
		deleteCell.parentElement.parentElement.removeChild(deleteCell.parentElement);
	}
	
}

// This is the empty row at the bottom of a set of namespaces
function createNewNamespaceRow(namespaceTable, instance, instanceRow, index = 0) {
	let newNamespaceRow;
	if (index == 0) {
		newNamespaceRow = namespaceTable.insertRow();
		//console.log("newNamespaceRow.index", newNamespaceRow)
	} else {
		newNamespaceRow = namespaceTable.insertRow();
	}

	//console.log("PARENT ROW", newNamespaceRow.parentRow);
	newNamespaceRow.classList.add(instance.url);
	newNamespaceRow.style.display = "";

	let newName = newNamespaceRow.insertCell();
	let newNamespace = newNamespaceRow.insertCell();
	let newColour = newNamespaceRow.insertCell();
	let newDelete = newNamespaceRow.insertCell();
	
	// enables lookup of parent row
	newName.parentRow = instanceRow;
	
	newNamespace.style.display = "none";
	newColour.style.display = "none";
	newDelete.style.display = "none";
	//newName.newNamespace = newNamespace;
	newName.classList.add("newNamespace");
	newNamespace.classList.add("newNamespace");
	newDelete.classList.add("namespaceDelete");
	newName.classList.add("newNamespaceField");

	
	newName.key = "namespaceName";
	newNamespace.key = "namespaceNamespace";
	newColour.key = "namespaceColour";
	newDelete.key = "namespaceDelete";
	
	newName.textContent = "";
	newNamespace.textContent = "";
	newDelete.textContent = "DELETE";
	
	
	let selector = createColourSelector("namespace");
	newColour.insertBefore(selector, newColour.firstChild);
	selector.onchange = function () { endEdit(this); };
	document.addEventListener("colourChange", function() {
		let newSelector = createColourSelector("namespace")
		selector.replaceWith(newSelector);
		colourSelectorOption(newSelector);
		newSelector.onchange = function () { endEdit(this); };
	});
	
	newNamespaceRow.instanceReference = instance;
	
	newName.onclick = function () { beginEdit(this); };
	newNamespace.onclick = function () { beginEdit(this); };
	newColour.onclick = function () { beginEditColour(this); };
	newDelete.onclick = function () { deleteNamespace(this); };
	
	return newNamespaceRow
}

var oldColor, oldText, padTop, padBottom = "";

function beginEditColour(td) {
	if (td.firstChild && td.firstChild.tagName == "INPUT")
		return;
	
	oldText = td.innerHTML.trim();
	oldColor = td.style.backgroundColor;
	padTop = td.style.paddingTop;
	padBottom = td.style.paddingBottom;
	
}


function beginEdit(td) {

	if (td.firstChild && td.firstChild.tagName == "INPUT")
		return;
	td.classList.remove("newInstanceField");
	td.classList.remove("newNamespaceField");
	oldText = td.innerHTML.trim();
	oldColor = td.style.backgroundColor;
	//padTop = td.style.paddingTop;
	//padBottom = td.style.paddingBottom;
	let input

	input = document.createElement("input");
	input.value = oldText;
	input.style.border = "0px";
	input.style.fontFamily = "inherit";
	input.style.fontSize = "inherit";
	input.style.textAlign = "inherit";
	input.style.backgroundColor = "LightGoldenRodYellow";

	td.innerHTML = "";
	//td.style.paddingTop = "0px";
	//td.style.paddingBottom = "0px";
	td.style.backgroundColor = "LightGoldenRodYellow";
	td.insertBefore(input, td.firstChild);
	if (input.localName == "select") {
		////input.select();
		input.onchange = function () { endEdit(this); };
	} else {
		input.onblur = function () { endEdit(this); };
		//input.addEventListener("keypress", function(event) {
		//	if ((event.key === "Enter") || (event.key === "Tab")) {
		//		endEdit(this);
		//	}
		//});
		input.select();
		
	}
	
	//console.log("BEFORE td.parentElement.instanceReference", td.parentElement.instanceReference);
}

function endEdit(input) {
	var td = input.parentNode;
	if (td.key == "namespaceNamespace") {
		let namespaceURL = namespaceURLValidation(td, input.value);
		if (namespaceURL == "") {
			td.style.color = "red";
			return
		}
		input.value = namespaceURL;
		
	} else if (td.key == "url") {
		let instanceUrl = instanceURLValidation(td, input.value);
		if (instanceUrl == "") {
			td.style.color = "red";
			return
		}
		input.value = instanceUrl;
	}
	
	if (input.localName == "select") {
		// Skip
	} else {
		td.removeChild(td.firstChild);	//remove input
		td.innerHTML = input.value;
		if (oldText != input.value.trim() ) {
			td.style.color = "green";
			delay(2000).then(() => {
				//console.log("ValidateNamespaceSlug");
				td.style.color = "";
			});
		} else {
			return
		}

		//td.style.paddingTop = padTop;
		//td.style.paddingBottom = padBottom;
		td.style.backgroundColor = oldColor;
	}
	
	// UPDATE OUR INSTANCES OBJECT
	if (td.parentElement.instanceReference != undefined) {
		
		// Iterate through instances
		for (let i = 0; i < instances.length; i++) {
			
			// Check if instance already exists
			if (instances[i].name == td.parentElement.instanceReference.name) {				
				
				// Instance exists, check if namespace edit or instanc edit
				//console.log("matching instance = ", instances[i], td.key);
				if (td.key.includes("namespace")) {
					// Namespace changes
					for (let x = 0; x < instances[i].namespaces.length; x++) {
						//console.log("namespaces checked for match = ", instances[i].namespaces[x].name);
						if (td.key == "namespaceName") {
							if (oldText == instances[i].namespaces[x].name) {
								
								instances[i].namespaces[x].name = input.value;
								td.parentElement.namespaceReference = instances[i].namespaces[x];
								//console.log("update name", instances[i].namespaces[x].name);
								// Update the instance row's instanceReference.
								let rows = document.getElementById("instanceTableDiv").getElementsByClassName("tr")
								/*for (let i=0; row; rows[i]; i++) {
									if (row.instanceReference.url == td.instanceReference.url) {
										row.instanceReference == td.instanceReference;
									}
								}*/
								updateReferenceInstances(instances[i]);
								autoSaveInstances();
								return
							}
						} else if (td.key == "namespaceNamespace") {
							if (oldText == instances[i].namespaces[x].namespace) {
								
								instances[i].namespaces[x].namespace = input.value;
								td.parentElement.namespaceReference = instances[i].namespaces[x];
								updateReferenceInstances(instances[i]);
								autoSaveInstances();
								return
							}
						} else if (td.key == "namespaceColour") {
							if (td.previousSibling.textContent == instances[i].namespaces[x].namespace) {
								instances[i].namespaces[x].colour = input.value;
								td.parentElement.namespaceReference = instances[i].namespaces[x];
								updateReferenceInstances(instances[i]);
								autoSaveInstances();
								return
							}
						}
					}
					
					// new namespace
					//console.log("new namespace?");
					td.nextElementSibling.style.display = "";
					td.nextElementSibling.nextElementSibling.style.display = "";
					td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
					let newNamespace = {name: input.value, namespace: "", colour: ""};
					instances[i].namespaces.push(newNamespace);
					//console.log("new namespace", newNamespace);
					td.namespaceReference = newNamespace;
					td.parentElement.namespaceReference = newNamespace;
					td.parentElement.instanceReference = instances[i];
					//td.parentRow.instanceReference = instances[i];
					td.nextElementSibling.nextElementSibling.namespaceReference = newNamespace;
					td.nextElementSibling.nextElementSibling.nextElementSibling.namespaceReference = newNamespace;
					
					let instanceRow = td.parentElement.parentRow;
					let newNamespaceRow = createNewNamespaceRow(namespaceTable, instances[i], instanceRow, td.parentElement.rowIndex + 1);

					newNamespaceRow.style.display = "";
					//console.log("newNamespaceRow", newNamespaceRow);
					updateReferenceInstances(instances[i]);
					autoSaveInstances();
					return
					
				} else {
					// Instance Changes
					if (td.key == "name") {
						instances[i].name = input.value;
						td.parentElement.instanceReference = instances[i];
						updateReferenceInstances(instances[i]);
						autoSaveInstances();
						return
					} else if (td.key == "url") {
						instances[i].url = input.value;
						td.parentElement.instanceReference = instances[i];
						td.parentElement.classList.add(instances[i].url);
						updateReferenceInstances(instances[i], oldText);
						autoSaveInstances();
						return
					} else if (td.key == "colour") { 
						instances[i].colour = input.value;
						td.parentElement.instanceReference = instances[i];
						updateReferenceInstances(instances[i]);
						autoSaveInstances();
						return
					}
				}
			}
		}
		
		
		
	
	} else {
		// create NEW instance
		//console.log("pushing new instance", instances);
		if (instances[0] == undefined) {
			instances = [];
		}
		let newInstance = instances.push({name: input.value, url: "", namespaces: [], colour: "grey"});
		td.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
		//console.log("new instance", instances[newInstance-1], newInstance);
		td.parentElement.instanceReference = instances[newInstance-1];
		
		//console.log("td.parentElement.instanceReference", td.parentElement.instanceReference);
		createInstanceRow();
	}
	//console.log("AFTER td.instanceReference", td.parentElement.instanceReference);
}

function namespaceURLValidation(td, newNamespaceSlug) {
	
	let error = ""
	let instanceSelect = td.parentElement.instanceReference.name
	let namespaceSelect = td.parentElement.namespaceReference.name
	let newNamespaceName = td.previousSibling.textContent
	let instancesLength = instances.length;
	for (var i = 0; i < instancesLength; i ++ ){ 
		if (instances[i].name == instanceSelect) {
			let namespacesLength = instances[i].namespaces.length;
			for (var x = 0; x < namespacesLength; x++ ){

				if ((newNamespaceSlug == instances[i].namespaces[x].namespace) && (namespaceSelect != instances[i].namespaces[x].name))  {
					// If slug matches but namespace name does not match - error
						error = "Namespace slug '" + newNamespaceSlug + "' already in use for '" + instances[i].namespaces[x].name + "'.";
						errorAlert(error);
						return ""
				}
				
			}
		}
	}
	
	if (newNamespaceSlug.includes(" ")) {
		errorAlert("Namespace URL Slug cannot contain spaces")
		return ""
	}
	
	if (newNamespaceSlug.includes("/")) {
		newNamespaceSlug = newNamespaceSlug.replaceAll("/", "");
	}
	return newNamespaceSlug
}

function instanceURLValidation(td, instanceUrl) {

	let error = ""
	let instanceName = td.parentElement.instanceReference.name
	let newInstanceName = td.previousSibling.textContent
	//console.log("newInstanceURL", newInstanceURL);

	// Check URL isn't already used (trigger error)
	let instancesLength = instances.length;
	for (var i = 0; i < instancesLength; i ++ ){ 
		if (instances[i].url == instanceUrl) {
			//console.log("instances[i].url", instances[i].url);
			// Is this a new instance?
			if (instanceName != instances[i].name) {
				error = "Instance domain '" + instanceUrl + "' already in use by " + instances[i].name;
				errorAlert(error);
				return ""
			} 
		}
	}
	
	if (instanceUrl.includes(" ")) {
		errorAlert("Instance domain cannot contain spaces")
		return ""
	}
	
	if (instanceUrl.includes("/")) {
		instanceUrl = instanceUrl.replaceAll("/", "");
	}
	
	if (instanceUrl.includes("http:")) {
		instanceUrl = instanceUrl.replaceAll("http:", "");
	}
	
	if (instanceUrl.includes("https:")) {
		instanceUrl = instanceUrl.replaceAll("https:", "");
	}
	
	return instanceUrl

}


// Instance referenced by ROW
function updateReferenceInstances(instance, oldUrl = "") {
	console.log("OLD URL: ", oldUrl);
	console.log("NEW URL: ", instance.url);
	let rows
	if (oldUrl == "") {
		rows = document.getElementsByClassName(instance.url);
		oldUrl = instance.url;
	} else {
		rows = document.getElementsByClassName(oldUrl);
	}
	let rowsArray = Array.from(rows);
	const rowsArrayLength = rowsArray.length - 1
	console.log("Matching Rows for reference update: ", rowsArray);
	//for (let i = rowsArrayLength; i + 1 > 0; i --) {
	for (let i = 0; i < rowsArrayLength; i ++) {
		//rowsCopyLength ++
		//console.log("matching Rows", rows);
		//console.log("Matching Row for reference update: ", rowsArray[i]);
		rowsArray[i].instanceReference = instance;
		console.log("updateRow reference", rows[i]);
		if (instance.url == oldUrl) {
			return
		}
		rowsArray[i].classList.remove(oldUrl);
		rowsArray[i].classList.add(instance.url);
		
		
		
	}	
}

function autoSaveInstances() {
	chrome.storage.local.set({instances: instances}, function() {
		console.log('Instances is set to:',  instances);
		successAlert("Instances Saved");
		//updateImportText();
	});
}

let colourTable;

function createCustomColoursTable() {
	let colourTableDiv = document.getElementById("colourTableDiv");
	
	colourTable = document.createElement("table");
	
	colourTableDiv.appendChild(colourTable);
	
	let colourTableHeaders = colourTable.insertRow(0)
	
	createColourTableHeaders(colourTableHeaders);
	console.log("Settigns", settings);
	if (settings.CustomColours != undefined) {
		for (let i = 0; i < settings.CustomColours.length; i++) {
			createCustomColourRow(settings.CustomColours[i]);
		}
	}
	
	createCustomColourRow();
}

function createCustomColourRow(colour = "") {
	let colourRow = colourTable.insertRow();
	colourRow.colourReference = colour;
	
	let colourName = colourRow.insertCell();
	let colourMainColour = colourRow.insertCell();
	let colourMainColourBackground = colourRow.insertCell();
	let colourHighlightColour = colourRow.insertCell();
	let colourLinkColour = colourRow.insertCell();
	let colourDelete = colourRow.insertCell();
	

	
	colourName.onclick = function () { beginEditCustomColour(this); };
	colourMainColour.onclick = function () { beginEditCustomColour(this); };
	colourMainColourBackground.onclick = function () { beginEditCustomColour(this); };
	colourHighlightColour.onclick = function () { beginEditCustomColour(this); };
	colourLinkColour.onclick = function () { beginEditCustomColour(this); };
	colourDelete.onclick = function () { deleteCustomColour(this); };
	
	colourName.key = "name" ;
	colourMainColour.key = "mainColour";
	colourMainColourBackground.key = "mainColourBackground";
	colourHighlightColour.key = "highlightColour";
	colourLinkColour.key = "linkColour";
	colourDelete.key = "DELETE";
		
	//New Namespace Row
	if (colour == "") {
		
		colourName.textContent = "" ;
		colourMainColour.textContent = "";
		colourMainColourBackground.textContent = "";
		colourHighlightColour.textContent = "";
		colourLinkColour.textContent = "";
		
		colourName.classList.add("newColourField");
		colourMainColour.style.display = "none";
		colourMainColourBackground.style.display = "none";
		colourHighlightColour.style.display = "none";
		colourLinkColour.style.display = "none";
		colourDelete.style.display = "none";
		
	} else {
		
		colourName.textContent = colour.name;
		colourMainColour.textContent = colour.mainColour
		colourMainColourBackground.textContent = colour.mainColourBackground;
		colourHighlightColour.textContent = colour.highlightColour;
		colourLinkColour.textContent = colour.linkColour;

	}
	colourDelete.textContent = "DELETE";
	colouriseColourRow(colourRow);
	colourDelete.classList.add("colourDelete");
	
}

function createColourTableHeaders(colourTableHeaders) {
	let colourHeaderName = colourTableHeaders.insertCell();
	let colourHeaderMainColour = colourTableHeaders.insertCell();
	let colourHeaderMainColourBackground = colourTableHeaders.insertCell();
	let colourHeaderHighlightColour = colourTableHeaders.insertCell();
	let colourHeaderLinkColour = colourTableHeaders.insertCell();
	let colourHeaderDelete = colourTableHeaders.insertCell();
	
	colourHeaderName.textContent = "Name";
	colourHeaderMainColour.textContent = "Primary Background Colour";
	colourHeaderMainColourBackground.textContent = "Fallback Background Colour";
	colourHeaderHighlightColour.textContent = "Text Colour";
	colourHeaderLinkColour.textContent = "Link Colour";
	colourHeaderDelete.textContent = "DELETE";
	
	colourTableHeaders.classList.add("colourHeaders");	
}

function beginEditCustomColour(td) {

	if (td.firstChild && td.firstChild.tagName == "INPUT")
		return;
	td.classList.remove("newColourField");

	oldText = td.innerHTML.trim();
	oldColor = td.style.backgroundColor;
	padTop = td.style.paddingTop;
	padBottom = td.style.paddingBottom;
	let input

	input = document.createElement("input");
	input.value = oldText;
	input.style.border = "0px";
	input.style.fontFamily = "inherit";
	input.style.fontSize = "inherit";
	input.style.textAlign = "inherit";
	input.style.backgroundColor = "LightGoldenRodYellow";
	

	td.innerHTML = "";
	td.style.paddingTop = "0px";
	td.style.paddingBottom = "0px";
	td.style.backgroundColor = "LightGoldenRodYellow";
	td.insertBefore(input, td.firstChild);
	
	input.onblur = function () { endEditCustomColour(this); };
	input.select();
		
	//console.log("BEFORE td.parentElement.instanceReference", td.parentElement.instanceReference);
}



function endEditCustomColour(input) {
	var td = input.parentNode;
	

	td.removeChild(td.firstChild);	//remove input
	td.innerHTML = input.value;
	if (oldText != input.value.trim() ) {
		td.style.color = "green";
		delay(2000).then(() => {
			//console.log("ValidateNamespaceSlug");
			td.style.color = "";
		});
	}

	td.style.paddingTop = padTop;
	td.style.paddingBottom = padBottom;
	td.style.backgroundColor = oldColor;
	td.setAttribute("background-color", oldColor);
	//td.style.backgroundColor = "";

	// UPDATE OUR Colour OBJECT
	console.log("td.parentElement.colourReference ", td.parentElement.colourReference );
	if (td.parentElement.colourReference != "") {
		console.log("EDIT COLOUR");
		// Iterate through colours
		for (let i = 0; i < settings.CustomColours.length; i++) {
			
			// Check if colour already exists
			if (settings.CustomColours[i].name == td.parentElement.colourReference.name) {				

				if (td.key == "name") {
					if (oldText == settings.CustomColours[i].name) {
						
						settings.CustomColours[i].name = input.value;
						td.parentElement.colourReference = settings.CustomColours[i];
						autoSaveColours();
						return
					}
				} else if (td.key == "mainColour") {
					if (td.previousSibling.textContent == settings.CustomColours[i].name) {
						colouriseColourRow(td.parentElement);
						settings.CustomColours[i].mainColour = input.value;
						td.parentElement.colourReference = settings.CustomColours[i];
						autoSaveColours();
						return
					}
				} else if (td.key == "mainColourBackground") {
					if (td.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
						colouriseColourRow(td.parentElement);
						settings.CustomColours[i].mainColourBackground = input.value;
						td.parentElement.colourReference = settings.CustomColours[i];
						autoSaveColours();
						return
					}
				} else if (td.key == "highlightColour") {
					if (td.previousSibling.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
						colouriseColourRow(td.parentElement);
						settings.CustomColours[i].highlightColour = input.value;
						td.parentElement.colourReference = settings.CustomColours[i];
						autoSaveColours();
						return
					}
				} else if (td.key == "linkColour") {
					if (td.previousSibling.previousSibling.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
						colouriseColourRow(td.parentElement);
						settings.CustomColours[i].linkColour = input.value;
						td.parentElement.colourReference = settings.CustomColours[i];
						autoSaveColours();
						return
					}
				}	
			}
		}
	} else {
							/////////
					
		// new Colour
		console.log("new colour");
		
		if (settings.CustomColours == undefined) {
			settings.CustomColours = [];
		}
		//console.log("new namespace?");
		td.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
		td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
		let newColour = {name: input.value, mainColour: "", mainColourBackground: "", highlightColour: "", linkColour: ""};
		settings.CustomColours.push(newColour);
		//console.log("newColour", newColour);
		td.colourReference = newColour;
		td.parentElement.colourReference = newColour;
		//td.parentElement.instanceReference = newColour;
		//td.parentRow.colourReference = newColour;
		td.nextElementSibling.colourReference = newColour;
		td.nextElementSibling.nextElementSibling.colourReference = newColour;
		td.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
		td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
		td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
		
		let newColourRow = createCustomColourRow();
		//newColourRow.style.display = "";
		autoSaveColours();
		return
	}
	//console.log("AFTER td.instanceReference", td.parentElement.instanceReference);
}

function colouriseColourRow(row) {
	try {
		row.style.background = row.children[1].innerText
	} catch {
		row.style.background = row.children[2].innerText
	}
	row.style.color = row.children[3].innerText
	row.children[4].style.color = row.children[4].innerText
}



function autoSaveColours() {

	exportWhiz.settings.CustomColours = settings.CustomColours;
	saveSettings();
	
	if (settings.CustomColours != undefined) {
		customColours = settings.CustomColours;
	}
	document.dispatchEvent(colourChangeEvent);
	// chrome.storage.local.set({settings: settings}, function() {
	// 	if (settings.CustomColours != undefined) {
	// 		customColours = settings.CustomColours;
	// 	}
	// 	//console.log('Instances is set to:',  instances);
	// 	successAlert("Colours Saved");
	// 	document.dispatchEvent(colourChangeEvent);
	// 	//updateImportText();
	// });

}

/*
function updateColourDropDowns() {
	let dropdowns = document.getElementsByClassName("colourSelector");
	dropdowns.forEach(function(dropdown) {


		if dropdown.options

	})
}*/

function deleteCustomColour(deleteCell) {
	if (confirm("Delete colour?")) {
		let colour = deleteCell.parentElement.colourReference
		
		for (let i = 0; i < settings.CustomColours.length; i++) {
			if (settings.CustomColours[i].name == colour.name) {
				if (settings.CustomColours[i].name == deleteCell.parentElement.colourReference.name) {
					settings.CustomColours.splice(i, 1);
					
				}
			}
		}
		deleteCell.parentElement.parentElement.removeChild(deleteCell.parentElement);	
		autoSaveColours();
	}
}

document.getElementById("exportBtn").addEventListener('click', ()=> {
	let exportString = document.getElementById('export').value
	// = JSON.stringify(exportString, null, 1);
    // Create a Blob with the CSV data
    const blob = new Blob([exportString], { type: 'text/plain;charset=utf-8;' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Iris Whizz Config";

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

})