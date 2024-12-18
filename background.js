console.log("Background Script Running");
const Debug = true;

if (Debug) console.log(Debug, "true");

// CHROME STORAGE
let instances = []
let settings = {
			AutoTab: false,
			AutoTabNameSpace: false,
			CSS: false,
			BookmarkFolderName: "TIE Links",
			SortOrder: false,
			TimeFormat: false,
			TextCompareOn: false,
			HomepageReports: false,
			LastUpdated: false,
			ButtonsShow: false,
			SaveAnalysis: false,
			ChatGPTKey: "",
			CustomColours: []
		}

let defaultColours = ["grey", "blue","red","yellow","green","pink","purple","cyan","orange"]
// Get the instances object on Extension load
chrome.storage.local.get({
			instances: {},
		}, function(stored) {
	if (stored == undefined) {
		instances = []
	} else {
		instances = stored.instances
	}
});

// Get the settings object on Extension load
chrome.storage.local.get({
			settings: {},
		}, function(stored) {
			if (stored == undefined) {
				if (Debug) console.log("Settings Storage Undefined", stored.settings);
				chrome.storage.local.set({
						settings: settings,
					}, function() {
						if (Debug) console.log("Default Settings Applied: ", settings);
					});
			} else {
				if (Debug) console.log("Instances Storage Updated", stored.settings);
				settings = stored.settings;
			}
});

// When changes are made to the Instances object on the settings page, make them here also.
chrome.storage.onChanged.addListener(function(changes, areaName) {
	if (Debug) console.log("Storage Updated, retrieving updated objects", changes);
	if (areaName == "local") {
		chrome.storage.local.get(['instances'], function(stored) {
			if (Debug) console.log("Instances retrieved: ", stored);
			if (stored == undefined) {
				instances = []
			} else {
				instances = stored.instances;
				update_content_scripts();
			}
		});
		chrome.storage.local.get({
			settings: {},
		}, function(stored_settings) {
			if (Debug) console.log("Settings retrieved: ", stored_settings);
			if (stored_settings == undefined) {
				// Nothing
			} else {
				settings = stored_settings.settings
				createBookmarks();
			}
		});
		
	}
});

