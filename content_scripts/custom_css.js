let whiz = {}; // Fixed: Declared as an Object instead of an Array
whiz.settings = {};
whiz.instances = [];

let currentNamespaceColour;
//let currentUrl = window.location.href; // FIXED: Explicitly define the URL for this scope!

chrome.storage.local.get({
    instances: [], // Fixed: Default to empty array instead of empty object
    settings: {},
}, function(stored) {
    if (!stored || Object.keys(stored).length === 0) {
        console.log("Settings Storage Undefined");
        return;
    } 
    
    whiz.settings = stored.settings;
    whiz.instances = stored.instances;
    
    if (!whiz.instances || whiz.instances.length === 0) return;
    
    console.log("checking namespace");
    // Apply Namespace colours
    for (let i = 0 ; i < whiz.instances.length; i++) {
        if (whiz.instances[i].url && currentUrl.includes(whiz.instances[i].url)) {
            let currentNamespace = getCurrentNamespace(whiz.instances[i]);
            
            if (currentNamespace != "") {
                console.log("currentNamespace", currentNamespace);  
                
                // Inherit = do nothing right now
                if ((currentNamespace.colour == "Inherit") || (currentNamespace.colour == "")) {
                    break;
                } else {
                    console.log("Namespace: Apply Colour");
                    applyCustomColour(currentNamespace.colour);
                    return; // Stop after finding the namespace
                }
            }
        }
    }
    
    console.log("checking instance");
    // Apply instance colours
    for (let i = 0 ; i < whiz.instances.length; i++) {
        if (whiz.instances[i].url && currentUrl.includes(whiz.instances[i].url)) {
            console.log("Instance: Apply Colour");
            applyCustomColour(whiz.instances[i].colour);
            return;
        }
    }
});


function applyCustomColour(colour) {
    // Safety check: ensure CustomColours actually exists before looping
    if (!whiz.settings.CustomColours) return; 

    for (let i = 0; i < whiz.settings.CustomColours.length; i ++) {
        if (colour == whiz.settings.CustomColours[i].name) {
            console.log("applying: whiz.settings.CustomColours[i].mainColour", whiz.settings.CustomColours[i].mainColour);
            
            // Safer to use documentElement at document_start than querySelector
            var r = document.documentElement; 
            if (r) {
                r.style.setProperty('--main-colour', whiz.settings.CustomColours[i].mainColour);
                r.style.setProperty('--main-colour-background', whiz.settings.CustomColours[i].mainColourBackground);
                r.style.setProperty('--highlight-colour', whiz.settings.CustomColours[i].highlightColour);
                r.style.setProperty('--link-colour', whiz.settings.CustomColours[i].linkColour);
            }
            return;
        }
    }
}


function getCurrentNamespace(instance) {
    let url = currentUrl;
    let one = "", two = "", three = "", four = "";

    // Safely parse the URL without throwing arbitrary slicing errors
    try {
        if (url.includes("NAMESPACE=")) {
            let nsPart = url.split("NAMESPACE=")[1].toUpperCase();
            one = nsPart;
            two = nsPart.split("&")[0];
            four = nsPart.split("#")[0];
        }
        if (url.includes("/EnsPortal.")) {
            let parts = url.split("/EnsPortal.")[0].split("/");
            three = parts[parts.length - 1].toUpperCase();
        }
    } catch(e) {
        console.warn("Error parsing URL namespaces", e);
    }
    
    for (let x = 0; x < instance.namespaces.length; x ++) {
        let compare = instance.namespaces[x].namespace.toUpperCase();
        
        if ((one == compare) || (two == compare) || (three == compare)|| (four == compare)) { 
            let match = true; // Fixed: Added 'let'
            let colour;
            
            if ((instance.namespaces[x].colour == undefined) || (instance.namespaces[x].colour == "Inherit") || (instance.namespaces[x].colour == instance.colour)) {
                colour = "Inherit";
            } else {
                colour = instance.namespaces[x].colour;
            }
                    
            let tab_group_name = instance.name + " " + instance.namespaces[x].name; // Fixed: Added 'let'
            return {name: tab_group_name, colour: colour};
        }
    }
    return "";
}
