/// Schema Expansion Content Script
console.log("Schema Expansion Content Script");

let clicked = false
let schemaSearch = false;
let schemaRowClicked = undefined;
let schemaRowHighlighColour = "#eaafff";
let schemaRowClickColour = "#D471F7";


window.addEventListener("load", function() {
	let expandors = document.getElementsByClassName("EDIDocumentTableExpandor");
	for (let i = 0; i < expandors.length; i++){
		let toggleBtn = document.createElement("button");
		//toggleBtn.style.border = "1px black solid";
		toggleBtn.title = "Expand Schema";
		toggleBtn.style.marginTop = "-16px";
		toggleBtn.style.cursor = "pointer";
		toggleBtn.style.padding = "7px 3px";
		toggleBtn.className = "toggleSchema";
		toggleBtn.style.backgroundColor = "orange";
		expandors[i].style.padding = "1px";
		expandors[i].appendChild(toggleBtn);
	}
	//<button style="margin:0; padding:5px;"></button>
});

document.addEventListener("expandSchema", function(e) {
	schemaSearch = e.schemaSearch
	console.log("expandSchema triggered. schemaModeFull = ", schemaModeFull);
	//if ((e.advanced == undefined) || (e.advanced == false)) {
	if (schemaModeFull === false) {
		expandSchema();
	} else {
		expandSchemaAdvanced();
	}
	
});


document.addEventListener("contractSchema", function(e) {
	schemaSearch = false;
	contractSchema();
});


document.addEventListener("searchExpandedSchema", function(e) {
	searchExpandedSchema(e);
});



if (currentUrl.includes("&btns=disable")) {
	// Skip creating the buttons!
} else {
	addButtonBar(document);
	buttonBarStyle(document);
	searchExpandedSchemaButton(document);
	schemaModeButton(document);
}

function expandSchemaAdvanced() {
	let rows = document.getElementsByClassName("EDIDocumentTableRow")
	//console.log("ROWS", rows);
	if (rows.length > 20) {
		if (!confirm("This page contains " + String(rows.length) + " segments which could take a long while to load. \n Are you sure you want to continue?")) {
			return
		}
	}
	for (var i = 0, row; row = rows[i]; i++) {
		//console.log("ROW", row);
		expandRowAdvanced(row);

	}
}

function expandSchema() {
	let rows = document.getElementsByClassName("EDIDocumentTableRow")
	//console.log("ROWS", rows);

	var table = document.querySelector("body > table.EDIDocumentTable")
	//console.log("TABLE: ", table);

	for (var i = 0, row; row = rows[i]; i++) {
		expandRow(row);

	}
}

function contractSchema() {
	let expandedSchema = document.getElementsByClassName("additionaltable")
	//console.log("expandedSchema", expandedSchema);
	let expandedSchemaLength = expandedSchema.length;
	for (let i = expandedSchemaLength; i > 0; i--) {
		//console.log("expandedSchema", i, expandedSchema[i-1]);
		expandedSchema[i-1].remove();
		//if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[0].className == "searchSegment") {
			//if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[1].childNodes[1].value == "") {
				//expandedSchema[i-1].remove();
			//}
		//} else {
			//expandedSchema[i-1].remove();
		//}
		
	}
	let schemaMatchElems = document.querySelectorAll(".schemaMatch")
	console.log("schemaMatchElems", schemaMatchElems);
	for (let x = 0; x < schemaMatchElems.length; x++) {
		schemaMatchElems[x].classList.remove("schemaMatch");
	}
}


