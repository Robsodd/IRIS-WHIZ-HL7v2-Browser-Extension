console.log("Background Script Running");

// CHROME STORAGE
let instances = []
let settings = {
			AutoTab: false,
			AutoTabNameSpace: false,
			CSS: false,
		}

// Get the instances object on Extension load
chrome.storage.local.get(['instances'], function(stored) {
	if (stored == undefined) {
		instances = []
	} else {
		instances = stored.instances
	}
	
});

// Get the settings object on Extension load
chrome.storage.local.get({
			AutoTab: false,
			AutoTabNameSpace: false,
			CSS: false,
		}, function(stored_settings) {
			if (stored_settings == undefined) {
				//console.log("Instances Storage Updated", stored_settings);
			} else {
				//console.log("Instances Storage Updated", stored_settings);
				settings = stored_settings
			}
});


// Refresh content scripts on Extension load.
// update_content_scripts();


// When changes are made to the Instances object on the settings page, make them here also.
chrome.storage.onChanged.addListener(function(changes, areaName) {
	console.log("Storage Updated, retrieving updated objects");
	if (areaName == "local") {
		chrome.storage.local.get(['instances'], function(stored) {
			if (stored == undefined) {
				//console.log("Instances Storage Updated", stored);
				instances = []
			} else {
				//console.log("Instances Storage Updated", stored);
				instances = stored.instances
				update_content_scripts();
			}
		});
		chrome.storage.local.get({
			AutoTab: false,
			AutoTabNameSpace: false,
			CSS: false,
		}, function(stored_settings) {
			if (stored_settings == undefined) {
				//console.log("Instances Storage Updated", stored_settings);
			} else {
				//console.log("Instances Storage Updated", stored_settings);
				settings = stored_settings
			}
		});
		
	}
});

// Update open tab's tab group on page update 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		//console.log("change info", changeInfo);
		if (changeInfo.status == "complete") {
			AutoTab(tab);
		}	
});

// Update new tab's tab group on page creation
chrome.tabs.onCreated.addListener(function(tab) {    
	AutoTab(tab);
});


/// AutoTab V3
function AutoTab(tab) {
	// Get AutoTab setting
	chrome.storage.local.get({AutoTab: false}, function(settings) {
		if (settings.AutoTab) {
			console.log("Automatically adding tab to relevant tab group");
			let tab_group = identify_tab_group(tab)
			//console.log(tab_group);
			if (tab_group) {
				// get currently open groups
				/// TODO - If page is refreshing and you switch your active window, the tab group hops over to the new window
				//chrome.tabGroups.query({windowId: chrome.windows.WINDOW_ID_CURRENT})
				chrome.tabGroups.query({windowId: tab.windowId})
				.then((current_window_groups) => {		
					// Check to see if a relevant group exists
					for (let i = 0; i < current_window_groups.length; i++) {
						//console.log("current_window_groups[i]: ", current_window_groups[i]);
						//console.log("tab_group.name: ", tab_group.name);
						if (current_window_groups[i].title == tab_group.name) {
							
							// Update Tab Group
							chrome.tabGroups.update(current_window_groups[i].id, {title: tab_group.name, color: tab_group.colour})	
							
							// Add Tab to Tab Group
							chrome.tabs.group({groupId: current_window_groups[i].id, tabIds: tab.id})
							.catch((error) => {
								console.log("Could not add tab to a tab group: ", error); 
							})
							return true
						}
					}
					// No tab group exists so create a new tab group (also adds the tab to it)
					createTabGroup(tab.id, tab_group);
				});
			}
		}
	});
}


