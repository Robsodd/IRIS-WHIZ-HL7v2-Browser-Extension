/// Schema Expansion Content Script
console.log("Schema Expansion Content Script");

let clicked = false
let schemaSearch = false;

document.addEventListener("expandSchema", function(e) {
	schemaSearch = e.schemaSearch
	expandSchema();
});


document.addEventListener("contractSchema", function(e) {
	schemaSearch = false;
	contractSchema();
});


if (currentUrl.includes("&btns=disable")) {
	// Skip creating the buttons!
} else {
	addButtonBar(document);
	buttonBarStyle(document);
	searchExpandedSchemaButton(document);
}

/// CSS styling for buttons
/*
var head = document.getElementsByTagName('HEAD')[0];
var link = document.createElement('link');

link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/csp/sys/%25CSP.Portal.Home.zen';

head.appendChild(link);
*/

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
	for (let i = expandedSchema.length; i > 0; i--) {
		//console.log("expandedSchema", i, expandedSchema[i-1]);
		if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[0].className == "searchSegment") {
			if (expandedSchema[i-1].childNodes[0].childNodes[0].childNodes[0].childNodes[1].value == "") {
				expandedSchema[i-1].remove();
			}
		} else {
			expandedSchema[i-1].remove();
		}
		
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
	//console.log("newExpansionTable", newExpansionTable);
	//console.log("segmentTable1 ", segmentTable, segmentTable.childNodes[0].childNodes[0].childNodes.length);
	if (segmentTable.childNodes.length < 2) {
		if (segmentTable.childNodes[0].childNodes[0].childNodes[0].childNodes.length <= 3) {
			return
		}
		for (let td = 0; td < segment.length; td ++) {
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
							let table = newExpansionTable;
						
							// Allows search with spaces
							let textSearch = e.target.value.toLowerCase()
							textSearch = textSearch.replace(/\s/gm, " ");
							
							if (e.target.value == '') {
								for (let i = 1; i < table.childNodes[0].childNodes.length; i++) {
									table.childNodes[0].childNodes[i].style.display = '';
								}
							} else {
							
								for (let i = 1; i < table.childNodes[0].childNodes.length; i++) {
									
									// Allows search with spaces
									let tableValue = table.childNodes[0].childNodes[i].innerText.toLowerCase()
									tableValue = tableValue.replace(/\s/gm, " ");
									
									if (tableValue.includes(textSearch)) {
	
										table.childNodes[0].childNodes[i].style.display = ''
									} else {
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

					const borderBottom = "1px solid mediumpurple";
					newFieldRow.insertCell(0).innerHTML = title.split("/")[0];
					newFieldRow.cells[0].style.borderBottom = borderBottom;
					newFieldRow.cells[0].style.whiteSpace = "nowrap";
					newFieldRow.cells[0].style.padding = "2px 5px 2px 50px";
					newFieldRow.cells[0].style.fontSize = "12";
					newFieldRow.insertCell(1).innerHTML = title.split("/")[1];
					newFieldRow.cells[1].style.borderBottom = borderBottom;
					newFieldRow.cells[1].style.whiteSpace = "nowrap";
					newFieldRow.cells[1].style.padding = "2px 5px";
					newFieldRow.cells[1].style.fontSize = "12";
					newFieldRow.insertCell(2).innerHTML = segment[td].innerHTML;
					newFieldRow.cells[2].style.borderBottom = borderBottom;
					newFieldRow.cells[2].style.whiteSpace = "nowrap";
					newFieldRow.cells[2].style.padding = "2px 5px";
					newFieldRow.cells[2].style.fontSize = "12";
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
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}
	} 
				
				
	if (expandorElement.className.includes("EDIDocumentTableSegnum")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			schemaSearch = false;
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}
	}


	if (expandorElement.className.includes("EDIDocumentTableSegid")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			schemaSearch = false;
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}			
	}
}

