console.log("Background Script Running");
const Debug = true;

const owner = "Robsodd";
const repo = "IRIS-WHIZ-HL7v2-Browser-Extension";

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
			instances: [],
		}, function(stored) {
	if (stored == undefined) {
		instances = []
	} else {
		instances = stored.instances
	}
	console.log("STORED INSTANCES: ", instances);
	// Let users know the instances object needs setting up
	if (instances.length == 0) {
		chrome.action.setBadgeText({
			text: "!"
		})
		chrome.action.setBadgeBackgroundColor({
			color: "#FFA500"
		})
	} else {
		chrome.action.setBadgeText({
			text: ""
		})
		cleanUpHostPermissions();
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
	if (changes.versionCheckDate) {
		return
	}
	if (areaName == "local") {
		chrome.storage.local.get(['instances'], function(stored) {
			if (Debug) console.log("Instances retrieved: ", stored);
			if (stored == undefined) {
				instances = []
			} else {
				instances = stored.instances;
				update_content_scripts();
			}
				// Let users know the instances object needs setting up
			if (instances.length == 0) {
				chrome.action.setBadgeText({
					text: "!"
				})
				chrome.action.setBadgeBackgroundColor({
					color: "#FFA500"
				})
			} else {
				chrome.action.setBadgeText({
					text: ""
				})
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

const scriptDefinitions = {
    messageSearch: {
        id: "message_search",
        js: ["content_scripts/message_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal*"],
        excludePaths: ["/csp/*/EnsPortal.ProductionConfig.zen*"]
    },
    schemaExpansion: {
        id: "schema_expansion",
        js: ["content_scripts/schema_expansion.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*"
        ]
    },
    segmentSearch: {
        id: "segment_search",
        js: ["content_scripts/segment_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&schema_expansion=disable*"
        ]
    },
    textCompare: {
        id: "text_compare",
        js: ["content_scripts/text_compare.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&text_compare=disable*"
        ]
    },
    copyRawText: {
        id: "copy_raw_text",
        js: ["content_scripts/copy_raw_text.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*"],
        excludePaths: [
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&RAW=1",
            "/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&copy_raw_text=disable*"
        ]
    },
    traceViewer: {
        id: "trace_viewer",
        js: ["content_scripts/trace_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.VisualTrace.zen?SESSIONID=*"]
    },
    messageViewer: {
        id: "message_viewer",
        js: ["content_scripts/message_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"]
    },
    messageviewerExport: {
        id: "messageviewerExport",
        js: ["content_scripts/message_viewer_export.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"]
    },
    criteriaCache: {
        id: "criteria_cache",
        js: ["content_scripts/criteria_cache.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"]
    },
    shareMessages: {
        id: "share_messages",
        js: ["content_scripts/share_messages.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageContents.zen?HeaderClass=Ens.MessageHeader&HeaderId=*&share=1*"]
    },
    componentReport: {
        id: "component_report",
        js: ["content_scripts/component_report.js"],
        allFrames: false, // Originally false in your code
        paths: [
            "/csp/sys/%25CSP.Portal.Home.zen*",
            "/csp/sys/UtilHome.csp"
        ],
        excludePaths: ["/csp/*/*disableComponentReport=true"]
    },
    pdfViewer: {
        id: "pdf_viewer",
        js: ["content_scripts/pdf_viewer.js"],
        allFrames: true,
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    saveMessageViewer: {
        id: "save_message_viewer",
        js: ["content_scripts/save_message_viewer.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"]
    },
    utils: {
        id: "utils",
        js: ["utils.js"],
        allFrames: true,
        runAt: "document_start",
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    messageGenerator: {
        id: "messageGenerator",
        js: ["content_scripts/message_generator.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.Dialog.TestingService.cls*"]
    },
    namespaceCategorySearch: {
        id: "namespaceCategorySearch",
        js: ["content_scripts/namespace_category_search.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.ProductionConfig.zen*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    productionQueue: {
        id: "productionQueue",
        js: ["content_scripts/production_queue.js"],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.ProductionConfig.zen*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    queueRefresh: {
        id: "queueRefresh",
        js: ["content_scripts/queue_refresh.js"],
        allFrames: true,
        paths: [
            "/*/EnsPortal.Queues.zen*", 
            "/*/EnsPortal.Queues.cls*"
        ]
    },
    customCss: {
        id: "customCSS",
        css: ["css/custom.css"],
        allFrames: true,
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    buttonCss: {
        id: "buttonCSS",
        css: ["css/button.css"],
        allFrames: true,
        paths: ["/csp/*"]
    },
    customColours: {
        id: "customColours",
        js: ["content_scripts/custom_css.js"],
        allFrames: true,
        runAt: "document_start",
        paths: ["/csp/*"],
        excludePaths: ["/csp/*/*disableNamespaceCategorySearch=true"]
    },
    pageTitles: {
        id: "pageTitles",
        js: ["content_scripts/page_titles.js"],
        allFrames: false, // Originally false in your code
        paths: ["/csp/*"]
    },
	// This is going to take too much time and I'm shelving it.
    // darkMode: {
    //     id: "darkMode",
    //     css: [
    //         "css/darkmode/d_ZEN_SVGComponent.css", 
    //         "css/darkmode/d_page-defined-styles_svg.css",
    //         "css/darkmode/d_ZEN_Portal_standardPage.css",
    //         "css/darkmode/d_ZEN_Componenet_core_3.css",
    //         "css/darkmode/d_home.css"
    //     ],
    //     allFrames: true,
    //     runAt: "document_start",
    //     paths: ["/csp/*"]
    // },
    analysis: {
        id: "analysis",
        js: [
            "chartjs/chart.umd.js",
            "chartjs/chartjs-adapter-date-fns.bundle.min.js",
            "chartjs/chartjs-plugin-datalabels.min.js",
            "chartjs/hammer.min.js",
            "chartjs/chartjs-plugin-zoom.min.js",
            "content_scripts/analysis.js"
        ],
        allFrames: true,
        paths: ["/csp/*/EnsPortal.MessageViewer.zen*"]
    }
};

let matches = [];


// Add Content Scripts functionality
function update_content_scripts() {
    chrome.storage.local.get({ settings: {}, instances: [] }, async function(storage) {
        
        // 2. Clear existing scripts first
        try {
            await chrome.scripting.unregisterContentScripts();
        } catch (e) {
            console.error("Error unregistering scripts:", e);
        }

        if (storage.instances.length === 0) return;

        // 3. Build the dynamic scripts array
        const scriptsToRegister = [];

        // Helper function to build full URLs from instances and paths
        const buildMatches = (instances, paths) => {
            let fullUrls = [];
            instances.forEach(instance => {
                // Ensure instance.url doesn't have trailing slashes before appending paths
                const baseHost = String(instance.url).replace(/\/$/, ""); 
                paths.forEach(path => {
                    fullUrls.push(`*://${baseHost}${path}`);
                    fullUrls.push(`*://${baseHost}:*${path}`); // Account for specific ports
					fullUrls.push(`*://${baseHost}/*/${path}`); // Health Connect
                    fullUrls.push(`*://${baseHost}:*/*/${path}`); // Health Connect: Account for specific ports
                });
            });
            return fullUrls;
        };

        // Populate the scripts array with the dynamically generated URLs
        for (const [key, scriptDef] of Object.entries(scriptDefinitions)) {
            
            // Example: Skip component report if setting is off
            if (key === 'componentReport' && !storage.settings.HomepageReports) continue;

            const scriptConfig = {
                id: scriptDef.id,
                js: scriptDef.js,
                css: scriptDef.css,
                allFrames: scriptDef.allFrames,
                runAt: scriptDef.runAt,
                matches: buildMatches(storage.instances, scriptDef.paths)
            };

            if (scriptDef.excludePaths) {
                 scriptConfig.excludeMatches = buildMatches(storage.instances, scriptDef.excludePaths);
            }

            scriptsToRegister.push(scriptConfig);
        }

        // 4. Instance-specific CSS (Dark mode / Custom Colors)
        if (storage.settings.CSS) {
            storage.instances.forEach(instance => {
                const colour = defaultColours.includes(instance.colour) ? instance.colour : "grey";
                scriptsToRegister.push({
                    id: `${instance.name}_CSS`,
                    css: [`css/${colour}.css`],
                    allFrames: true,
                    matches: [`*://${instance.url}/*`, `*://${instance.url}:*/*`]
                });
            });
        }

        // 5. Register with error catching
        try {
            await chrome.scripting.registerContentScripts(scriptsToRegister);
            if (Debug) console.log("Scripts successfully updated.");
        } catch (error) {
            console.error("Failed to register dynamic scripts:", error);
        }
    });
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

				chrome.tabs.create({ url: chrome.runtime.getURL("/pages/analysis.html") + "?analysis=" + request.analysis.id }, function(tab) {
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
				
			
			// } else if (request.type === "request-permission") {

			// 					/*
			// 	function requestPermissions() {
			// 		chrome.permissions.request({
			// 			origins: [url, url2]
			// 		}, function (granted) {
			// 			if (granted) {
			// 				console.log("Permission granted for example.com!");
			// 			} else {
			// 				console.log("Permission denied by user.");
			// 			}
			// 		});
			// 	}*/
				
			// 	// Check if the permission is already granted
			// 	chrome.permissions.contains({
			// 		origins: ["*://" + request.url + "/*"]
			// 	}, function (result) {
			// 		if (result) {
			// 			console.log("Permission already granted.");
			// 			// Permission already exists, make the request
			// 		} else {
			// 			console.log("Requesting permission...");
			// 			chrome.permissions.request(
			// 				{ origins: ["*://" + request.url + "/*"] },
			// 				(granted) => {
			// 					if (granted) {
			// 						console.log("Permission granted!");
			// 					} else {
			// 						console.log("Permission denied.");
			// 					}
			// 				}
			// 			);
			// 		}
			// 	});
				
				
			}
			else {
				sendResponse({response: "Background Script has no handling defined for this message type."});
			}
			return true
	});




chrome.storage.local.get({
	versionCheckDate: null,
	}, function(stored) {
	console.log("stored.versionCheckDate", stored.versionCheckDate);
	
	let versionCheckDate;
	
	// If versionCheckDate is not set, set it to 3 days ago
	if (stored.versionCheckDate === null) {
		versionCheckDate = new Date();
		versionCheckDate.setDate(versionCheckDate.getDate() - 3);
		chrome.storage.local.set({ versionCheckDate: versionCheckDate.toISOString() }); // Save as ISO string
	} else {
		// Convert stored string back to a Date object
		versionCheckDate = new Date(stored.versionCheckDate);

		// Validate the date
		if (isNaN(versionCheckDate.getTime())) {
			console.warn("Invalid stored date. Resetting to 3 days ago.");
			versionCheckDate = new Date();
			versionCheckDate.setDate(versionCheckDate.getDate() - 3);
			chrome.storage.local.set({ versionCheckDate: versionCheckDate.toISOString() });
		  }
	}
	
	let currentDate = new Date();
	let twoDaysAgo = new Date();
	twoDaysAgo.setDate(currentDate.getDate() - 2);
	
	console.log("version Check Date:", versionCheckDate);
	console.log("Two Days Ago:", twoDaysAgo);
	
	// Compare the dates
	if (versionCheckDate != twoDaysAgo) {
		console.log("version date is older than 2 days. Checking for a new version...");
		checkForNewVersion();
	
		// Update the stored versionCheckDate to the current date
		chrome.storage.local.set({ versionCheckDate: new Date().toISOString() });
	} else {
		console.log("version date is within the last 2 days. No check needed.");
	}
});

async function checkForNewVersion() {
		let today = new Date();
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
		console.log("api URL", apiUrl);
		try {
			const response = await fetch(apiUrl);
			if (!response.ok) {
				throw new Error(`GitHub API error: ${response.status}`);
			}
	
			const data = await response.json();
			const latestVersion = data.tag_name; // Typically contains the version, e.g., "v1.2.3"
	
			console.log("Latest version:", latestVersion);
	
			// Compare with the extension's version
			const currentVersion = chrome.runtime.getManifest().version;
			if (currentVersion === latestVersion) {
				console.log("A new version is available!");
				notifyUser(latestVersion); // Notify the user
			} else {
				console.log("You are using the latest version.");
				chrome.storage.local.set({
					version: "Latest version",
					versionCheckDate: new Date().toISOString(),
				});
			}
		} catch (error) {
			console.error("Failed to fetch the latest version:", error);
		}
}

function notifyUser(version) {

	chrome.action.setBadgeText({
		text: "!"
	})
	chrome.action.setBadgeBackgroundColor({
		color: "#00FFFF"
	})
	chrome.storage.local.set({
		version: version,
		versionCheckDate: new Date(),
	}, function() {
		if (Debug) console.log("New version Available: ", version);
	});
}


function cleanUpHostPermissions() {
	// Step 1: Generate allowed origins from instances
	const allowedOrigins = instances.map((instance) => `*://${instance.url}/*`);
  
	// Step 2: Get manifest permissions
	const manifestOrigins = chrome.runtime.getManifest().host_permissions || [];
	console.log("Manifest Origins:", manifestOrigins);
  
	// Step 3: Get all current permissions
	chrome.permissions.getAll((permissions) => {
	  if (chrome.runtime.lastError) {
		console.error("Error getting permissions:", chrome.runtime.lastError.message);
		return;
	  }
  
	  const currentOrigins = permissions.origins || [];
	  console.log("Current Origins:", currentOrigins);
  
	  // Step 4: Identify dynamically added origins to remove
	  const originsToRemove = currentOrigins.filter(
		(origin) =>
		  !allowedOrigins.includes(origin) && // Not in allowed origins
		  !manifestOrigins.includes(origin)   // Not in manifest origins
	  );
  
	  if (originsToRemove.length === 0) {
		console.log("No dynamically added permissions to remove. All is good!");
		return;
	  }
  
	  console.log("Origins to Remove (Dynamic):", originsToRemove);
  
	  // Step 5: Remove dynamically added permissions
	  chrome.permissions.remove({ origins: originsToRemove }, (removed) => {
		if (chrome.runtime.lastError) {
		  console.error("Error removing permissions:", chrome.runtime.lastError.message);
		  return;
		}
  
		if (removed) {
		  console.log("Successfully removed dynamically added permissions:", originsToRemove);
		} else {
		  console.error("Failed to remove some dynamically added permissions.");
		}
	  });
	});
  }
  