/// AutoTab V3
function identify_tab_group(tab) {
	var url = tab.url
	var tabId = tab.id
	var groupId = tab.groupId
	let match = false
	console.log("Current URL: ", tab.url);
	for (let i = 0; i < instances.length; i ++ ){
		if (match) {
			break			
		}
		console.log("Instance URL: ", instances[i].url)
		if (!url.includes(instances[i].url)) {
				// URL not found
		}
		else 
		{
			if (settings.AutoTabNameSpace) {
				//console.log(instances[i].name + "= TRUE")
				for (let x = 0; x < instances[i].namespaces.length; x ++ ){
					if (match) {
						break			
					}
					//console.log(instances[i].namespaces[x]);
					//console.log("check #i", i, "-x", x, instances[i].namespaces[x].namespace)
					let namespace_upper = instances[i].namespaces[x].namespace.toUpperCase()
					
					// FIND THE NAMESPACE
					// Namespace could be:
					// 1. capitalised at the end of the url            =NAMESPACE=MY_NAMESPACE
					// 2. capitalised between '=' and '&'              =NAMESPACE=MY_NAMESPACE&
					// 3. lower case between the 2nd and 3rd '/'       /csp/healthshare/my_namespace/
					// 4. capitalised between '=' and '#'              $NAMESPACE=MY_NAMESPACE#

					let one = url.slice(url.search("NAMESPACE=")+10).toUpperCase() 
					let two = url.slice(0, one.search("&")).toUpperCase()
					let three = url.split("/EnsPortal.")[0].split("/").slice(-1)[0].toUpperCase()
					//let prep_three = url.slice(url.search("/csp/healthshare/")+17).toUpperCase()
					//let three = prep_three.slice(0, prep_three.search("/")).toUpperCase()
					let four = one.slice(0, one.search("&")).toUpperCase() 
					let compare = instances[i].namespaces[x].namespace.toUpperCase() 
					//console.log("COMPARE '", compare, "' with: ", one, two, three, four);
					// Check if Tab's URL matches a predefined group
					if ((one == compare) || (two == compare) || (three == compare)|| (four == compare)) {	
						match = true
							
						let colour = instances[i].colour		
						tab_group_name = instances[i].name + " " + instances[i].namespaces[x].name
						//console.log("Namespace Tab Group:", tab_group_name, colour);						
						return {name: tab_group_name, colour:  colour}
					}
				}
				
				let colour = instances[i].colour		
				tab_group_name = instances[i].name
				//console.log("No Tab Found, Using Default Tab Group:", tab_group_name, colour)					
				return {name: tab_group_name, colour:  colour}
				
			} else {
				match = true
				
				let colour = instances[i].colour		
				tab_group_name = instances[i].name
				//console.log("Instance Tab Group:", tab_group_name, colour)					
				return {name: tab_group_name, colour:  colour}
				
			}
			
		}
	}
	return false	
}


/// AutoTab V3
function createTabGroup(tabId, tab_group) {
	/// Create the group
	chrome.tabs.group({tabIds: tabId})
	.then((new_group) => {
		chrome.tabGroups.update(new_group, {title: tab_group.name, color: tab_group.colour})	
		}
	)
}


/// Bookmarks V1
// Create bookmarks on extension load.
chrome.bookmarks.search({title: 'TIE Links'})
	.then((bookmark) => {
		
		
		//console.log("bookmark:" , bookmark)
		if (bookmark.length > 0) {
			//console.log('Bookmark folder found', bookmark);		
		} else {
			//console.log('Bookmark folder not found', bookmark);		
			chrome.bookmarks.create(
				{'parentId': "1", title: 'TIE Links'},
			).then((bookmarkRoot) => {
			;
			for (var i = 0; i < instances.length; i ++) {
				chrome.bookmarks.create(
					{'parentId': bookmarkRoot.id, 'title': String(i)}, // Bit hacky but it was an easy way to pass i with the promise...
				).then((groupFolder) => {
					for (var x = 0; x < instances[groupFolder.title].namespaces.length; x ++ ){
						chrome.bookmarks.create(
							{'parentId': groupFolder.id, 'title': instances[groupFolder.title].namespaces[x].name, 'url': 'http://'+instances[groupFolder.title].url + ':57772/csp/healthshare/' + instances[groupFolder.title].namespaces[x].namespace + '/EnsPortal.ProductionConfig.zen?'},
						);
					}
					// Update the groupFolder folder name.
					let changes = {title: instances[groupFolder.title].name}
					chrome.bookmarks.update(
						String(groupFolder.id), changes,
					);
					
				});	
			}
			});
		}
	});



// Context Menu Listeners:

// Add search item context menus on installation
chrome.runtime.onInstalled.addListener(() => {
	search_item_context_menu();
	pdf_viewer_context_menu();
});

/// Search item context menu
function search_item_context_menu() {
	console.log("searchItem context menu created");
	chrome.contextMenus.create({
		"id": "searchItem",
		"title": "Search in message viewer",
		"contexts": ["link"]
	});
	chrome.contextMenus.create({
		"id": "searchItem_0",
		"title": "Search today in message viewer",
		"contexts": ["link"]
	});
		chrome.contextMenus.create({
		"id": "searchItem_1",
		"title": "Search yesterday in message viewer",
		"contexts": ["link"]
	});
	chrome.contextMenus.create({
		"id": "searchItem_7",
		"title": "Search last 7 days in message viewer",
		"contexts": ["link"]
	});
		chrome.contextMenus.create({
		"id": "searchItem_14",
		"title": "Search last 14 days in message viewer",
		"contexts": ["link"]
	});
}

