

let exportCsvBtn = document.createElement("button");
exportCsvBtn.classList.add("whizButton","exportCsvBtn");
exportCsvBtn.innerText = "Export CSV";
exportCsvBtn.title = "Export the current search table as a CSV file";

exportCsvBtn.onclick = function() { 

    let tableData = extractTableData();
    
    // Call the function
    downloadCSV(tableData, 'table-data.csv');
}

window.addEventListener("load", function() { 
    document.body.appendChild(exportCsvBtn);

    let exportCsvBtnLi = document.createElement("li");

    exportCsvBtnLi.appendChild(exportCsvBtn)
    messageViewerBtnBar.appendChild(exportCsvBtnLi);
})


function downloadCSV(data, filename = 'data.csv') {
    console.log(data);

    const headers = Object.keys(data.dataRows[0]);

    // Create the CSV content
    const csvContent = [
        // Add the headers row
        headers.map(header => `"${header}"`).join(','),
        // Map over each row and format the fields
        ...data.dataRows.map(row => 
            headers.map(header => `"${row[header]?.toString().replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Export data from Message Viewer Table
function extractTableData() {
    const tpBody = document.getElementById("tpBody_78");
    const rows = tpBody.getElementsByTagName("tr");
    const headers = [];
    const dataRows = [];

    const thead = document.getElementById("tpHead_78");
    let headerRow = thead.getElementsByTagName("tr");
    let headerCells

    // Extract headers from the first row
    if (headerRow.length > 0) {
        headerCells = headerRow[0].getElementsByTagName("th");
        let rowData = {};
        for (let i = 2; i < headerCells.length; i++) {
            if (headerCells[i].textContent.trim() == "") continue
            headers.push(headerCells[i].textContent.trim())
            //rowData[headers[i-2]] = headerCells[i].textContent.trim();
        }
        //dataRows.unshift(rowData);
    }
    console.log("rows", rows);
    // Extract data from the rest of the rows
    for (let i = 0; i < rows.length-1; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let rowData = {};
        for (let j = 2; j < cells.length; j++) {
            rowData[headers[j-2]] = cells[j].textContent.trim();
        }

        dataRows.push(rowData);
    }
    //console.log("Extracted Data", dataRows);
    // Dynamically format data for Chart.js
    // the second column is the labels (x-axis) and other columns are datasets
    // 	2024-10-17 12:35:25.024
    //const labels = dataRows.map(row => (typeof row["Time Created"] === 'string' ? row["Time Created"].slice(0, 19).replace(" ", "T") : '')); 

    return {
        dataRows
    };
}