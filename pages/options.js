let instances = [];
let settings = [];
let instanceAlert = document.getElementById("instanceAlert");
if (instanceAlert) instanceAlert.title = "Instances item not set!";

let currentInstanceSelected;
loadReadMe();
let exportWhiz = {};
exportWhiz.settings = {};
let instanceTable;
let namespaceTable;

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

let defaultColours = ["grey", "blue","red","yellow","green","pink","purple","cyan","orange"];
let customColours = [];

// Export / Init Storage
chrome.storage.local.get({
    settings: {},
    instances: [],
}, function(stored) {
    if (Object.keys(stored).length === 0) {
        instances = [];
    } else {
        instances = stored.instances;

        if (instances.length == 0 && instanceAlert) {
            instanceAlert.style.display = "block";
        } else if (instanceAlert) {
            instanceAlert.style.display = "none";
        }
        
        settings = stored.settings || {};
        
        let exportString = JSON.stringify(stored, null, 1);
        if (settings.CustomColours != undefined) {
            customColours = settings.CustomColours;
        }
        let exportElement = document.getElementById('export');
        if (exportElement) exportElement.value = exportString;
    }
    createInstanceTable();
    createCustomColoursTable();
});

chrome.storage.onChanged.addListener(function(changes, areaName) {
    updateImportText();
});