/// PDF Viewer context menu
function pdf_viewer_context_menu() {
	console.log("pdfViewer context menu created");
	chrome.contextMenus.create({
		"id": "pdfViewer",
		"title": "Open as PDF",
		"contexts": ["selection"]
	});
}


chrome.contextMenus.onClicked.addListener(function(clickData, tab){
		console.log("Menu Clicked", clickData);
	  
		// Context Menu - Maessage Search option
		if (clickData.menuItemId.includes("searchItem")){
			
			let searchTriggerDomain = tab.url.split("EnsPortal")
			let searchTriggerURL = searchTriggerDomain[0] + "EnsPortal.MessageViewer.zen"
			
			let search_type = clickData.menuItemId
			console.log("linkUrl", clickData.linkUrl);
			console.log("selectionText", clickData.selectionText);
			let value = clickData.selectionText
			let str = clickData.linkUrl
			let schema = str.slice(str.indexOf("SS:")+3, str.indexOf("%3A"))
			let segment = str.slice(str.indexOf("%3A")+3, str.indexOf("%3A")+6)
			let field = str.slice(str.lastIndexOf("#")+1)
			console.log("schema", schema);
			console.log("segment", segment);
			console.log("field", field);
		  
			// If already on Message Search Page, trigger Search
			if (clickData.pageUrl.includes("EnsPortal.MessageViewer.zen")) {
				chrome.tabs.sendMessage(tab.id, {type: "message_search", schema: schema, segment: segment, field: field, value: value, search_type: search_type}, function(response) {
					console.log("response", response);
				});
			// Else, open new Message Search Page and trigger search there
			} else {

				let new_tab_url = searchTriggerURL + '?MESSAGE_SEARCH=true&schema='+ schema + '&segment=' + segment + '&field=' + field + '&value=' + value + '&search_type=' + search_type
				
				chrome.tabs.create({
					url: new_tab_url
				});
								
			}
		} else if (clickData.menuItemId.includes("pdfViewer")) {
			chrome.tabs.sendMessage(tab.id, {type: "pdf_viewer", selectionText: clickData.selectionText}, function(response) {
					console.log("response", response);
			});
		}
	});
	
// Content Scripts

const messageSearch = {
						matches: ["*://*/csp/*/EnsPortal*",],
						excludeMatches: [
											"*://*/csp/*/EnsPortal.ProductionConfig.zen*",
										],
						allFrames: true,
						js: ["message_search.js"],
						id: "message_search",
				}		
const schemaExpansion = {
						matches: ["*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*",],
						excludeMatches: [
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*",
										],
						allFrames: true,
						js: ["schema_expansion.js"],
						id: "schema_expansion",
				}
const textCompare = {
						matches: ["*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*",],
						excludeMatches: [
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&text_compare=disable*",
										],
						allFrames: true,
						js: ["text_compare.js"],
						id: "text_compare",
				}		
const copyRawText = {
						matches: ["*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*",],
						excludeMatches: [
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&copy_raw_text=disable*",
										],
						allFrames: true,
						js: ["copy_raw_text.js"],
						id: "copy_raw_text",
				}
const traceViewer = {
						matches: ["*://*/csp/*/EnsPortal.VisualTrace.zen?SESSIONID=*",],
						allFrames: true,
						js: ["trace_viewer.js"],
						id: "trace_viewer",
				}		
const messageViewer = {
						matches: ["*://*/csp/*/EnsPortal.MessageViewer.zen*",],
						allFrames: true,
						js: ["message_viewer.js"],
						id: "message_viewer",
				}
				
const criteriaCache = {
						matches: ["*://*/csp/*/EnsPortal.MessageViewer.zen*",],
						allFrames: true,
						js: ["criteria_cache.js"],
						id: "criteria_cache",
				}			
				
const shareMessages = {
						matches: ["*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&share=1*",],
						allFrames: true,
						js: ["share_messages.js"],
						id: "share_messages",
				}			
const componentReport = {
						matches: [
									"*://*/csp/sys/%25CSP.Portal.Home.zen*",
									"*://*/csp/sys/UtilHome.csp",
								],
						allFrames: false,
						js: ["component_report.js"],
						id: "component_report",
				}
				