/// Expands the contents of the given Table Row (requires the main table row, not the sub-table used to display the segment fields)
function expandRow(row) {
	let fieldCounter = 0;
		
	let segmentTable = row.cells[4];
	let segment = row.cells[4].childNodes[0].childNodes[0].childNodes[0].childNodes;
	//console.log("Segment", segment);
	let rowInsertion = 0;
	let newExpansionTable = document.createElement('table'); // class = edisegmenttable
	newExpansionTable.className = "edisegmenttable additionaltable";


	if (segmentTable.childNodes.length < 2) {
		
		// Check if already expanded
		if (segmentTable.childNodes[0].childNodes[0].childNodes[0].childNodes.length <= 3) {
			return
		}
		let segmentLength = segment.length;
		for (let td = 0; td < segmentLength; td ++) {
			fieldCounter ++
			//console.log("SEGMENT: ", segment[td]);
			if (segment[td].nodeValue == "\n") {
				// Skip extra Text Divs
			} else {
				if (segment[td].className == "EDISegmentsTableSeparator") {
					// Skip segment seperators.
				}
				else 
				{
					// Add Search Bar to top of schema table
					if ((rowInsertion == 0) && (!schemaSearch)) {

						let searchRow = newExpansionTable.insertRow(rowInsertion);
						searchRow.className = "searchRow";
						rowInsertion ++
						
						let cell1 = searchRow.insertCell(0)
						cell1.style.borderBottom = "3px solid mediumpurple";
						cell1.style.whiteSpace = "nowrap";
						cell1.style.padding = "2px 5px 2px 50px";
						cell1.style.fontSize = "12";
						cell1.className = "searchSegment";
						
						let cell2 = searchRow.insertCell(1)
						cell2.style.borderBottom = "3px solid mediumpurple";
						cell2.style.whiteSpace = "nowrap";
						cell2.style.textAlign = "right";
						cell2.style.fontSize = "12";
						cell2.className = "searchSegment";
						
						let searchInput = document.createElement("input");
						searchInput.setAttribute("type", "text");
						thetext = document.createTextNode("Search:");
						
						cell1.appendChild(thetext);
						cell2.appendChild(searchInput);

						
						searchInput.addEventListener('keyup', function(e) { 
							//iterate through rows, hide if text not found
							//console.log("keyup!");
							let table = newExpansionTable;
						
							// Allows search with spaces
							let textSearch = e.target.value.toLowerCase()
							textSearch = textSearch.replaceAll(/\s/g, " ");
							//console.log(textSearch, textSearch.replaceAll(/\s/g, "<s>"));
							//console.log("e.target.value", e.target.value.replaceAll(/\s/g, "<s>"));
							if (e.target.value == '') {
								//console.log("e.target.value == ''");
								let childNodesLength = table.childNodes[0].childNodes.length;
								for (let i = 1; i < childNodesLength; i++) {
									table.childNodes[0].childNodes[i].style.display = '';
									table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<span\sstyle\=.background\-color\:\s.*?\;.\>/g,"");
									table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<\/span\>/g,"");

								}
							} else {
								let childNodesLength = table.childNodes[0].childNodes.length;
								for (let i = 1; i < childNodesLength; i++) {
									
									// remove all highlights
									var reSpanStart = new RegExp("\<span\sstyle\=\'color\:\sred\;\'\>","g");
									var reSpanEnd = new RegExp("\<\/span\>","g");
									table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<span\sstyle\=.background\-color\:\s.*?\;.\>/g,"");
									table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<\/span\>/g,"");
									
									// Lowercase and replace spaces for matching
									let tableValue = table.childNodes[0].childNodes[i].innerText.toLowerCase()
									tableValue = tableValue.replaceAll(/\s/g, " ");
									//console.log("tableValue", tableValue);
									
									// show row & highlight
									if (tableValue.includes(textSearch)) {
										const myregexp = /\>.*?\</g;

										const array = [...table.childNodes[0].childNodes[i].innerHTML.matchAll(myregexp)];
										//console.log("my new array of stuff", array);
										let arrayLength = array.length
										for (let x = 0; x < arrayLength; x++) {
											let arrayValue = array[x][0].replaceAll(/\s/g, " ");
											
											if (arrayValue.includes("</span>")) {
												//skip, already processed
											} else {
												//console.log("processing arrayValue", arrayValue);
												let start = arrayValue.toLowerCase().search(escapeRegExp(textSearch));
												//console.log("start", start, arrayValue.toLowerCase()); // Start is -1 when our string includes a space
												if (start === -1) {
													// skip, not found
													//console.log("skipping the start...");
												} else {
													let end = start + textSearch.length;
													let extractedString = arrayValue.substring(start, end); 

													let newString = arrayValue.replaceAll(extractedString,	"<span style='background-color: orange;'>" + extractedString + "</span>");
													var oldContent = new RegExp(escapeRegExp(arrayValue),"g");
													//console.log()
													table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replace(oldContent, newString);
													
												}/* */
											}
										}
										
										// Show row
										table.childNodes[0].childNodes[i].style.display = ''
										
										
									} else {
										// hide row, no matching strings
										table.childNodes[0].childNodes[i].style.display = 'none'
									}
								}
							}
							
						});
						
					}
					
					// Adding New Row
					//console.log("Adding New Row #", td);
					let newFieldRow = newExpansionTable.insertRow(rowInsertion);
					rowInsertion ++
					
					newFieldRow.className = "searchableSchema";
					newFieldRow.style.fontSize = "12";
					
					let title = segment[td].children[0].title;

					newFieldRow.insertCell(0).innerHTML = title.split("/")[0];
					newFieldRow.cells[0].className = "schemaField";
					newFieldRow.cells[0].style.padding = "2px 5px 2px 50px";
					newFieldRow.insertCell(1).innerHTML = title.split("/")[1];
					newFieldRow.cells[1].className = "schemaField";
					newFieldRow.insertCell(2).innerHTML = segment[td].innerHTML.replaceAll(/\&nbsp\;/g, " ");;
					newFieldRow.cells[2].className = "schemaField";
					newFieldRow.cells[2].style.setProperty('text-decoration', 'none', 'important');
				}
			   
			}
		}
		segmentTable.appendChild(newExpansionTable);
		//console.log("segmentTable 3", segmentTable);
	}
}