function refreshInstances() {
    chrome.storage.local.get({
        settings: {},
        instances: [],
    }, function(stored) {
        if (Object.keys(stored).length === 0) {
            instances = [];
        } else {
            instances = stored.instances;
            if (stored.settings.ChatGPTKey) {
                stored.settings.ChatGPTKey = replaceLetters(stored.settings.ChatGPTKey);
            }
            let exportElement = document.getElementById('export');
            if (exportElement) exportElement.value = JSON.stringify(stored, null, 1);
        }
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

/// Saves the on-page text instance object and requests missing host permissions
function importInstances() {
    let text = document.getElementById('export').value;
    let object;
    
    if (text == "") {
        object = {};
    } else {
        try {
            object = JSON.parse(text);
        } catch (e) {
            alert("Invalid JSON format: " + e);
            return; // Stop execution if JSON is invalid
        }
    }

    console.log("INSTANCES OBJECT: ", object);

    // 1. Extract the instances array based on the imported format
    let importedInstances = [];
    if (object.instances) {
        importedInstances = object.instances;
    } else if (Array.isArray(object)) {
        importedInstances = object;
    }

    // 2. Gather all required origins for the imported instances
    let originsToRequest = [];
    importedInstances.forEach(inst => {
        if (inst.url) {
            const baseHost = String(inst.url).replace(/\/$/, "");
            originsToRequest.push(`*://${baseHost}/*`);
            originsToRequest.push(`*://${baseHost}:*/*`);
        }
    });

    // Remove duplicates from the array
    originsToRequest = [...new Set(originsToRequest)];

    // 3. Helper function to execute your original save logic
    const performSave = () => {
        if ((object.settings == undefined) && (object.instances == undefined)) {
            chrome.storage.local.set({ instances: [], settings: {} }, function() {
                successAlert("Instances Imported");
                refreshInstances();
            });
        } else if ((object.settings == undefined)) {
            chrome.storage.local.set({ instances: object, settings: {} }, function() {
                successAlert("Instances Imported");
                refreshInstances();
            });
        } else {
            chrome.storage.local.set({ instances: object.instances, settings: object.settings }, function() {
                successAlert("Instances and Settings Imported");
                refreshInstances();
            });
        }
        
        delay(2000).then(() => {
            location.reload();
        });
    };

    // 4. Check and request permissions before saving
    if (originsToRequest.length > 0) {
        chrome.permissions.contains({ origins: originsToRequest }, (hasAllPermissions) => {
            if (hasAllPermissions) {
                console.log("Permissions already granted for all imported instances.");
                performSave();
            } else {
                console.log("Requesting missing permissions for imported instances...");
                chrome.permissions.request({ origins: originsToRequest }, (granted) => {
                    if (granted) {
                        console.log("Permissions granted!");
                        performSave();
                    } else {
                        alert("Import cancelled. You must grant permissions to the imported URLs to use them.");
                    }
                });
            }
        });
    } else {
        performSave();
    }
}

function updateImportText() {
    chrome.storage.local.get({
        settings: {},
        instances: [],
    }, function(stored) {
        if (stored.settings.ChatGPTKey) {
            stored.settings.ChatGPTKey = replaceLetters(stored.settings.ChatGPTKey);
        }
        let exportString = JSON.stringify(stored, null, 1);
        let exportElement = document.getElementById('export');
        if (exportElement) exportElement.value = exportString;
    });
}

// =========================================================================
// NEW DYNAMIC CONFIGURATION ENGINE
// =========================================================================

// Combines globals and script toggles into one flat array for looping
function getAllConfigItems() {
    let allItems = [...globalSettings];

    Object.values(scriptDefinitions).forEach(script => {
        // Master Toggle for the script
        allItems.push({
            id: script.id,
            type: "checkbox",
            default: script.default,
            isSecret: false
        });
        
        // Nested specific settings
        if (script.options) {
            allItems.push(...script.options);
        }
    });

    return allItems;
}

// Generates the HTML layout for a single config item
function createSettingElement(container, config, isScriptToggle = false) {
    let wrapper = document.createElement("div");
    wrapper.style.marginBottom = "15px";

    let input = document.createElement("input");
    input.type = config.type || "checkbox"; 
    input.id = config.id;
    input.name = config.id;
    
    if (input.type === "number") {
        if (config.min !== undefined) input.min = config.min;
        if (config.max !== undefined) input.max = config.max;
        input.addEventListener("input", function() {
            if (parseInt(this.value) > config.max) this.value = config.max;
        });
    }

    let label = document.createElement("label");
    label.htmlFor = config.id;
    label.innerHTML = isScriptToggle ? ` <b>${config.label}</b>` : ` ${config.label}`;

    let desc = document.createElement("div");
    desc.innerHTML = `<i>${config.desc}</i>`;
    desc.style.fontSize = "0.9em";
    desc.style.color = "#555";
    desc.style.paddingLeft = input.type === "checkbox" ? "24px" : "0px";

    if (input.type === "checkbox") {
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        wrapper.appendChild(desc);
    } else {
        wrapper.appendChild(label);
        wrapper.appendChild(document.createElement("br"));
        wrapper.appendChild(input);
        wrapper.appendChild(desc);
    }

    // Auto-attach save handler!
    input.addEventListener("change", saveSettings);
    container.appendChild(wrapper);
}

// Dynamically builds the UI based on config.js
function buildSettingsUI() {
    const container = document.getElementById("dynamicSettingsContainer");
    if (!container) return;
    container.innerHTML = ""; 

    // ==========================================
    // 1. CREATE SEARCH BAR
    // ==========================================
    let searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search settings, categories, or features...";
    searchInput.style.width = "100%";
    searchInput.style.padding = "10px";
    searchInput.style.marginBottom = "20px";
    searchInput.style.boxSizing = "border-box";
    searchInput.style.border = "1px solid #ccc";
    searchInput.style.borderRadius = "4px";
    searchInput.style.fontSize = "16px";
    container.appendChild(searchInput);

    // ==========================================
    // 2. POOL & GROUP FEATURES
    // ==========================================
    const allFeatures = [
        ...globalSettings, 
        ...Object.values(scriptDefinitions)
    ];

    const categorizedFeatures = {};
    
    allFeatures.forEach(feature => {
        const cat = feature.category || "General Settings"; 
        
        // MAGICAL FILTER: Completely ignore the "Hide" category!
        if (cat === "Hide") return; 
        
        if (!categorizedFeatures[cat]) {
            categorizedFeatures[cat] = [];
        }
        categorizedFeatures[cat].push(feature);
    });

    const sortedCategories = Object.keys(categorizedFeatures).sort((a, b) => a.localeCompare(b));

    // ==========================================
    // 3. RENDER CATEGORIES
    // ==========================================
    sortedCategories.forEach(categoryName => {
        const features = categorizedFeatures[categoryName];
        
        // Create a wrapper for the entire category so we can hide it during search
        let categoryWrapper = document.createElement("div");
        categoryWrapper.className = "category-wrapper";

        // Render the Category Header
        let catHeader = document.createElement("h3");
        catHeader.innerText = categoryName;
        catHeader.style.marginTop = "10px";
        catHeader.style.paddingBottom = "5px";
        catHeader.style.borderBottom = "2px solid #ccc";
        categoryWrapper.appendChild(catHeader);

        // Render each feature
        features.forEach(featureConfig => {
            
            let featureBlock = document.createElement("div");
            featureBlock.className = "feature-block"; 
            featureBlock.style.padding = "10px";
            featureBlock.style.marginTop = "10px";
            featureBlock.style.marginBottom = "10px";
            featureBlock.style.border = "1px solid #ddd";
            featureBlock.style.borderRadius = "5px";
            featureBlock.style.background = "#fafafa";
            
            createSettingElement(featureBlock, featureConfig, true);

            if (featureConfig.options && featureConfig.options.length > 0) {
                let optionsContainer = document.createElement("div");
                optionsContainer.style.marginLeft = "30px"; 
                optionsContainer.style.paddingTop = "10px";
                optionsContainer.style.borderTop = "1px solid #eee";

                featureConfig.options.forEach(subConfig => {
                    createSettingElement(optionsContainer, subConfig, false);
                });

                featureBlock.appendChild(optionsContainer);
            }
            
            categoryWrapper.appendChild(featureBlock);
        });

        container.appendChild(categoryWrapper);
    });

    // ==========================================
    // 4. SEARCH FILTER LOGIC (UPDATED)
    // ==========================================
    searchInput.addEventListener("input", function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const categoryWrappers = container.querySelectorAll(".category-wrapper");

        categoryWrappers.forEach(wrapper => {
            const header = wrapper.querySelector("h3");
            const categoryName = header.innerText.toLowerCase();
            const featureBlocks = wrapper.querySelectorAll(".feature-block");
            
            // Check if the search term matches the Category Name itself!
            const categoryMatches = categoryName.includes(searchTerm);
            let hasVisibleFeature = false;

            featureBlocks.forEach(block => {
                // Show the block if the CATEGORY matched, OR if the block's text matched
                if (categoryMatches || block.innerText.toLowerCase().includes(searchTerm)) {
                    block.style.display = "block";
                    hasVisibleFeature = true;
                } else {
                    block.style.display = "none";
                }
            });

            // Hide the category header if nothing matches
            header.style.display = hasVisibleFeature ? "block" : "none";
        });
    });
}

/// Restores select box and checkbox state from local storage
function restoreOptions() {
    chrome.storage.local.get({ settings: {} }, function(items) {
        getAllConfigItems().forEach(config => {
            let el = document.getElementById(config.id);
            if (!el) return;

            let val = items.settings[config.id];
            if (val === undefined) val = config.default;

            if (config.isSecret && val) val = replaceLetters(val);

            if (config.type === "checkbox" || !config.type) {
                el.checked = val;
            } else {
                el.value = val;
            }
        });
    });
}

/// Saves settings to local storage dynamically
function saveSettings() {
    exportWhiz.settings.LastUpdated = new Date().toLocaleString();
    exportWhiz.settings.CustomColours = settings.CustomColours || [];

    getAllConfigItems().forEach(config => {
        let el = document.getElementById(config.id);
        if (!el) return;

        let val = (config.type === "checkbox" || !config.type) ? el.checked : el.value;

        // Don't overwrite secret mask
        if (config.isSecret && typeof val === "string" && val.includes("****")) {
            val = settings[config.id]; 
        }

        exportWhiz.settings[config.id] = val;
    });

    chrome.storage.local.set({ settings: exportWhiz.settings }, function() {
        successAlert("Settings Saved");
        settings = exportWhiz.settings; // Update local scope

        // Tell background.js to recalculate injected scripts
        if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "update-scripts" }).catch(() => {});
        }
    });
}

