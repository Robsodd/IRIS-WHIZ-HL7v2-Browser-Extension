let instances = []
console.log(instances.length)
//console.log(instances);
let currentInstanceSelected;
loadReadMe();
let exportWhiz = {};
exportWhiz.settings = {};

exportWhiz.settings.AutoTab = false;
exportWhiz.settings.AutoTabNameSpace = false;
exportWhiz.settings.CSS = false;
exportWhiz.settings.SortOrder = false;
exportWhiz.settings.TimeFormat = false;
exportWhiz.settings.HomepageReports = false;
exportWhiz.settings.LastUpdated = false;
exportWhiz.settings.BookmarkFolderName = false; 
exportWhiz.settings.ButtonsShow = false;
exportWhiz.settings.ChatGPTKey = "";

// Export
chrome.storage.local.get({
			settings: [],
			instances: [],
			}, function(stored) {
	if (Object.keys(stored).length === 0) {
		instances = [];
	} else {
		instances = stored.instances;
		//document.getElementById('export').value = JSON.stringify(instances, null, 1);
		exportString = JSON.stringify(stored, null, 1);
		console.log("exportWhiz", exportString);
		
		document.getElementById('export').value = JSON.stringify(exportString, null, 1);
	}
	/*
	//console.log("instances after!", instances);
	chrome.storage.local.get(['settings'], function(stored) {
		let settings = stored.settings;
		exportWhiz.settings = JSON.stringify(settings, null, 1);
		document.getElementById('export').value = JSON.stringify(exportWhiz, null, 1);
	
	});
	*/
});

var refresh = document.getElementById('refreshInstances');
refresh.onclick = refreshInstances();