// Add event listeners

let expansionElementClassnames = ["EDIDocumentTableExpandor", "EDIDocumentTableSegnum", "EDIDocumentTableSegid",]

// Add an event listener
document.addEventListener("addExpansion", function(e) {
	//console.log("addExpasion Listener Triggered");
	addExpansionListeners();
});

addExpansionListeners();

function addExpansionListeners() {
	for (let i = 0, expansionElementClassname; expansionElementClassname = expansionElementClassnames[i]; i++) {
		let expandorElements = document.getElementsByClassName(expansionElementClassname);
		for (let x = 0, expandorElement; expandorElement = expandorElements[x]; x++) {
			expandorElement.style.cursor = "pointer";
			if (!expandorElement.listenerAdded) {		
				expandorElement.addEventListener('click', () => { 
					schemaSearch = false;
					//console.log("expandorElement:", expandorElement);
					expandContractElement(expandorElement);
				});
			}
			expandorElement.listenerAdded = true;
		}
	}
}


function expandContractElement(expandorElement) {
	if (expandorElement.className.includes("EDIDocumentTableExpandor")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			schemaSearch = false;
			if (schemaModeFull === false) {
				expandRow(expandorElement.parentNode);
			} else {
				expandRowAdvanced(expandorElement.parentNode);
			}
			
		} else {
			// CONTRACT!
			//expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
			contractSchema();
		}
	} 
				
				
	if (expandorElement.className.includes("EDIDocumentTableSegnum")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			schemaSearch = false;
			if (schemaModeFull === false) {
				expandRow(expandorElement.parentNode);
			} else {
				expandRowAdvanced(expandorElement.parentNode);
			}
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}
	}


	if (expandorElement.className.includes("EDIDocumentTableSegid")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			schemaSearch = false;
			if (schemaModeFull === false) {
				expandRow(expandorElement.parentNode);
			} else {
				expandRowAdvanced(expandorElement.parentNode);
			}
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}			
	}
}