// =========================================================================

function replaceLetters(text) {
    if ((text == "") || (text == undefined)) {
        return "";
    }
    const length = text.length;
    if (length <= 4) return text;
    const lastFour = text.slice(-4);
  
    // Create a new string with leading "*" characters and append the last four
    const modifiedText = "*".repeat(length - 4) + lastFour;
    return modifiedText;
}

function successAlert(displayText) {
    var status = document.getElementById('status');
    status.textContent = displayText;
    status.style.background = "green";
    status.style.display = "block";
    setTimeout(function() {
        status.textContent = '';
        status.style.display = "none";
    }, 2000);
}

function errorAlert(displayText) {
    var status = document.getElementById('status');
    status.textContent = displayText;
    status.style.background = "red";
    status.style.display = "block";
    setTimeout(function() {
        status.textContent = '';
        status.style.display = "none";
    }, 3000);
}

function loadReadMe() {
    let readMeText = chrome.runtime.getURL("README.txt");
    let readMeDiv = document.getElementById("readmeDiv");
    
    if(readMeDiv) {
        fetch(readMeText)
            .then(response => response.text())
            .then(body => {
                // Pass the raw text through our new parser, and inject as HTML!
                readMeDiv.innerHTML = parseMarkdown(body);
            });
    }
}

/// Perform a delay in miliseconds
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// =========================================================================
// EVENT LISTENERS
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    buildSettingsUI(); // 1. Generate the UI Elements
    restoreOptions();  // 2. Populate them with stored data
});

let importBtn = document.getElementById('import');
if (importBtn) importBtn.addEventListener('click', importInstances);

window.addEventListener("load", function() { 
    instances = [];
    refreshInstances();
});


// =========================================================================
// INSTANCE EDITOR 
// =========================================================================

let instanceTableArray = [];