function refreshInstances() {
	chrome.storage.local.get({
			settings: [],
			instances: [],
			}, function(stored) {
		if (Object.keys(stored).length === 0) {
			instances = [];
		} else {
			instances = stored.instances;
			console.log("I SHOULD NOT SEE THIS");
			document.getElementById('export').value = JSON.stringify(stored, null, 1);
		}
		// Remove Instances from dropdown
		removeInstances();
		// Add back to dropdown
		getInstances();
		// Remove namespaces from dropdown
		removeNamespaces();
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


/// Retrieves saved instances
function getInstances() {
	document.getElementById('ValidateInstanceName').innerHTML = "";
	document.getElementById('ValidateInstanceURL').innerHTML = "";
	document.getElementById('ValidateInstanceColour').innerHTML = "";
	document.getElementById('ValidateNamespaceName').innerHTML = "";
	document.getElementById('ValidateNamespaceSlug').innerHTML = "";
	selection = document.getElementById('InstanceSelect');

	let instancesLength = instances.length;
	for (var i = 0; i < instancesLength; i ++ ) {
		var opt = document.createElement('option');
		opt.value = instances[i].name;
		opt.innerHTML = instances[i].name;
		selection.appendChild(opt);
	}	
}

/// Remove instances from instance dropdown
function removeInstances() {
	var instanceSelect = document.getElementById('InstanceSelect');
	while (instanceSelect.options.length > 0) {
		instanceSelect.remove(0);
	}
	var addNew = document.createElement('option');
	addNew.value = "NewInstance";
	addNew.innerHTML = "Add New";
	instanceSelect.appendChild(addNew);	
	document.getElementById('InstanceName').value = "";
	document.getElementById('InstanceURL').value = "";
	document.getElementById('InstanceColour').value = "gray";
}


/// validation rules for instance name
function validateInstanceName() {
	
	delay(400).then(() => {
		//console.log("ValidateInstanceName");
		let error = "";
		let instanceSelect = document.getElementById('InstanceSelect').value;
		let newInstanceName = document.getElementById('InstanceName').value;
		let instancesLength = instances.length;
		for (var i = 0; i < instancesLength; i ++ ){ 
			if (instances[i].name == newInstanceName) {
				// Is this a new instance?
				if (instanceSelect == "NewInstance") {
					// If instance name is new but matches a current instance name - error
					error = "Instance name '" + newInstanceName + "' already in use.";
				} else if (instanceSelect != newInstanceName) {
					// If instance name is not new and does not match the selected instance but does match another current instance name - Error
					error = "Instance name '" + newInstanceName + "' already in use.";
				}
			}
		}
		if (error != "") {
			document.getElementById('ValidateInstanceName').innerHTML = error;
			document.getElementById('saveInstance').disabled = true;
		} else {
			document.getElementById('ValidateInstanceName').innerHTML = "";
			document.getElementById('saveInstance').disabled = false;
		}
	});
}

/// validation rules for instance url
function validateInstanceUrl() {
	delay(400).then(() => {
		//console.log("ValidateInstanceURL");
		let error = ""
		let instanceSelect = document.getElementById('InstanceSelect').value;
		let newInstanceURL = document.getElementById('InstanceURL').value;
		let newInstanceName = document.getElementById('InstanceName').value;
		//console.log("newInstanceURL", newInstanceURL);

		// Check URL isn't already used (trigger error)
		let instancesLength = instances.length;
		for (var i = 0; i < instancesLength; i ++ ){ 
			if (instances[i].url == newInstanceURL) {
				//console.log("instances[i].url", instances[i].url);
				// Is this a new instance?
				if (instanceSelect == "NewInstance") {
					// NEW INSTANCE
					// If instance url is new but matches a current instance url - error
					error = "Instance URL '" + newInstanceURL + "' already in use by " + instances[i].name;
				} else { 
					// Editing An Instance - Instance name has changed. We can accept a matching URL if the instanceSelect name matches.
					if (instances[i].name != instanceSelect) {
						error = "Instance URL '" + newInstanceURL + "' already in use by " + instances[i].name;
					}
				}
			}
		}
		if (error != "") {
			document.getElementById('ValidateInstanceURL').innerHTML = error;
			document.getElementById('saveInstance').disabled = true;
		} else {
			document.getElementById('ValidateInstanceURL').innerHTML = "";
			document.getElementById('saveInstance').disabled = false;
		}
	});
}

/// Validation rules for instance colour
function validateInstanceColour() {
	delay(100).then(() => {
		//console.log("ValidateInstanceColour");
		let error = "";
		let instanceSelect = document.getElementById('InstanceSelect').value;
		let newInstanceName = document.getElementById('InstanceName').value;
		let newInstanceColour = document.getElementById('InstanceColour').value;
		// Check Colour isn't already used (trigger error)
		let instancesLength = instances.length;
		for (var i = 0; i < instancesLength; i ++ ){ 
			if (instances[i].colour == newInstanceColour) {
				// Is this a new instance?
				if (instanceSelect == "NewInstance") {
					// NEW INSTANCE
					// If instance colour is new but matches a current instance url - error
					error = "Warning: Instance colour '" + newInstanceColour + "' already in use by " + instances[i].name;
				} else { 
					// If compared instance is not the original
					if (instances[i].name != instanceSelect) {
						error = "Warning: Instance colour '" + instances[i].colour + "' already in use by " + instances[i].name;
					}
				}
			}
		}
		if (error != "") {
			document.getElementById('ValidateInstanceColour').innerHTML = error;
		} else {
			document.getElementById('ValidateInstanceColour').innerHTML = "";
		}
	});
}

/// Validation rules for namespace name
function validateNamespaceName() {
	delay(400).then(() => {
		//console.log("ValidateNamespaceName");
		let error = ""
		let instanceSelect = document.getElementById('InstanceSelect').value;
		let namespaceSelect = document.getElementById('NamespaceSelect').value;
		let newNamespaceName = document.getElementById('NamespaceName').value;
		let instancesLength = instances.length;
		for (var i = 0; i < instancesLength; i ++ ){ 
			//console.log("1");
			if (instances[i].name == instanceSelect) {
				//console.log("2", instances[i].namespaces.length);
				let namespacesLength = instances[i].namespaces.length;
				for (var x = 0; x < namespacesLength; x++ ){
					//console.log("3");
					if (newNamespaceName == instances[i].namespaces[x].name) {
						//console.log("4");
						// Is this a new instance?
						if (namespaceSelect == "NewNamespace") {
							// If namespace name is new but matches a current instance name - error
							error = "Namespace name '" + newNamespaceName + "' already in use."
						} else if (namespaceSelect != newNamespaceName) {
							// If instance name is not new and does not match the selected instance but does match another current instance name - Error
							error = "Namespace name '" + newNamespaceName + "' already in use."
						}
					}
					
				}
			}
		}
		if (error != "") {
			document.getElementById('ValidateNamespaceName').innerHTML = error;
			document.getElementById('saveInstance').disabled = true;
		} else {
			document.getElementById('ValidateNamespaceName').innerHTML = "";
			document.getElementById('saveInstance').disabled = false;
		}
	});
}


/// Validation rules for namespace slug
function validateNamespaceSlug() {
	delay(400).then(() => {
		//console.log("ValidateNamespaceSlug");
		let error = ""
		let instanceSelect = document.getElementById('InstanceSelect').value;
		let namespaceSelect = document.getElementById('NamespaceSelect').value;
		let newNamespaceName = document.getElementById('newNamespaceSlug').value;
		let instancesLength = instances.length;
		for (var i = 0; i < instancesLength; i ++ ){ 
			if (instances[i].name == instanceSelect) {
				let namespacesLength = instances[i].namespaces.length;
				for (var x = 0; x < namespacesLength; x++ ){

					if (newNamespaceSlug == instances[i].namespaces[x].namespace) {
						// Is this a new instance?
						if (namespaceSelect == "NewNamespace") {
							// If namespace name is new but matches a current instance name - error
							error = "Namespace slug '" + newNamespaceSlug + "' already in use.";
						} else if (namespaceSelect != newNamespaceName) {
							// If NameSpace name is not new and does not match the selected instance but does match another current instance name - Error
							error = "Namespace slug '" + newNamespaceSlug + "' already in use.";
						}
					}
					
				}
			}
		}
		if (error != "") {
			document.getElementById('ValidateNamespaceSlug').innerHTML = error;
			document.getElementById('saveInstance').disabled = true;
		} else {
			document.getElementById('ValidateNamespaceSlug').innerHTML = "";
			document.getElementById('saveInstance').disabled = false;
		}
	});
}

/// Saves the instance
function saveInstance() {
	
	// If new, check name is not the same
	let instanceSelect = document.getElementById('InstanceSelect').value;
	let namespaceSelect = document.getElementById('NamespaceSelect').value;
	let instanceNameConflict = false;
	
	let newInstanceName = document.getElementById('InstanceName').value;
	let newInstanceURL = document.getElementById('InstanceURL').value;
	let newInstanceColour = document.getElementById('InstanceColour').value;
	let errors = [];
	let error = "";
	
	let newNamespaceName = document.getElementById('NamespaceName').value;
	let newNamespaceURL = document.getElementById('NamespaceSlug').value;
	let newInstance = { name: "" };
	let editedInstance = { name: ""};
	
	if (newInstanceName == "") {
		errorAlert("Instance must have a name");
		return
	}

	// Validation Checks
	let instanceNumber // For passing instance to the namespace section
	// ADD INSTANCE
	if (instanceSelect == "NewInstance") {
		// ADD A NEW INSTANCE TO INSTANCE OBJECT & SAVE TO STORAGE	
		newInstance.name = newInstanceName;
		newInstance.url = newInstanceURL;
		newInstance.colour = newInstanceColour;
		newInstance.namespaces = [];
		
		instances.push(newInstance);
		instanceNumber = getInstanceNumber(newInstanceName);
		//console.log(instanceNumber);	

	} else {
		// FIND AND UPDATE INSTANCE NAME/DNS/COLOUR
		let i = getInstanceNumber(instanceSelect);
		editedInstance = instances[i];
		
		editedInstance.name = newInstanceName;
		editedInstance.url = newInstanceURL;
		editedInstance.colour = newInstanceColour;
		instanceNumber = getInstanceNumber(instanceSelect);
	}
	// ADD NAMESPACE
	if ((namespaceSelect == "NewNamespace") && (newNamespaceName != "")) {
		// IF POPULATED, Add new NAMESPACE NAME/SLUG FOR THIS INSTANCE

		if (editedInstance.name != "") {
			editedInstance.namespaces.push({ name: newNamespaceName, namespace: newNamespaceURL});
		} else {
			newInstance.namespaces.push({ name: newNamespaceName, namespace: newNamespaceURL, groupId: 0});				
		}

	} else if (newNamespaceName != "") {

		// If editing
		let x = getNamespaceNumber(instanceNumber, namespaceSelect);
		let editedNamespace = instances[instanceNumber].namespaces[x];
		editedNamespace.name = newNamespaceName;
		editedNamespace.namespace = newNamespaceURL;
	}
		

	chrome.storage.local.set({instances: instances}, function() {
		//console.log('Instances is set to:',  instances);
		successAlert("Instances Saved");
		document.getElementById('export').value = JSON.stringify(instances, null, 1);
	});

	removeInstances();
	getInstances();
	removeNamespaces();
	showNamespace("NewNamespace");
}

/// Remove Namespaces from the namespace dropdown
function removeNamespaces() {
	var namespaceSelect = document.getElementById('NamespaceSelect');
	while (namespaceSelect.options.length > 0) {
		namespaceSelect.remove(0);
	}
	var addNew = document.createElement('option');
	addNew.value = "NewInstance";
	addNew.innerHTML = "Add New";
	namespaceSelect.appendChild(addNew);
	document.getElementById('NamespaceName').value = "";
	document.getElementById('NamespaceSlug').value = "";
}


/// Populate the instance form fields
function showInstance(instanceName) {
	currentInstanceSelected = instanceName;
	
	if (instanceName == "NewInstance") {
		document.getElementById('InstanceName').value = " ";
		document.getElementById('InstanceURL').value = "";
		document.getElementById('InstanceColour').value = "gray";
		showNamespace("NewNamespace");
	} else {
		var	i = getInstanceNumber(instanceName);
		if (instanceName == instances[i].name) {			
			document.getElementById('InstanceName').value = instances[i].name;
			document.getElementById('InstanceURL').value = instances[i].url;
			document.getElementById('InstanceColour').value = instances[i].colour;
			var namespaces = document.getElementById('NamespaceSelect');
			//console.log("REMOVE NAMESPACES");
			while (namespaces.options.length > 0) {
				namespaces.remove(0);
				//console.log("REMOVE NAMESPACES", namespaces.options.length);
			}
			var addNew = document.createElement('option');
			addNew.value = "NewNamespace";
			addNew.innerHTML = "Add New";
			document.getElementById('NamespaceName').value = "";
			document.getElementById('NamespaceSlug').value = "";
			namespaces.appendChild(addNew);
			let namespacesLength = instances[i].namespaces.length;
			for (var x = 0; x < namespacesLength; x ++ ){
				
				var opt = document.createElement('option');
				opt.value = instances[i].namespaces[x].name;
				opt.innerHTML = instances[i].namespaces[x].name;
				namespaces.appendChild(opt);
			}
		}		
	}
}



/// Populate the namespace form fields
function showNamespace(namespace) {
	if (namespace == "NewNamespace") {
		document.getElementById('NamespaceSelect').value = "NewNamespace";
		document.getElementById('NamespaceName').value = "";
		document.getElementById('NamespaceSlug').value = "";
		return
	}
	let instance = document.getElementById('InstanceName').value;
	let i = getInstanceNumber(instance);
	
	let match
	if (instance == instances[i].name) {
		let namespacesLength = instances[i].namespaces.length;
		for (var x = 0; x < namespacesLength; x ++ ){
			if (match) {
				break
			}
			if (namespace == instances[i].namespaces[x].name) {
				document.getElementById('NamespaceName').value = instances[i].namespaces[x].name;
				document.getElementById('NamespaceSlug').value = instances[i].namespaces[x].namespace;
				match = true;
			}
			
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


}


/// Saves settings to local storage
function saveSettings() {
		// var Bookmarks = document.getElementById('Bookmarks').checked;
		exportWhiz.settings.AutoTab = document.getElementById('AutoTab').checked;
		exportWhiz.settings.AutoTabNameSpace = document.getElementById('AutoTabNameSpace').checked;
		exportWhiz.settings.CSS = document.getElementById('CSS').checked;
		exportWhiz.settings.SortOrder = document.getElementById('MVSortOrder').checked;
		exportWhiz.settings.TimeFormat = document.getElementById('MVTimeFormat').checked;
		exportWhiz.settings.HomepageReports = document.getElementById('HomepageReports').checked;
		exportWhiz.settings.LastUpdated = new Date().toLocaleString();
		exportWhiz.settings.BookmarkFolderName = document.getElementById('BookmarkFolderName').value; 
		exportWhiz.settings.ButtonsShow = document.getElementById('ButtonsShow').checked; 
		exportWhiz.settings.ChatGPTKey = document.getElementById('ChatGPTKey').value; 
		/*chrome.tabs.getCurrent().then((tab) => {
			console.log(tab);
			chrome.tabs.sendMessage(tab.id, {type: "bookmarks_folder", test: "test",}, function(response) {
					console.log("response", response);
			});
			
		})*/
		//exportWhiz.settings = "";
		console.log("saveSettings:", exportWhiz);
		// var ContextMenu = document.getElementById('ContextMenu').checked;
		chrome.storage.local.set({
			settings: exportWhiz.settings,
		}, function() {
			// Update status to let user know options were saved.
			successAlert("Settings Saved");
		});
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
			}, 2000);
}

/// Restores select box and checkbox state from local storage
function restoreOptions() {
	  // Use default value color = 'red' and likesColor = true.
		chrome.storage.local.get({
			settings: {},
		}, function(items) {
			console.log("retreiving settings:", items.settings)
			if (items.settings.AutoTab === undefined) {
				console.log("can't retrieve!")
				return
			} else {
				// document.getElementById('Bookmarks').checked = items.Bookmarks;
				document.getElementById('AutoTab').checked = items.settings.AutoTab;
				document.getElementById('AutoTabNameSpace').checked = items.settings.AutoTabNameSpace;
				document.getElementById('CSS').checked = items.settings.CSS;
				document.getElementById('MVSortOrder').checked = items.settings.SortOrder;
				document.getElementById('MVTimeFormat').checked = items.settings.TimeFormat;
				document.getElementById('HomepageReports').checked = items.settings.HomepageReports;
				document.getElementById('BookmarkFolderName').value = items.settings.BookmarkFolderName;
				document.getElementById('ButtonsShow').checked = items.settings.ButtonsShow;
				document.getElementById('ChatGPTKey').value = items.settings.ChatGPTKey;
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

document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('InstanceName').addEventListener('keydown', validateInstanceName);
document.getElementById('InstanceURL').addEventListener('keydown', validateInstanceUrl);
document.getElementById('InstanceColour').addEventListener('change', validateInstanceColour);
document.getElementById('NamespaceName').addEventListener('keydown', validateNamespaceName);
document.getElementById('NamespaceSelect').addEventListener('change', function() {
				showNamespace(this.value);
			});
document.getElementById('InstanceSelect').addEventListener("change", function() {
		showInstance(this.value);
		document.getElementById('ValidateInstanceName').innerHTML = ""
		document.getElementById('ValidateInstanceURL').innerHTML = ""
		document.getElementById('ValidateInstanceColour').innerHTML = ""
	})
document.getElementById('saveInstance').addEventListener('click', saveInstance);
document.getElementById('import').addEventListener('click', importInstances);
	
window.addEventListener("load", function() { 
	instances = []
	refreshInstances();
})