const pdfViewer = {
						matches: ["*://*/csp/*",],
						allFrames: true,
						js: ["pdf_viewer.js"],
						id: "pdf_viewer",
				}
				
const saveMessageViewer = {
						matches: ["*://*/csp/*/EnsPortal.MessageViewer.zen*",],
						allFrames: true,
						js: ["save_message_viewer.js"],
						id: "save_message_viewer",
				}
				
const utils = {
						matches: ["*://*/csp/*",],
						allFrames: true,
						js: ["utils.js"],
						id: "utils",
						runAt: "document_start",
				}

/// Add Content Scripts functionality
function update_content_scripts() {

	chrome.storage.local.get({
		CSS: false,
		HomepageReports: false,
		},	function(settings) {
			console.log("Content Script Settings: ", settings);							

			chrome.scripting.unregisterContentScripts().then(() => {
				
				chrome.scripting.registerContentScripts(
				[ utils, messageSearch, schemaExpansion, textCompare, copyRawText, traceViewer, messageViewer, criteriaCache, shareMessages, pdfViewer, saveMessageViewer],
					() => { 
						
						if (settings.HomepageReports) {
							chrome.scripting.registerContentScripts(
								[componentReport],
								() => { 
									console.log("Homepage Reports Loaded")
								});
						}
						
						
						console.log("Generic Content Scripts Loaded");
					});

				
				// Add Generic Content Scripts
				
				
				
				// Add instance specific content scripts
				if (settings.CSS) {
					chrome.storage.local.get(['instances'], function(stored) {
						let instances = stored.instances
						for (var i = 0; i < instances.length; i ++ ){
							let scriptId = instances[i].name + "CSS"
							let colour = "css/" + instances[i].colour + ".css"
							let url = "*://" + String(instances[i].url) + "/*"
							let url2 = "*://" + String(instances[i].url) + ":*/*"
							chrome.scripting.registerContentScripts(
							[{
									matches: [url, url2,],
									allFrames: true,
									css: [colour],
									id: scriptId,
							}],
							() => { 
								console.log("CSS Content Script Added");
							});

								
							}
					});
				}

			});
		}
			
	);
}





// Listen for Message to get all Message Tabs
// Iterate through current tabs
// Get the MESSAGE tabs
// Send list of tabs with IDs back

chrome.runtime.onInstalled.addListener(() => {
	update_content_scripts();
});


chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log("REQUEST TYPE: ", request.type, request);
			
			// Process on-page context menu message searches
			if (request.type == "message_tab_search") {
				console.log("message_tab_search triggered");
				//update_dateTime(request.search_type);
				//add_criterion(request);
				
				// Update custom group with IDs for any already made
				chrome.tabs.query({currentWindow: true})
					.then((tabs) => {
						if (!tabs.length) return;
						let matching_tabs = []										
						for (let i = 0; i < tabs.length; i++) {
							if (tabs[i].id == sender.tab.id) {
								// Don't return the tab that the request comes from
							} else {
								if ((tabs[i].url.includes("/EnsPortal.MessageContents.zen")) && (!tabs[i].url.includes("&RAW=1"))) {  
									// add tab to list to send back
									// Get namespace
									let url_path = tabs[i].url.split("/csp/")
									let namespace = url_path[1].split("/")
									let messageHeaderNumber = url_path[1].split("?HeaderClass=Ens.MessageHeader&HeaderId=")
									let instance = tabs[i].url.split("://").slice(1)[0].split(":")[0]
									if (instance == undefined) {
										instance = tabs[i].url.split("://").slice(1)[0].split("/")[0]
									}
									// Get URL
									let matching_tab = {url: tabs[i].url, instance: instance, namespace: namespace[1],  id: tabs[i].id, messageHeaderNumber: messageHeaderNumber[1]}
									matching_tabs.push(matching_tab);
								}
							}
						}
						sendResponse({response: "Tabs Searched", results: matching_tabs});
					});
			}
			else if (request.type == "message_tab_get_message") {
				
				console.log("Sending request for tab's message: Tab ID =", request.tabId, typeof(parseInt(request.tabId)));
				// Send message to this TAB ID to return the Tab's parsed Message table
				chrome.tabs.sendMessage(parseInt(request.tabId), {type: "message_tab_get_message"}).then((get_message_response) => {
					console.log("message_tab_get_message response from content script: ", get_message_response);
					sendResponse({response: "Message Retrieved", results: get_message_response.response});
				});
				
				
			}
			else {
				
				sendResponse({response: "Background Script has no handling defined for this message type."});
			}
			return true
	});