function createInstanceTable() {
    let instanceTableDiv = document.getElementById("instanceTableDiv");
    if (!instanceTableDiv) return;

    instanceTable = document.createElement("table");
    instanceTableDiv.appendChild(instanceTable);
    
    let caption = document.createElement("caption");
    caption.innerText = "Instances";
    instanceTable.appendChild(caption);
    
    let instanceTableHeaders = instanceTable.insertRow(0);
    createInstanceTableHeaders(instanceTableHeaders);
    
    for (let i = 0; i < instances.length; i++) {
        createInstanceRow(instances[i]);
    }
    createInstanceRow();
}

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
    let selector;
    
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
        let newSelector = createColourSelector("instance");
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
        instance = instanceRow.instanceReference;
        
        let display;
        if ((instanceRowNamespaces.clicked == undefined) || (instanceRowNamespaces.clicked == false) ) {
            instanceRowNamespaces.classList.add("selected");
            display = "";
            instanceRowNamespaces.clicked = true;
            let length = instanceRow.instanceReference.namespaces.length;
            instanceRowNamespaces.textContent = String(length) + " [-]";

            createNamespaceTable(instance, instanceRowNamespaces);
            
        } else {
            instanceRowNamespaces.classList.remove("selected");
            instanceRowNamespaces.clicked = false;
            instanceRowNamespaces.textContent = String(instanceRow.instanceReference.namespaces.length) + " [+]";;
        } 
    });      
}

function deleteInstance(deleteCell) {
    if (confirm("Delete instance?")) {
        let instance = deleteCell.parentElement.instanceReference;
        let deletedUrl = instance.url;
        for (let i = 0; i < instances.length; i++) {
            if (instances[i].name == instance.name) {
                instances.splice(i, 1);
                autoSaveInstances();
                permissionDelete(deletedUrl, instances);
                break;
            }
        }
        deleteCell.parentElement.parentElement.removeChild(deleteCell.parentElement);
    } 
}

function permissionDelete(deletedUrl, remainingInstances) {
    if (!deletedUrl) return;

    const baseHostToDelete = String(deletedUrl).replace(/\/$/, "");

    const isHostStillUsed = remainingInstances.some(inst => 
        String(inst.url).replace(/\/$/, "") === baseHostToDelete
    );

    if (!isHostStillUsed) {
        const originsToRemove = [
            `*://${baseHostToDelete}/*`,
            `*://${baseHostToDelete}:*/*`
        ];
        
        chrome.permissions.remove({ origins: originsToRemove }, (removed) => {
            if (removed) {
                console.log(`Permissions revoked for ${baseHostToDelete}`);
            }
            if(chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ type: "update-scripts" }).catch(() => {});
            }
        });
    } else {
        console.log(`Host ${baseHostToDelete} still in use. Keeping permissions.`);
        if(chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "update-scripts" }).catch(() => {});
        }
    }
}

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

    let li = Document.createElement('li');
    li.append(closeBtnDelete);
    messageBtnBar.appendChild(li);
    return closeBtnDelete;
}

function messageButtonBar(Document, messageId) {
    let messageBtnBar = Document.createElement('ul');
    messageBtnBar.classList.add("messageBtnBar");
    messageBtnBar.id = "buttonBar" + String(messageId);
    return messageBtnBar;
}

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
    });

    namespaceTable = document.createElement("table");
    tableContainer.appendChild(namespaceTable);
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

    if ((instance.namespaces == undefined) || (instance.namespaces.length == 0)) {
        let newNamespaceRow = createNewNamespaceRow(namespaceTable, instance);
        return;
    } 

    for (let i = 0; i < instance.namespaces.length; i++) {
        let namespaceRow = namespaceTable.insertRow();
        namespaceRow.parentRow = instance.url;
        namespaceRow.classList.add(instance.url);
        
        let namespaceRowName = namespaceRow.insertCell();
        let namespaceRowURL = namespaceRow.insertCell();
        let namespaceRowColour = namespaceRow.insertCell();
        let namespaceRowDelete = namespaceRow.insertCell();

        namespaceRowName.title = namespaceNameTitle;
        namespaceRowURL.title = namespaceURLTitle;
        namespaceRowColour.title = namespaceColourTitle;
        namespaceRowDelete.title = namespaceDeleteTitle;
        
        namespaceRow.instanceReference = instance;
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
                
        if ((instance.namespaces[i].colour == undefined) || (instance.namespaces[i].colour == "") || (instance.namespaces[i].colour == "Inherit")) {
            for (let y = 0; y < selector.options.length; y ++) {
                if (selector.options[y].value == "Inherit") {
                    selector.options[y].selected = true;
                }
            }
        } else {
            for (let y = 0; y < selector.options.length; y ++) {
                if (selector.options[y].value == instance.namespaces[i].colour) {
                    selector.options[y].selected = true;
                }
            }
        }
        
        selector.onchange = function () { endEdit(this); };
        namespaceRowDelete.textContent = "DELETE";
        
        namespaceRowName.onclick = function () { beginEdit(this); };
        namespaceRowURL.onclick = function () { beginEdit(this); };
        namespaceRowColour.onclick = function () { beginEditColour(this); };
        namespaceRowDelete.onclick = function () { deleteNamespace(this); };
        document.addEventListener("colourChange", function() {
            let newSelector = createColourSelector("namespace");
            selector.replaceWith(newSelector);
            colourSelectorOption(newSelector);
            newSelector.onchange = function () { endEdit(this); };
        });
    }
    let newNamespaceRow = createNewNamespaceRow(namespaceTable, instance);
}