/// Search bar functionality.
function searchExpandedSchema(e) {

	//iterate through rows, hide if text not found
	let key = e.keyUpEvent.key;
	let eValue = e.keyUpEvent.target.value;
	if (keys.includes(key)) {
		//console.log(e.key, "skipped")
		return
	}
	
	let textSearch = eValue.toLowerCase();
	textSearch = textSearch.replace(/\s/gm, " ");
	let textSearchLength = textSearch.length;
	let schemaRows = document.getElementsByClassName("searchableSchema");
	
	if (highlighted) {
		
		let additionaltable = document.getElementsByClassName("additionaltable");
		for (let t = 0; t < additionaltable.length; t++ ) {
			if (additionaltable[t].childNodes[0].childNodes[0].className == "searchRow") {
					// Searchrow breaks if we don't skip
					continue
				}	
			//additionaltable[t].innerHTML = additionaltable[t].innerHTML.replaceAll(/\<\/span\>\<\!\-\-end\-\-\>/g,"");
			additionaltable[t].innerHTML = additionaltable[t].innerHTML.replaceAll(/\<\!\-\-highlight\-\-\>\<span\sstyle\=.background\-color\:\s.*?\;.\>/g,"");
		}
		
		highlighted = false
		
	}

	if (eValue == '') {
		if ((key == "Enter") && (eValue == '')) {
			if (document.getElementById('whiz').style.display == "none") {
				e.searchExpandedSchemaBtn.style.display = "inherit";
			} else {
				e.searchExpandedSchemaBtn.style.display = "none";
			}
			e.searchInput.style.display = "none";
			e.searchlabel.style.display = "none";
			document.dispatchEvent(contractSchemaEvent);
		} else {
			let l = schemaRows.length;
			for (let i = 0; i < l; i++) {
				schemaRows[i].style.display = '';
			}
		}
	} else if (key != "Enter") {
		// remove all highlights

		// Lowercase and replace spaces for matching

		let l = schemaRows.length;
		for (let i = 0; i < l; i++) {
			if (schemaRows[i].className == "searchRow") {
					// skip
					continue
				}	
			let innerHTML = schemaRows[i].innerHTML

			let tableValue = schemaRows[i].innerText.toLowerCase()
			tableValue = tableValue.replace(/\s/gm, " ");
			
			// show row & highlight
			if (tableValue.includes(textSearch)) {
				schemaRows[i].style.display = '';

			} else {
				schemaRows[i].style.display = 'none';
			}
		}
	} else {
		
		// Now highlight rows
		highlighted = true
		let l = schemaRows.length;
		for (let i = 0; i < l; i++) {
			if (schemaRows[i].style.display == '') {
				
				
				const myregexp = new RegExp("\>.+?\<","g");
				const array = [...schemaRows[i].innerHTML.matchAll(myregexp)];
				
				
				// each schemarow has 3 childnodes
				for (let z = 0; z < schemaRows[i].childElementCount; z++){
									
									
					let arrayValue = schemaRows[i].childNodes[z].innerText.replaceAll(/\s/g, " ");
					
					let start = arrayValue.toLowerCase().search(escapeRegExp(textSearch));
					//console.log("start", start, arrayValue.toLowerCase()); 
					if (start === -1) {
						// skip, not found
						//console.log("skipping arrayValue", arrayValue);
					} else {
						
						let end = start + textSearchLength;
						let extractedString = arrayValue.substring(start, end); 
						//console.log(schemaRows[i].innerHTML[0])
						
						// Third row contains a link which adds extra html
						if (z == 3) {
							let newString = arrayValue.replaceAll(extractedString,	"<!--highlight--><span style='background-color: yellow;'>" + extractedString + "</span>");
							//console.log(newString);
							var oldContent = new RegExp(escapeRegExp(arrayValue),"g");
							//console.log("child nodes", schemaRows[i].childNodes[z].childNodes);
							schemaRows[i].childNodes[z].childNodes[0].innerHTML = schemaRows[i].childNodes[z].childNodes[0].innerHTML.replace(oldContent, newString);
						
						} else {
							let newString = arrayValue.replaceAll(extractedString,	"<!--highlight--><span style='background-color: yellow;'>" + extractedString + "</span>");
							//console.log(newString);
							var oldContent = new RegExp(escapeRegExp(arrayValue),"g");
							schemaRows[i].childNodes[z].innerHTML = schemaRows[i].childNodes[z].innerHTML.replace(oldContent, newString);
						
						}
					}
				}
			}
		}
	}
}


