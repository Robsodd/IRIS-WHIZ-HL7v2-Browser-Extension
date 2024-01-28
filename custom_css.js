
let whiz = [];
whiz.settings = {};

let currentNamespaceColour;


chrome.storage.local.get({
			instances: {},
			settings: {},
		}, function(stored) {
			if (stored == undefined) {
				console.log("Settings Storage Undefined", stored_settings);
			} else {
				//console.log("Instances Storage Updated", stored_settings);
				whiz.settings = stored.settings
				whiz.instances = stored.instances
				
				console.log("checking namespace");
				// Apply Namespace colours
				for (let i = 0 ; i < whiz.instances.length; i++) {
				
					if (currentUrl.includes(whiz.instances[i].url)) {
						let currentNamespace = getCurrentNamespace(whiz.instances[i])
						if (currentNamespace != "") {
							console.log("currentNamespace", currentNamespace);	
							// Inherit = do nothing right now
							if ((currentNamespace.colour == "Inherit") || (currentNamespace.colour == "")) {
								break
							} else {
								//NExt, Iterate through colours, find matching and apply custom
								console.log("Namespace: Apply Colour");
								applyCustomColour(currentNamespace.colour);
								// Current problem.
								// IF the selected colour is a default colour and there is no custom colour by that name, it currently does nothing.

								return
							}
						} else {
							//currentNamespace unknown
						}
					}
				}
				
				console.log("checking instance");
				// Apply instance colours
				for (let i = 0 ; i < whiz.instances.length; i++) {
				
					if (currentUrl.includes(whiz.instances[i].url)) {
						// iterate through colour settings and apply
						console.log("Instance: Apply Colour");
						applyCustomColour(whiz.instances[i].colour);
						return
					}
				}
				
			}
			//CustomColoursCSS();
});


function applyCustomColour(colour) {
	
	for (let i = 0; i < whiz.settings.CustomColours.length; i ++) {
		if (colour == whiz.settings.CustomColours[i].name) {
			console.log("applying: whiz.settings.CustomColours[i].mainColour", whiz.settings.CustomColours[i].mainColour);
			var r = document.querySelector(':root');
			r.style.setProperty('--main-colour', whiz.settings.CustomColours[i].mainColour);
			r.style.setProperty('--main-colour-background', whiz.settings.CustomColours[i].mainColourBackground);
			r.style.setProperty('--highlight-colour', whiz.settings.CustomColours[i].highlightColour);
			r.style.setProperty('--link-colour', whiz.settings.CustomColours[i].linkColour);
			return
		}
	}
	
	
	
}





function getCurrentNamespace(instance) {
	// FIND THE NAMESPACE
	// Namespace could be:
	// 1. capitalised at the end of the url            =NAMESPACE=MY_NAMESPACE
	// 2. capitalised between '=' and '&'              =NAMESPACE=MY_NAMESPACE&
	// 3. lower case between the 2nd and 3rd '/'       /csp/healthshare/my_namespace/
	// 4. capitalised between '=' and '#'              $NAMESPACE=MY_NAMESPACE#
	let url = currentUrl
	let one = url.slice(url.search("NAMESPACE=")+10).toUpperCase() 
	let two = url.slice(0, one.search("&")).toUpperCase()
	let three = url.split("/EnsPortal.")[0].split("/").slice(-1)[0].toUpperCase()
	//let prep_three = url.slice(url.search("/csp/healthshare/")+17).toUpperCase()
	//let three = prep_three.slice(0, prep_three.search("/")).toUpperCase()
	let four = one.slice(0, one.search("&")).toUpperCase() 
	
	for (let x = 0; x < instance.namespaces.length; x ++) {
		let compare = instance.namespaces[x].namespace.toUpperCase() 
		//console.log("COMPARE '", compare, "' with: ", one, two, three, four);
		// Check if Tab's URL matches a predefined group
		if ((one == compare) || (two == compare) || (three == compare)|| (four == compare)) {	
			match = true
			let colour
			if ((instance.namespaces[x].colour == undefined) || (instance.namespaces[x].colour == "Inherit") || (instance.namespaces[x].colour == instance.colour)) {
				colour = "Inherit"
			} else {
				colour = instance.namespaces[x].colour
			}
					
			tab_group_name = instance.name + " " + instance.namespaces[x].name
			//console.log("Namespace Tab Group:", tab_group_name, colour);						
			return {name: tab_group_name, colour:  colour}
		}
	}
	return ""
	
}


/*
whiz.settings.redMain = "rgb(0,255,0)";
whiz.settings.redHighlight = "rgb(0,0,0)";
whiz.settings.redLink = "rgb(0,0,255)";
*/

		

// Get the root element 
/*
var r = document.querySelector(':root');
r.style.setProperty('--main-colour', whiz.settings.redMain);
r.style.setProperty('--highlight-colour', whiz.settings.redHighlight);
r.style.setProperty('--link-colour', whiz.settings.redLink);*/


//var sheet = document.styleSheets[0];
//sheet.insertRule(":root{--main-colour: 0,0,0; --highlight-colour: 255,255,255; --link-colour: 0,255,216;}");

/*
// Create a function for getting a variable value
function myFunction_get() {
  // Get the styles (properties and values) for the root
  var rs = getComputedStyle(r);
  // Alert the value of the --blue variable
  alert("The value of --blue is: " + rs.getPropertyValue('--main-colour'));
}

// Create a function for setting a variable value
function myFunction_set() {
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty('--main-colour', 'red');
}

myFunction_set();

console.log("done?");

*/