function colourSelectorOption(selector) {
    let colour;
    if ((selector.parentElement != undefined) && (selector.parentElement.parentElement.instanceReference != undefined)) {
        colour = selector.parentElement.parentElement.instanceReference.colour;
    }

    for (let y = 0; y < selector.options.length; y ++) {
        if (selector.options[y].value == colour) {
            selector.options[y].selected = true;
            return;
        }
    }
}

function createColourSelector(type = "instance") {
    let selector = document.createElement('select');
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
        if (defaultColours.includes(colour.name)) return;
        var colourOption = document.createElement('option');
        let colourOptionText = document.createTextNode(colour.name);
        colourOption.appendChild(colourOptionText);
        selector.appendChild(colourOption);
    });
    
    return selector;
}

function deleteNamespace(deleteCell) {
    if (confirm("Delete namespace?")) {
        let instance = deleteCell.parentElement.instanceReference;
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

function createNewNamespaceRow(namespaceTable, instance, instanceRow, index = 0) {
    let newNamespaceRow;
    if (index == 0) {
        newNamespaceRow = namespaceTable.insertRow();
    } else {
        newNamespaceRow = namespaceTable.insertRow();
    }

    newNamespaceRow.classList.add(instance.url);
    newNamespaceRow.style.display = "";

    let newName = newNamespaceRow.insertCell();
    let newNamespace = newNamespaceRow.insertCell();
    let newColour = newNamespaceRow.insertCell();
    let newDelete = newNamespaceRow.insertCell();
    
    newName.parentRow = instanceRow;
    
    newNamespace.style.display = "none";
    newColour.style.display = "none";
    newDelete.style.display = "none";
    
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
        let newSelector = createColourSelector("namespace");
        selector.replaceWith(newSelector);
        colourSelectorOption(newSelector);
        newSelector.onchange = function () { endEdit(this); };
    });
    
    newNamespaceRow.instanceReference = instance;
    
    newName.onclick = function () { beginEdit(this); };
    newNamespace.onclick = function () { beginEdit(this); };
    newColour.onclick = function () { beginEditColour(this); };
    newDelete.onclick = function () { deleteNamespace(this); };
    
    return newNamespaceRow;
}

var oldColor, oldText, padTop, padBottom = "";

function beginEditColour(td) {
    if (td.firstChild && td.firstChild.tagName == "INPUT") return;
    
    oldText = td.innerHTML.trim();
    oldColor = td.style.backgroundColor;
    padTop = td.style.paddingTop;
    padBottom = td.style.paddingBottom;
}

function beginEdit(td) {
    if (td.firstChild && td.firstChild.tagName == "INPUT") return;
    
    td.classList.remove("newInstanceField");
    td.classList.remove("newNamespaceField");
    oldText = td.innerHTML.trim();
    oldColor = td.style.backgroundColor;
    
    let input = document.createElement("input");
    input.value = oldText;
    input.style.border = "0px";
    input.style.fontFamily = "inherit";
    input.style.fontSize = "inherit";
    input.style.textAlign = "inherit";
    input.style.backgroundColor = "LightGoldenRodYellow";

    td.innerHTML = "";
    td.style.backgroundColor = "LightGoldenRodYellow";
    td.insertBefore(input, td.firstChild);
    
    if (input.localName == "select") {
        input.onchange = function () { endEdit(this); };
    } else {
        input.onblur = function () { endEdit(this); };
        input.select();
    }
}