// Update open tab's tab group on page update 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (Debug) console.log("Tab Updated: ", changeInfo);
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
	chrome.storage.local.get({settings}, function(stored) {
		if (stored.settings.AutoTab) {
			if (Debug) console.log("Automatically adding tab to relevant tab group");
			let tab_group = identify_tab_group(tab)
			if (Debug) console.log(tab_group);
			if (tab_group) {
				// get currently open groups
				/// TODO - If page is refreshing and you switch your active window, the tab group hops over to the new window
				chrome.tabGroups.query({windowId: tab.windowId})
				.then((current_window_groups) => {		
					// Check to see if a relevant group exists
					let current_window_groupsLength = current_window_groups.length;
					for (let i = 0; i < current_window_groupsLength; i++) {
						if (Debug) console.log("current_window_groups[i]: ", current_window_groups[i]);
						if (Debug) console.log("tab_group.name: ", tab_group.name);
						if (current_window_groups[i].title == tab_group.name) {
							
							if (defaultColours.includes(tab_group.colour)) {
								// Update Tab Group
								chrome.tabGroups.update(current_window_groups[i].id, {title: tab_group.name, color: tab_group.colour});	
							} else {
								chrome.tabGroups.update(current_window_groups[i].id, {title: tab_group.name, color: "grey"});
							}	 
							// Add Tab to Tab Group
							chrome.tabs.group({groupId: current_window_groups[i].id, tabIds: tab.id})
							.catch((error) => {
								if (Debug) console.log("Could not add tab to a tab group: ", error); 
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
	//if (Debug) console.log("Current URL: ", tab.url);
	let instancesLength = instances.length;
	for (let i = 0; i < instancesLength; i ++ ){
		if (match) {
			break			
		}
		//if (Debug) console.log("Instance URL: ", instances[i].url)
		if (!url.includes(instances[i].url)) {
			// URL not found
		}
		else 
		{
			if (settings.AutoTabNameSpace) {
				if (Debug) console.log(instances[i].name + "= TRUE")
				let namespacesLength = instances[i].namespaces.length;
				for (let x = 0; x < namespacesLength; x ++ ){
					if (match) {
						break			
					}
					if (Debug) console.log(instances[i].name, instances[i].namespaces[x]);
					let namespace_upper = instances[i].namespaces[x].namespace.toUpperCase()
					
					// FIND THE NAMESPACE
					// Namespace could be:
					// 1. capitalised at the end of the url            =NAMESPACE=MY_NAMESPACE
					// 2. capitalised between '=' and '&'              =NAMESPACE=MY_NAMESPACE&
					// 3. lower case between the 2nd and 3rd '/'       /csp/healthshare/my_namespace/
					// 4. capitalised between '=' and '#'              $NAMESPACE=MY_NAMESPACE#

					let one = url.slice(url.search("NAMESPACE=")+10).toUpperCase();
					let two = url.slice(0, one.search("&")).toUpperCase();
					let three = url.split("/EnsPortal.")[0].split("/").slice(-1)[0].toUpperCase();
					let four = one.slice(0, one.search("&")).toUpperCase(); 
					let compare = instances[i].namespaces[x].namespace.toUpperCase(); 
					if (Debug) console.log("COMPARE '", compare, "' with: ", one, two, three, four);
					// Check if Tab's URL matches a predefined group
					if ((one == compare) || (two == compare) || (three == compare)|| (four == compare)) {	
						match = true
							
						let colour = instances[i].colour		
						tab_group_name = instances[i].name + " " + instances[i].namespaces[x].name
						if (Debug) console.log("Namespace Tab Group:", tab_group_name, colour);						
						return {name: tab_group_name, colour:  colour}
					}
				}
				
				let colour = instances[i].colour		
				tab_group_name = instances[i].name
				if (Debug) console.log("No Tab Found, Using Default Tab Group:", tab_group_name, colour)					
				return {name: tab_group_name, colour:  colour}
				
			} else {
				match = true
				
				let colour = instances[i].colour		
				tab_group_name = instances[i].name
				if (Debug) console.log("Instance Tab Group:", tab_group_name, colour)					
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
function createBookmarks() {
	if (Debug) console.log("createBookmarks()");
	chrome.bookmarks.search( {"title": settings.BookmarkFolderName})
	.then((bookmark) => {
		if (Debug) console.log("bookmark:" , bookmark);
		if (bookmark.length > 0) {
			let bookmarkID = bookmark[0].id
			if (Debug) console.log(bookmarkID);
			chrome.bookmarks.getSubTree(
			bookmarkID
			).then((bookmarkRoot) => {
				//if (Debug) console.log("bookmarkRoot", bookmarkRoot);
				if (bookmarkRoot[0].children.length > 1) {
					// Bookmark folder created and filled
				} else {
					// Bookmark folder created but empty
					if (Debug) console.log("attempt to create bookmarks!");
					let instancesLength = instances.length;
					for (var i = 0; i < instancesLength; i ++) {
						let bookmarkID = bookmark[0].id
						chrome.bookmarks.create(
							{'parentId': bookmarkID, 'title': String(i)}, // Bit hacky but it was an easy way to pass i with the promise...
						).then((groupFolder) => {
							let namespacesLength = instances[groupFolder.title].namespaces.length;
							for (var x = 0; x < namespacesLength; x ++ ){
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
				}
			});
			if (Debug) console.log('Bookmark folder found', bookmark);		
		} else {
			if (Debug) console.log('Bookmark folder not found', bookmark);		
			chrome.bookmarks.create(
				{'parentId': "1", title: settings.BookmarkFolderName},
			).then((bookmarkRoot) => {
			let instancesLength = instances.length;
			for (var i = 0; i < instancesLength; i ++) {
				chrome.bookmarks.create(
					{'parentId': bookmarkRoot.id, 'title': String(i)}, // Bit hacky but it was an easy way to pass i with the promise...
				).then((groupFolder) => {
					let namespacesLength = instances[groupFolder.title].namespaces.length;
					for (var x = 0; x < namespacesLength; x ++ ){
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
	
}



// Context Menu Listeners:

// Add context menus on installation
chrome.runtime.onInstalled.addListener(() => {
	search_item_context_menu();
	pdf_viewer_context_menu();
	page_title_context_menu();
});

/// Search item context menu
function search_item_context_menu() {
	//if (Debug) console.log("searchItem context menu created");
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
	if (Debug) console.log("pdfViewer context menu created");
	chrome.contextMenus.create({
		"id": "pdfViewer",
		"title": "Open as PDF",
		"contexts": ["selection"]
	});
}

/// Page Title context menu
function page_title_context_menu() {
	if (Debug) console.log("pageTitle context menu created");
	chrome.contextMenus.create({
		"id": "pageTitle",
		"title": "Update page title and save page url.",
		"contexts": ["page"]
	});
}


chrome.contextMenus.onClicked.addListener(function(clickData, tab){
		if (Debug) console.log("Context Menu Clicked", clickData);
		// Context Menu - Maessage Search option
		if (clickData.menuItemId.includes("searchItem")){
			let searchTriggerDomain = tab.url.split("EnsPortal");
			let searchTriggerURL = searchTriggerDomain[0] + "EnsPortal.MessageViewer.zen";
			let search_type = clickData.menuItemId;
			let value = clickData.selectionText;
			let str = clickData.linkUrl;
			let schema = str.slice(str.indexOf("SS:")+3, str.indexOf("%3A"));
			let segment = str.slice(str.indexOf("%3A")+3, str.indexOf("%3A")+6);
			let field = str.slice(str.lastIndexOf("#")+1);
			if (Debug) console.log("schema", schema);
			if (Debug) console.log("segment", segment);
			if (Debug) console.log("field", field);
		  
			// If already on Message Search Page, trigger Search
			if (clickData.pageUrl.includes("EnsPortal.MessageViewer.zen")) {
				chrome.tabs.sendMessage(tab.id, {type: "message_search", schema: schema, segment: segment, field: field, value: value, search_type: search_type}, function(response) {
					if (Debug) console.log("message_search Response", response);
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
					if (Debug) console.log("pdf_viewer Response", response);
			});
		} else if (clickData.menuItemId.includes("pageTitle")) {
			chrome.tabs.sendMessage(tab.id, {type: "page_title", tabUrl: tab.url}, function(response) {
				if (Debug) console.log("page_title Response", response);
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
const segmentSearch = {
						matches: ["*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*",],
						excludeMatches: [
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
											"*://*/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*",
										],
						allFrames: true,
						js: ["segment_search.js"],
						id: "segment_search",
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

const messageviewerExport = {
						matches: ["*://*/csp/*/EnsPortal.MessageViewer.zen*",],
						allFrames: true,
						js: ["message_viewer_export.js"],
						id: "messageviewerExport",
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
						excludeMatches: [
											"*://*/csp/*/*disableComponentReport=true",
										],
						allFrames: false,
						js: ["component_report.js"],
						id: "component_report",
				}
const pdfViewer = {
						matches: ["*://*/csp/*",],
						excludeMatches: [
							"*://*/csp/*/*disableNamespaceCategorySearch=true",
						],
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
let utils = {
						matches: ["*://*/csp/*",],
						excludeMatches: [
											"*://*/csp/*/*disableNamespaceCategorySearch=true",
										],
						allFrames: true,
						js: ["utils.js"],
						id: "utils",
						runAt: "document_start",
}
const messageGenerator = {
						matches: ["*://*/csp/*/EnsPortal.Dialog.TestingService.cls*",],
						allFrames: true,
						js: ["message_generator.js"],
						id: "messageGenerator",
}
const namespaceCategorySearch = {
						matches: ["*://*/csp/*/EnsPortal.ProductionConfig.zen*",],
						excludeMatches: [
											"*://*/csp/*/*disableNamespaceCategorySearch=true",
										],
						allFrames: true,
						js: ["namespace_category_search.js"],
						id: "namespaceCategorySearch",
}	

const productionQueue = {
						matches: ["*://*/csp/*/EnsPortal.ProductionConfig.zen*",],
						excludeMatches: [
											"*://*/csp/*/*disableNamespaceCategorySearch=true",
										],
						allFrames: true,
						js: ["production_queue.js"],
						id: "productionQueue",
}	

const queueRefresh = {
	matches: ["*://*/*/EnsPortal.Queues.zen*","*://*/*/EnsPortal.Queues.cls*",],
	allFrames: true,
	js: ["queue_refresh.js"],
	id: "queueRefresh",
}	


// Custom Header Colours
const customCss = {
						matches: ["*://*/csp/*",],
						excludeMatches: [
							"*://*/csp/*/*disableNamespaceCategorySearch=true",
						],
						allFrames: true,
						css: ["css/custom.css"],
						id: "customCSS",
}
const buttonCss = {
						matches: ["*://*/csp/*",],
						allFrames: true,
						css: ["css/button.css"],
						id: "buttonCSS",
}

let customColours = {
						matches: ["*://*/csp/*",],
						excludeMatches: [
							"*://*/csp/*/*disableNamespaceCategorySearch=true",
						],
						allFrames: true,
						js: ["custom_css.js"],
						id: "customColours",
						runAt: "document_start",
}

let pageTitles = {
	matches: ["*://*/csp/*",],
	allFrames: false,
	js: ["page_titles.js"],
	id: "pageTitles",
}
let darkMode = {
	matches: ["*://*/csp/*",],
	allFrames: true,
	css: [
		"css/darkmode/d_ZEN_SVGComponent.css", 
		"css/darkmode/d_page-defined-styles_svg.css",
		"css/darkmode/d_ZEN_Portal_standardPage.css",
		"css/darkmode/d_ZEN_Componenet_core_3.css",
		"css/darkmode/d_home.css",
	],
	id: "darkMode",
	runAt: "document_start",
}

const analysis = {
	matches: ["*://*/csp/*/EnsPortal.MessageViewer.zen*",],
	allFrames: true,
	js: ["analysis.js"],
	id: "analysis",
}

let matches = [];
// Add Content Scripts functionality
function update_content_scripts() {

	chrome.storage.local.get({
		settings: {},
		instances: {},
		},	function(storage) {
			if (Debug) console.log("Content Script Settings: ", settings);
			
			// Update matching for universal scripts
			matches = [];
			for (let i = 0; i < instances.length; i ++) {
				
				let url = "*://" + String(instances[i].url) + "/*"
				let url2 = "*://" + String(instances[i].url) + ":*/*"
				
				matches.push(url);
				matches.push(url2);
				
			}
			
			customColours.matches = matches;
			utils.matches = matches;
			if (Debug) console.log(customColours);

			chrome.scripting.unregisterContentScripts().then(() => {
				// Add Generic Content Scripts
				chrome.scripting.registerContentScripts(
				[ utils, customColours, pageTitles, productionQueue, queueRefresh, namespaceCategorySearch, messageGenerator, messageSearch, schemaExpansion, segmentSearch, textCompare, copyRawText, traceViewer, messageViewer, analysis, messageviewerExport, criteriaCache, shareMessages, pdfViewer, saveMessageViewer, customCss, buttonCss],
					() => { 
						
						if (storage.settings.HomepageReports) {
							chrome.scripting.registerContentScripts(
								[componentReport],
								() => { 
									if (Debug) console.log("Homepage Reports Loaded")
								});
						}
						
						
						if (Debug) console.log("Generic Content Scripts Loaded");
				});

				//Add instance specific content scripts
				
				if (storage.settings.CSS) {
					chrome.storage.local.get(['instances'], function(stored) {
						let instances = stored.instances
						let instancesLength = instances.length;
						for (var i = 0; i < instancesLength; i ++ ){
							let colour
							if (defaultColours.includes(instances[i].colour)) {
								colour = "css/" + instances[i].colour + ".css";
							} else {
								colour = "css/grey.css";
							}
							let scriptId = instances[i].name + "CSS";
							
							let url = "*://" + String(instances[i].url) + "/*";
							let url2 = "*://" + String(instances[i].url) + ":*/*";
							chrome.scripting.registerContentScripts(
							[{
									matches: [url, url2,],
									allFrames: true,
									css: [colour],
									id: scriptId,
							}],
							() => { 
								if (Debug) console.log("CSS Content Script Added");
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
			if (Debug) console.log("REQUEST TYPE: ", request.type, request);
			// Process on-page context menu message searches
			if (request.type == "message_tab_search") {
				if (Debug) console.log("message_tab_search triggered");
				// Update custom group with IDs for any already made
				chrome.tabs.query({currentWindow: true})
					.then((tabs) => {
						if (!tabs.length) return;
						let matching_tabs = [];
						let tabsLength = tabs.length;
						for (let i = 0; i < tabsLength; i++) {
							if (tabs[i].id == sender.tab.id) {
								// Don't return the tab that the request comes from
							} else {
								if ((tabs[i].url.includes("/EnsPortal.MessageContents.zen")) && (!tabs[i].url.includes("&RAW=1"))) {  
									// add tab to list to send back
									// Get namespace
									let url_path = tabs[i].url.split("/csp/");
									let namespace = url_path[1].split("/");
									let messageHeaderNumber = url_path[1].split("?HeaderClass=Ens.MessageHeader&HeaderId=");
									let instance = tabs[i].url.split("://").slice(1)[0].split(":")[0];
									if (instance == undefined) {
										instance = tabs[i].url.split("://").slice(1)[0].split("/")[0];
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
				if (Debug) console.log("Sending request for tab's message: Tab ID =", request.tabId, typeof(parseInt(request.tabId)));
				// Send message to this TAB ID to return the Tab's parsed Message table
				chrome.tabs.sendMessage(parseInt(request.tabId), {type: "message_tab_get_message"}).then((get_message_response) => {
					if (Debug) console.log("message_tab_get_message response from content script: ", get_message_response);
					sendResponse({response: "Message Retrieved", results: get_message_response.response});
				});				
			} else if (request.type == "analysis") {
				console.log("analysis request", request);

				chrome.tabs.create({ url: chrome.runtime.getURL("analysis.html") + "?analysis=" + request.analysis.id }, function(tab) {
					// Listen for the tab to complete loading
					chrome.tabs.onUpdated.addListener(function onUpdated(tabId, info) {
						if (tabId === tab.id && info.status === "complete") {
							// Tab is fully loaded, inject the content script
							chrome.tabs.sendMessage(tab.id, { message: "analysis_data", data: request.data, messageSearchTab: sender.tab.id }).then((response) => {
								if (chrome.runtime.lastError) {
									console.error("Message sending failed: ", chrome.runtime.lastError);
								} else {
									console.log("Message sent successfully, response:", response);
								}
							});
				
							// Remove the listener after it's used
							chrome.tabs.onUpdated.removeListener(onUpdated);
						}
					});
				});
			} else if (request.type == "analysis_save") {
				console.log("analysis save request", request);

				
				chrome.tabs.sendMessage(request.messageSearchTab, { message: "analysis_save", name:request.name, range:request.range}).then((response) => {
					if (chrome.runtime.lastError) {
						console.error("Message sending failed: ", chrome.runtime.lastError);
					} else {
						console.log("Message sent successfully, response:", response);
					}
				});
				
			
			}
			else {
				sendResponse({response: "Background Script has no handling defined for this message type."});
			}
			return true
	});
