/// Schema Expansion Content Script
console.log("Schema Expansion Content Script");

let clicked = false
//let schemaTableStyle = document.querySelector("body > table:nth-child(1)")
//let schemaTable = document.querySelector("body > table:nth-child(1) > tbody")


/*
let expandAllNewCell = schemaTable.rows.item(0).insertCell(-1)
expandAllNewCell.style.whiteSpace = "nowrap"
*/

document.addEventListener("expandSchema", function(e) {
	expandSchema();
});


document.addEventListener("contractSchema", function(e) {
	contractSchema();
});


if (currentUrl.includes("&btns=disable")) {
	// Skip creating the buttons!
} else {
	addButtonBar(document);
	buttonBarStyle(document);
	
	expandSchemaButton(document);
	//expandAllNewCell.appendChild(expandSchemaBtn);
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
	console.log("ROWS", rows);

	var table = document.querySelector("body > table.EDIDocumentTable")
	console.log("TABLE: ", table);

	for (var i = 0, row; row = rows[i]; i++) {
		expandRow(row);

	}
}

function contractSchema() {
	let expandedSchema = document.getElementsByClassName("additionaltable")
	console.log("expandedSchema", expandedSchema);
	for (let i = expandedSchema.length; i > 0; i--) {
		console.log("expandedSchema", i, expandedSchema[i-1]);
		expandedSchema[i-1].remove();
	}
}


/// Expands the contents of the given Table Row (requires the main table row, not the sub-table used to display the segment fields)
function expandRow(row) {
	let fieldCounter = 0;
		
	let segmentTable = row.cells[4];
	let segment = row.cells[4].childNodes[0].childNodes[0].childNodes[0].childNodes;
	console.log("Segment", segment);
	let rowInsertion = 0;
	let newExpansionTable = document.createElement('table'); // class = edisegmenttable
	newExpansionTable.className = "edisegmenttable additionaltable";
	console.log("newExpansionTable", newExpansionTable);
	console.log("segmentTable1 ", segmentTable);
	if (segmentTable.childNodes.length < 2) {
		for (let td = 0; td < segment.length; td ++) {
			fieldCounter ++
			console.log("SEGMENT: ", segment[td]);
			if (segment[td].nodeValue == "\n") {
				// Skip extra Text Divs
			} else {
				if (segment[td].className == "EDISegmentsTableSeparator") {
					// Skip segment seperators.
				}
				else 
				{
					// Adding New Row
					console.log("Adding New Row #", td);
					let newFieldRow = newExpansionTable.insertRow(rowInsertion);
					rowInsertion ++
					
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
		console.log("segmentTable 3", segmentTable);
	}
}


// Add event listeners

let expansionElementClassnames = ["EDIDocumentTableExpandor", "EDIDocumentTableSegnum", "EDIDocumentTableSegid",]

// Add an event listener
document.addEventListener("addExpansion", function(e) {
	console.log("addExpasion Listener Triggered");
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
					console.log("expandorElement:", expandorElement);
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
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}
	} 
				
				
	if (expandorElement.className.includes("EDIDocumentTableSegnum")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}
	}


	if (expandorElement.className.includes("EDIDocumentTableSegid")) {
		if 	(expandorElement.nextElementSibling.nextElementSibling.childNodes.length < 2) {
			// EXPAND!
			expandRow(expandorElement.parentNode);
		} else {
			// CONTRACT!
			expandorElement.nextElementSibling.nextElementSibling.childNodes[1].remove();
		}			
	}
}