function endEdit(input) {
    var td = input.parentNode;
    if (td.key == "namespaceNamespace") {
        let namespaceURL = namespaceURLValidation(td, input.value);
        if (namespaceURL == "") {
            td.style.color = "red";
            return;
        }
        input.value = namespaceURL;
        
    } else if (td.key == "url") {
        let instanceUrl = instanceURLValidation(td, input.value);
        if (instanceUrl == "") {
            td.style.color = "red";
            return;
        }
        input.value = instanceUrl;
    }
    
    if (input.localName == "select") {
        // Skip
    } else {
        td.removeChild(td.firstChild);  //remove input
        td.innerHTML = input.value;
        if (oldText != input.value.trim() ) {
            td.style.color = "green";
            delay(2000).then(() => {
                td.style.color = "";
            });
        } else {
            return;
        }
        td.style.backgroundColor = oldColor;
    }
    
    // UPDATE OUR INSTANCES OBJECT
    if (td.parentElement.instanceReference != undefined) {
        for (let i = 0; i < instances.length; i++) {
            if (instances[i].name == td.parentElement.instanceReference.name) {             
                
                if (td.key.includes("namespace")) {
                    for (let x = 0; x < instances[i].namespaces.length; x++) {
                        if (td.key == "namespaceName") {
                            if (oldText == instances[i].namespaces[x].name) {
                                instances[i].namespaces[x].name = input.value;
                                td.parentElement.namespaceReference = instances[i].namespaces[x];
                                updateReferenceInstances(instances[i]);
                                autoSaveInstances();
                                return;
                            }
                        } else if (td.key == "namespaceNamespace") {
                            if (oldText == instances[i].namespaces[x].namespace) {
                                instances[i].namespaces[x].namespace = input.value;
                                td.parentElement.namespaceReference = instances[i].namespaces[x];
                                updateReferenceInstances(instances[i]);
                                autoSaveInstances();
                                return;
                            }
                        } else if (td.key == "namespaceColour") {
                            if (td.previousSibling.textContent == instances[i].namespaces[x].namespace) {
                                instances[i].namespaces[x].colour = input.value;
                                td.parentElement.namespaceReference = instances[i].namespaces[x];
                                updateReferenceInstances(instances[i]);
                                autoSaveInstances();
                                return;
                            }
                        }
                    }
                    
                    // new namespace
                    td.nextElementSibling.style.display = "";
                    td.nextElementSibling.nextElementSibling.style.display = "";
                    td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
                    let newNamespace = {name: input.value, namespace: "", colour: ""};
                    instances[i].namespaces.push(newNamespace);
                    td.namespaceReference = newNamespace;
                    td.parentElement.namespaceReference = newNamespace;
                    td.parentElement.instanceReference = instances[i];
                    td.nextElementSibling.nextElementSibling.namespaceReference = newNamespace;
                    td.nextElementSibling.nextElementSibling.nextElementSibling.namespaceReference = newNamespace;
                    
                    let instanceRow = td.parentElement.parentRow;
                    let newNamespaceRow = createNewNamespaceRow(namespaceTable, instances[i], instanceRow, td.parentElement.rowIndex + 1);

                    newNamespaceRow.style.display = "";
                    updateReferenceInstances(instances[i]);
                    autoSaveInstances();
                    return;
                    
                } else {
                    // Instance Changes
                    if (td.key == "name") {
                        instances[i].name = input.value;
                        td.parentElement.instanceReference = instances[i];
                        updateReferenceInstances(instances[i]);
                        autoSaveInstances();
                        return;
                    } else if (td.key == "url") {
                        instances[i].url = input.value;
                        td.parentElement.instanceReference = instances[i];
                        td.parentElement.classList.add(instances[i].url);
                        updateReferenceInstances(instances[i], oldText);
                        permissionsUpdate(instances, i);
                        autoSaveInstances();
                        return;
                    } else if (td.key == "colour") { 
                        instances[i].colour = input.value;
                        td.parentElement.instanceReference = instances[i];
                        updateReferenceInstances(instances[i]);
                        autoSaveInstances();
                        return;
                    }
                }
            }
        }
    } else {
        // create NEW instance
        if (instances[0] == undefined) {
            instances = [];
        }
        let newInstance = instances.push({name: input.value, url: "", namespaces: [], colour: "grey"});
        td.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
        td.parentElement.instanceReference = instances[newInstance-1];
        
        createInstanceRow();
    }
}

function permissionsUpdate(instances, i) {
    let baseHost = String(instances[i].url).replace(/\/$/, ""); 
    const originsToRequest = [
        `*://${baseHost}/*`,
        `*://${baseHost}:*/*`
    ];

    chrome.permissions.contains({ origins: originsToRequest }, (result) => {
        if (result) {
            console.log("Permission already granted.");
            if(chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ type: "update-scripts" }).catch(() => {});
            }
        } else {
            console.log("Requesting permission...");
            chrome.permissions.request({ origins: originsToRequest }, (granted) => {
                if (granted) {
                    console.log("Permission granted!");
                    if(chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ type: "update-scripts" }).catch(() => {});
                    }
                } else {
                    console.log("Permission denied by user.");
                    alert("Permission is required to enable IRIS Whiz on this URL.");
                }
            });
        }
    });
}

function namespaceURLValidation(td, newNamespaceSlug) {
    let error = "";
    let instanceSelect = td.parentElement.instanceReference.name;
    let namespaceSelect = td.parentElement.namespaceReference.name;
    let instancesLength = instances.length;
    
    for (var i = 0; i < instancesLength; i ++ ){ 
        if (instances[i].name == instanceSelect) {
            let namespacesLength = instances[i].namespaces.length;
            for (var x = 0; x < namespacesLength; x++ ){
                if ((newNamespaceSlug == instances[i].namespaces[x].namespace) && (namespaceSelect != instances[i].namespaces[x].name))  {
                        error = "Namespace slug '" + newNamespaceSlug + "' already in use for '" + instances[i].namespaces[x].name + "'.";
                        errorAlert(error);
                        return "";
                }
            }
        }
    }
    
    if (newNamespaceSlug.includes(" ")) {
        errorAlert("Namespace URL Slug cannot contain spaces");
        return "";
    }
    
    if (newNamespaceSlug.includes("/")) {
        newNamespaceSlug = newNamespaceSlug.replaceAll("/", "");
    }
    return newNamespaceSlug;
}