function expandRowAdvanced(row, href = "", parentId = "", parentIndent = 0, parentTitle = "") {

	if (row.className == "EDIDocumentTableRow") {
		if (row.children[4].childElementCount > 1) {
			return
		}
	}
	let indent = 0;
	let rowIndex = 0;
	let schemaUri;
	let segmentTable = undefined;
	let newExpansionTable;
	
	
	if (row.subRows == undefined) {
		row.subRows = [];
	}

	if (row.className == "searchableSchema") {
		// DropDown Table
		newExpansionTable = row.parentElement.parentElement;
		indent = 0;
		rowIndex = row.rowIndex + 1;
		schemaUri = href 
		segmentTable = row.parentElement.parentElement;
		
	} else {
		// Create Table
		newExpansionTable = document.createElement('table'); // class = edisegmenttable
		let segmentType = row.childNodes[4].innerText // MSH/OBR/OBX etc...
		schemaUri = row.cells[3].childNodes[0].getAttribute("href");
		segmentTable = row.cells[4];
		let segment = row.cells[4].childNodes[0].childNodes[0].childNodes[0].childNodes;
		
	}

	
	// THIS IS THE START OF THE IFRAME GENERATOR
	
	let iframe = document.createElement("iframe");	
	let iframeURL = stubUrl[0] + schemaUri;
	iframe.src = iframeURL;

	iframe.style.width = "100%";

	document.body.appendChild(iframe);
	iframe.style.height = iframe.scrollHeight + "px";
	iframe.scrolling = "auto";
	iframe.className = "traceViewerIframe";
	iframe.style.display = "none";
			
	let subRows = [];		
	iframe.addEventListener("load", function() {
		//console.log("Segment", segment);
		let rowInsertion = 0 + rowIndex;
		
		
		newExpansionTable.className = "edisegmenttable additionaltable";
		//console.log("newExpansionTable", newExpansionTable);
		//console.log("segmentTable1 ", segmentTable, segmentTable.childNodes[0].childNodes[0].childNodes.length);
		//if (segmentTable.childNodes.length < 2) {
			//if (segmentTable.childNodes[0].childNodes[0].childNodes[0].childNodes.length <= 3) {
			//	return
			//}
			//let segmentLength = segment.length;
			//console.log("segmentLength", segmentLength);
			
			let iframeSchemaTable = iframe.contentDocument.getElementsByClassName("tpTable")
			//console.log("iframeSchemaTable", iframeSchemaTable);
			let iframeSchemaTableLength = iframeSchemaTable[0].children[0].childElementCount
			if ((parentId != "") && (parentIndent == 0)) {
				parentId = parentId + "."
				indent = (parentId.match(/\./g) || []).length;
				//console.log("indent count", indent);
			} else if (parentIndent > 0) {
				indent = parentIndent
			}
			for (let tableRow = 0; tableRow < iframeSchemaTableLength; tableRow ++) {
				
				// Add Search Bar to top of schema table
				/*
				if (rowInsertion == 0) {

					let searchRow = newExpansionTable.insertRow(rowInsertion);
					searchRow.className = "searchRow";
					rowInsertion ++
					
					let cell1 = searchRow.insertCell(0)
					cell1.style.borderBottom = "3px solid mediumpurple";
					cell1.style.whiteSpace = "nowrap";
					cell1.style.padding = "2px 5px 2px 50px";
					cell1.style.fontSize = "12";
					cell1.className = "searchSegment";
					
					let cell2 = searchRow.insertCell(1)
					cell2.style.borderBottom = "3px solid mediumpurple";
					cell2.style.whiteSpace = "nowrap";
					cell2.style.textAlign = "right";
					cell2.style.fontSize = "12";
					cell2.className = "searchSegment";
					
					let searchInput = document.createElement("input");
					searchInput.setAttribute("type", "text");
					thetext = document.createTextNode("Search:");
					
					cell1.appendChild(thetext);
					cell2.appendChild(searchInput);

					
					searchInput.addEventListener('keyup', function(e) { 
						//iterate through rows, hide if text not found
						//console.log("keyup!");
						let table = newExpansionTable;
					
						// Allows search with spaces
						let textSearch = e.target.value.toLowerCase()
						textSearch = textSearch.replaceAll(/\s/g, " ");
						//console.log(textSearch, textSearch.replaceAll(/\s/g, "<s>"));
						//console.log("e.target.value", e.target.value.replaceAll(/\s/g, "<s>"));
						if (e.target.value == '') {
							//console.log("e.target.value == ''");
							let childNodesLength = table.childNodes[0].childNodes.length;
							for (let i = 1; i < childNodesLength; i++) {
								table.childNodes[0].childNodes[i].style.display = '';
								table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<span\sstyle\=.background\-color\:\s.*?\;.\>/g,"");
								table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<\/span\>/g,"");

							}
						} else {
							let childNodesLength = table.childNodes[0].childNodes.length;
							for (let i = 1; i < childNodesLength; i++) {
								
								// remove all highlights
								var reSpanStart = new RegExp("\<span\sstyle\=\'color\:\sred\;\'\>","g");
								var reSpanEnd = new RegExp("\<\/span\>","g");
								table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<span\sstyle\=.background\-color\:\s.*?\;.\>/g,"");
								table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replaceAll(/\<\/span\>/g,"");
								
								// Lowercase and replace spaces for matching
								let tableValue = table.childNodes[0].childNodes[i].innerText.toLowerCase()
								tableValue = tableValue.replaceAll(/\s/g, " ");
								//console.log("tableValue", tableValue);
								
								// show row & highlight
								if (tableValue.includes(textSearch)) {
									const myregexp = /\>.*?\</g;

									const array = [...table.childNodes[0].childNodes[i].innerHTML.matchAll(myregexp)];
									//console.log("my new array of stuff", array);
									let arrayLength = array.length
									for (let x = 0; x < arrayLength; x++) {
										let arrayValue = array[x][0].replaceAll(/\s/g, " ");
										
										//console.log(arrayValue);
										//console.log("array iterating: ", x);
										if (arrayValue.includes("</span>")) {
											//skip, already processed
											//console.log("skipped Span", arrayValue);
										} else {
											//console.log("processing arrayValue", arrayValue);
											let start = arrayValue.toLowerCase().search(escapeRegExp(textSearch));
											//console.log("start", start, arrayValue.toLowerCase()); // Start is -1 when our string includes a space
											if (start === -1) {
												// skip, not found
												//console.log("skipping the start...");
											} else {
												let end = start + textSearch.length;
												let extractedString = arrayValue.substring(start, end); 
												let newString = arrayValue.replaceAll(extractedString,	"<span style='background-color: orange;'>" + extractedString + "</span>");
												var oldContent = new RegExp(escapeRegExp(arrayValue),"g");
												//console.log()
												table.childNodes[0].childNodes[i].innerHTML = table.childNodes[0].childNodes[i].innerHTML.replace(oldContent, newString);
												
											}
										}
									}
									
									// Show row
									table.childNodes[0].childNodes[i].style.display = ''
									
									
								} else {
									// hide row, no matching strings
									table.childNodes[0].childNodes[i].style.display = 'none'
								}
							}
						}
						
					});
					
				}*/
				
				// Adding New Row
				//console.log("Adding New Row #", td);
				let newFieldRow = newExpansionTable.insertRow(rowInsertion);
				
				if (parentTitle != "") {
					newFieldRow.title = parentTitle;
				}
				
				newFieldRow.clicked = [];
				rowInsertion ++
				//console.log(iframeSchemaTable[0].children[0].children[fieldCounter].children[0].innerText, tableRow);
				newFieldRow.className = "searchableSchema";
				newFieldRow.style.fontSize = "12";
				//newFieldRow.subRows = [];
				
				for (let i = 0; i < indent; i++) {
					newFieldRow.insertCell(0)
				}
				newFieldRow.indent = indent;
				// Ability to close subrows
				
				//console.log("subRows.push", subRows);
				row.subRows.push(newFieldRow);
					
				
				//let title = segment[tableRow].children[0].title;
				//console.log(iframeSchemaTable[0].children[0].children[tableRow].childElementCount);
				const borderBottom = "1px solid mediumpurple";
				
				// ITERATE THROUGH IFRAME TABLE'S ROW'S CELLS
				let tableCellCount = iframeSchemaTable[0].children[0].children[tableRow].childElementCount
				for (let i = 0; i < tableCellCount; i++ ) {
					let rowTitle = iframeSchemaTable[0].children[0].children[0].children[i].innerText // Header row for current iteration
					
					// Link Rows
					if ((rowTitle == "Data Structure") || (rowTitle == "Code Table")) {
						//console.log((rowTitle == "Code Table"));
						newFieldRow.insertCell(i + indent).innerHTML = iframeSchemaTable[0].children[0].children[tableRow].children[i].innerText //+ "<button class='expand'>See More</button>" 
						newFieldRow.cells[i + indent].className = "schemaField";
						newFieldRow.cells[i + indent].title = rowTitle;
						
						// Links
						if ((iframeSchemaTable[0].children[0].children[tableRow].children[i].children.length > 0) && (iframeSchemaTable[0].children[0].children[tableRow].children[i].children[0].getAttribute("href") != undefined)) {
							newFieldRow.cells[i + indent].innerHTML = newFieldRow.cells[i + indent].innerHTML //+ "<button class='expand'>See More</button>" 
							newFieldRow.cells[i + indent].className = "schemaFieldLink"
							
							newFieldRow.cells[i + indent].addEventListener("click", function(e) {
								
								let eTitle = e.target.title
								console.log("newFieldRow.clicked", newFieldRow.clicked, eTitle);
								// Minimise/maximise button behaviour
								if (!newFieldRow.clicked.includes(eTitle)) {
									let newFieldRowParentIndent = 0;
									console.log("e.target", e.target);
									if (eTitle == "Code Table") {
										newFieldRowParentIndent = e.target.cellIndex
										console.log(newFieldRowParentIndent, e.target.cellIndex);
									}
									newFieldRow.clicked.push(eTitle);
									console.log("newFieldRow", newFieldRow);
									let expandedRowParentId = newFieldRow.cells[0 + indent].innerText
									//console.log("expandedRowParentId", expandedRowParentId);
									let expandedRowHref = iframeSchemaTable[0].children[0].children[tableRow].children[i].children[0].getAttribute("href")
									expandRowAdvanced(newFieldRow, expandedRowHref, expandedRowParentId, newFieldRowParentIndent, eTitle);
									
									// Hide other expanded rows.
									for (let clickable = 0; clickable < newFieldRow.clicked.length; clickable++) {
										if (newFieldRow.clicked[clickable] != eTitle) {
											for (let i = 0; i < newFieldRow.subRows.length; i++) {
												if (eTitle != newFieldRow.subRows[i].title) {
													newFieldRow.subRows[i].style.display = "none";
													this.style.backgroundColor = "";
												}
											}
											// Remove Highlight from Cell
											for (let cell = 0; cell < newFieldRow.children.length; cell++) {
												if (newFieldRow.children[cell].title == newFieldRow.clicked[clickable]) {
													newFieldRow.children[cell].style.backgroundColor = "";
												}
											}
										}
									}
									this.style.backgroundColor = "mediumpurple";
								} else {
									console.log("ELSE!", newFieldRow.subRows);
									
									// Hide other expanded rows.
									for (let clickable = 0; clickable < newFieldRow.clicked.length; clickable++) {
										if (newFieldRow.clicked[clickable] != eTitle) {
											for (let i = 0; i < newFieldRow.subRows.length; i++) {
												if (eTitle != newFieldRow.subRows[i].title) {
													newFieldRow.subRows[i].style.display = "none";
													this.style.backgroundColor = "";
												}
											}
											// Remove Highlight from Cell
											for (let cell = 0; cell < newFieldRow.children.length; cell++) {
												if (newFieldRow.children[cell].title == newFieldRow.clicked[clickable]) {
													newFieldRow.children[cell].style.backgroundColor = "";
												}
											}
										}
									}
									
									//indent = indent + e.target.cellIndex;
									console.log("eTitle", eTitle, "newFieldRow.subRows", newFieldRow.subRows, "row.subRows", row.subRows);
										
									for (let i = 0; i < newFieldRow.subRows.length; i++) {
										if (eTitle == newFieldRow.subRows[i].title) {
											if (newFieldRow.subRows[i].style.display == "") {
												newFieldRow.subRows[i].style.display = "none";
												this.style.backgroundColor = "";
											} else {
												newFieldRow.subRows[i].style.display = "";
												this.style.backgroundColor = "mediumpurple";
											}
										}
									}
									newFieldRow.setAttribute("indent", indent);
									//newFieldRow.clicked = false;
									
								}
							});
						}
						
					} else {
						// Other Row (Without Link)
						if (iframeSchemaTable[0].children[0].children[tableRow].children[i].innerText != undefined) {
							if ((i == 0) && (iframeSchemaTable[0].children[0].children[tableRow].className != "headers") && (newFieldRow.title != "Code Table")) {
								newFieldRow.insertCell(i + indent).innerHTML = parentId + iframeSchemaTable[0].children[0].children[tableRow].children[i].innerText;
							} else {
								newFieldRow.insertCell(i + indent).innerHTML = iframeSchemaTable[0].children[0].children[tableRow].children[i].innerText;
							}
							
							newFieldRow.cells[i + indent].className = "schemaField";
							
							// Style Header
							if (iframeSchemaTable[0].children[0].children[tableRow].className == "headers") {
								newFieldRow.cells[i + indent].className = "schemaFieldHeader";
							}
							// Style border
							if ((parentId != "") && (i == 0)) {
								newFieldRow.cells[i + indent].style.borderLeft = "2px solid black"
							} else if ((parentId != "") && (i == tableCellCount-1)) {
								newFieldRow.cells[i + indent].style.borderRight = "2px solid black"
							}
							
							if (i == 0) {
								newFieldRow.cells[i + indent].style.padding = "2px 5px 2px 50px";
							}
							newFieldRow.cells[i + indent].title = rowTitle;
							
							
						}
					
					}
					// Style Headers
					if ((iframeSchemaTable[0].children[0].children[tableRow].className == "headers") || (iframeSchemaTable[0].children[0].children[tableRow].children[i].localName == "th")) {
						newFieldRow.cells[i + indent].style.backgroundColor = "mediumpurple";
						newFieldRow.cells[i + indent].style.color = "white";
					}
					
					// Style Borders
					if (iframeSchemaTableLength-1 == tableRow) {
						newFieldRow.cells[i + indent].style.borderBottom = "2px solid black"
					}
					
					
				}
				
				
				
				newFieldRow.addEventListener("mouseenter", function(e) {
					if (schemaRowClicked == undefined) {
						//console.log("newFieldRow.indent", newFieldRow.indent);
						let targetRowPropertyName = e.target.children[2 + newFieldRow.indent].innerHTML
						let targetRowField = e.target.children[0 + newFieldRow.indent].innerHTML
						e.target.style.backgroundColor = schemaRowHighlighColour;
						let aTags = e.target.parentNode.parentNode.previousElementSibling.querySelectorAll("a")

						for (let i = 0; i < aTags.length; i++) {
							let compareText = aTags[i].title.split("/");
							
							let field = compareText[0].replaceAll(/\(.*?\)/gm, ""); // Removes repeating brackets from field Title of aTag
							let description = compareText[1];
							if ((description.includes(targetRowPropertyName)) && (field.includes(targetRowField))) {
								// aTag title matches currently mouse hovered schema row. Highlight!
								aTags[i].classList.add("schemaMatch");
							} 
							
						}
					}
					
				});	
				
				newFieldRow.addEventListener("mouseleave", function(e) {
					if (schemaRowClicked == undefined) {
						let targetRowPropertyName = e.target.children[2 + newFieldRow.indent].innerHTML
						e.target.style.backgroundColor = "";
						
						let schemaMatchElems = e.target.parentNode.parentNode.previousElementSibling.querySelectorAll(".schemaMatch")
						//console.log("schemaMatchElems", schemaMatchElems);
						for (let x = 0; x < schemaMatchElems.length; x++) {
							schemaMatchElems[x].classList.remove("schemaMatch");
						}
					}
				});	
				
				newFieldRow.addEventListener("click", function(e) {
					if (e.target.title == "Data Structure") {
						return
					}
					if (schemaRowClicked == undefined) {
						schemaRowClicked = newFieldRow;
						schemaRowClicked.style.background = schemaRowClickColour;
					} else {
						schemaRowClicked.style.background = "";
						schemaRowClicked = undefined;
					}
				
				});	
				
			}	

		if (rowIndex == 0) {
			segmentTable.appendChild(newExpansionTable);
		}

		iframe.parentNode.removeChild(iframe);
		
		
	});	
	
	return subRows
	
}