function instanceURLValidation(td, instanceUrl) {
    let error = "";
    let instanceName = td.parentElement.instanceReference.name;
    
    let instancesLength = instances.length;
    for (var i = 0; i < instancesLength; i ++ ){ 
        if (instances[i].url == instanceUrl) {
            if (instanceName != instances[i].name) {
                error = "Instance domain '" + instanceUrl + "' already in use by " + instances[i].name;
                errorAlert(error);
                return "";
            } 
        }
    }
    
    if (instanceUrl.includes(" ")) {
        errorAlert("Instance domain cannot contain spaces");
        return "";
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
    
    return instanceUrl;
}

// Instance referenced by ROW
function updateReferenceInstances(instance, oldUrl = "") {
    let rows;
    if (oldUrl == "") {
        rows = document.getElementsByClassName(instance.url);
        oldUrl = instance.url;
    } else {
        rows = document.getElementsByClassName(oldUrl);
    }
    
    let rowsArray = Array.from(rows);
    const rowsArrayLength = rowsArray.length;
    
    for (let i = 0; i < rowsArrayLength; i ++) {
        rowsArray[i].instanceReference = instance;
        if (instance.url == oldUrl) return;
        
        rowsArray[i].classList.remove(oldUrl);
        rowsArray[i].classList.add(instance.url);
    }   
}

function autoSaveInstances() {
    chrome.storage.local.set({instances: instances}, function() {
        successAlert("Instances Saved");
        if (instanceAlert) {
            if (instances.length == 0) {
                instanceAlert.style.display = "block";
            } else {
                instanceAlert.style.display = "none";
            }
        }
    });
}

// =========================================================================
// CUSTOM COLOURS
// =========================================================================

let colourTable;

function createCustomColoursTable() {
    let colourTableDiv = document.getElementById("colourTableDiv");
    if (!colourTableDiv) return;

    colourTable = document.createElement("table");
    colourTableDiv.appendChild(colourTable);
    
    let colourTableHeaders = colourTable.insertRow(0);
    createColourTableHeaders(colourTableHeaders);
    
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
        colourMainColour.textContent = colour.mainColour;
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
    if (td.firstChild && td.firstChild.tagName == "INPUT") return;
    td.classList.remove("newColourField");

    oldText = td.innerHTML.trim();
    oldColor = td.style.backgroundColor;
    padTop = td.style.paddingTop;
    padBottom = td.style.paddingBottom;

    let input = document.createElement("input");
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
}

function endEditCustomColour(input) {
    var td = input.parentNode;
    
    td.removeChild(td.firstChild);
    td.innerHTML = input.value;
    if (oldText != input.value.trim() ) {
        td.style.color = "green";
        delay(2000).then(() => {
            td.style.color = "";
        });
    }

    td.style.paddingTop = padTop;
    td.style.paddingBottom = padBottom;
    td.style.backgroundColor = oldColor;
    td.setAttribute("background-color", oldColor);

    if (td.parentElement.colourReference != "") {
        for (let i = 0; i < settings.CustomColours.length; i++) {
            if (settings.CustomColours[i].name == td.parentElement.colourReference.name) {              
                if (td.key == "name") {
                    if (oldText == settings.CustomColours[i].name) {
                        settings.CustomColours[i].name = input.value;
                        td.parentElement.colourReference = settings.CustomColours[i];
                        autoSaveColours();
                        return;
                    }
                } else if (td.key == "mainColour") {
                    if (td.previousSibling.textContent == settings.CustomColours[i].name) {
                        colouriseColourRow(td.parentElement);
                        settings.CustomColours[i].mainColour = input.value;
                        td.parentElement.colourReference = settings.CustomColours[i];
                        autoSaveColours();
                        return;
                    }
                } else if (td.key == "mainColourBackground") {
                    if (td.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
                        colouriseColourRow(td.parentElement);
                        settings.CustomColours[i].mainColourBackground = input.value;
                        td.parentElement.colourReference = settings.CustomColours[i];
                        autoSaveColours();
                        return;
                    }
                } else if (td.key == "highlightColour") {
                    if (td.previousSibling.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
                        colouriseColourRow(td.parentElement);
                        settings.CustomColours[i].highlightColour = input.value;
                        td.parentElement.colourReference = settings.CustomColours[i];
                        autoSaveColours();
                        return;
                    }
                } else if (td.key == "linkColour") {
                    if (td.previousSibling.previousSibling.previousSibling.previousSibling.textContent == settings.CustomColours[i].name) {
                        colouriseColourRow(td.parentElement);
                        settings.CustomColours[i].linkColour = input.value;
                        td.parentElement.colourReference = settings.CustomColours[i];
                        autoSaveColours();
                        return;
                    }
                }   
            }
        }
    } else {
        if (settings.CustomColours == undefined) {
            settings.CustomColours = [];
        }
        
        td.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
        td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.style.display = "";
        
        let newColour = {name: input.value, mainColour: "", mainColourBackground: "", highlightColour: "", linkColour: ""};
        settings.CustomColours.push(newColour);
        
        td.colourReference = newColour;
        td.parentElement.colourReference = newColour;
        td.nextElementSibling.colourReference = newColour;
        td.nextElementSibling.nextElementSibling.colourReference = newColour;
        td.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
        td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
        td.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.colourReference = newColour;
        
        let newColourRow = createCustomColourRow();
        autoSaveColours();
        return;
    }
}

function colouriseColourRow(row) {
    try {
        row.style.background = row.children[1].innerText;
    } catch {
        row.style.background = row.children[2].innerText;
    }
    row.style.color = row.children[3].innerText;
    row.children[4].style.color = row.children[4].innerText;
}

function autoSaveColours() {
    exportWhiz.settings.CustomColours = settings.CustomColours;
    saveSettings(); // This now automatically updates Chrome storage!
    
    if (settings.CustomColours != undefined) {
        customColours = settings.CustomColours;
    }
    document.dispatchEvent(colourChangeEvent);
}

function deleteCustomColour(deleteCell) {
    if (confirm("Delete colour?")) {
        let colour = deleteCell.parentElement.colourReference;
        
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

let exportBtn = document.getElementById("exportBtn");
if(exportBtn) {
    exportBtn.addEventListener('click', ()=> {
        let exportString = document.getElementById('export').value;
        const blob = new Blob([exportString], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Iris Whizz Config";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// =========================================================================
// TAB SWITCHING 
// =========================================================================

let btnBar = document.getElementById('btnBar');
if(btnBar) {
    for (const button1 of btnBar.children) {
        button1.addEventListener('click', function() { 
            for (const button2 of btnBar.children) { 
                let rowId = button2.id.replaceAll("Btn" , "");
                let row = document.getElementById(rowId);
                if (row) {
                    if (button1 == button2) {
                        buttonSelectColor(button1.id);
                        row.style.display = "grid";
                    } else {
                        row.style.display = "none";
                    }
                }
            }   
        });
    }
}

// Highlight the selected tab
function buttonSelectColor(buttonId) {
    let buttons = document.getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].id == buttonId) {
            buttons[i].style.background = 'white';
            buttons[i].style.borderBottom =  '5px solid white';
        } else {
            buttons[i].style.background = '';
            buttons[i].style.borderBottom =  '';
        }   
    }
}


// Lightweight Markdown to HTML Parser
function parseMarkdown(md) {
    // Normalize Windows line breaks just in case
    md = md.replace(/\r\n/g, '\n');

    // 1. Horizontal Rules (*** or ---)
    md = md.replace(/^\*\*\*$\vert{}^---$/gm, '<hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">');
    
    // 2. Headers
    md = md.replace(/^##### (.*$)/gm, '<h5 style="margin-top: 15px; font-size: 1.1em; color: #555;">$1</h5>');
    md = md.replace(/^#### (.*$)/gm, '<h4 style="margin-top: 15px; font-size: 1.2em;">$1</h4>');
    md = md.replace(/^### (.*$)/gm, '<h3 style="margin-top: 20px;">$1</h3>');
    md = md.replace(/^## (.*$)/gm, '<h2 style="margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px;">$1</h2>');
    md = md.replace(/^# (.*$)/gm, '<h1 style="margin-top: 30px;">$1</h1>');
    
    // 3. Images (e.g., the OEX Shield)
    md = md.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; vertical-align: middle;">');
    
    // 4. Links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #00b2a9; text-decoration: none;">$1</a>');
    
    // 5. Bold & Italic Text
    md = md.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    md = md.replace(/__([^_]+)__/g, '<b>$1</b>');
    md = md.replace(/\*([^*]+)\*/g, '<i>$1</i>');

    // 6. Numbered Lists (Indent them and make the numbers bold!)
    md = md.replace(/^(\d+\.)\s+(.*$)/gm, '<div style="margin-left: 20px; margin-bottom: 4px;"><b>$1</b> $2</div>');
    
    // 7. Paragraphs & Line Breaks 
    md = md.split(/\n\s*\n/).map(p => {
        
        // FIX: Process line breaks (\n to <br>) even if it's attached to a header!
        let formattedBlock = p.replace(/\n/g, '<br>');
        
        // Prevent double-spacing between the list elements we just created
        formattedBlock = formattedBlock.replace(/<\/div><br><div/g, '</div><div');

        if (formattedBlock.trim().startsWith('<h') || formattedBlock.trim().startsWith('<hr')) {
            return formattedBlock;
        }
        return `<p style="line-height: 1.6; color: #333;">${formattedBlock}</p>`;
    }).join('');
    
    return md;
}
