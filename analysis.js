//console.log("Analysis Script loaded");

let dataLimit = 200;
let showBarGraph = false;

let barChartCtx;
let barChartConfig;
let barChart;
let dynamicChartTimeConfig;

let lineChart;
let lineChartCtx;
let lineChartData;
let toggleLineGraph = false;

let pieChartSelected;
let selectedPieChartItem;

let chartData = [];
let filterData = [];
let filterOn = false;
let charts = [];
let pieCharts = [];

let selectedChartElement;
let selectedChartElementsTime = [];
let selectedDataBar;
const inflateAmount = 4;

let savedAnalysis;
let messageSearchTab;
let line = false;

let time;

let chartColours = {
        "OK": "rgb(114, 255, 136)", // pastel green
        "Completed": "rgb(0, 234, 35)", // green
        "Error": "rgb(222, 0, 0)", // red
        "Created": "rgb(173, 255, 110)", // light green
        "Queued": "rgb(210, 8, 136)", // purple
        "Delivered": "rgb(0, 109, 16)", // dark green
        "Discarded": "rgb(198, 198, 198)", // light grey
        "Suspended": "rgb(176, 103, 47)", // brown
        "Deferred": "rgb(242, 242, 64)", // yellow
        "Aborted": "rgb(108, 108, 108)", // dark grey
} 


chrome.storage.local.get({
	analysis: []
	}, function(stored) { 
		savedAnalysis = stored.analysis;
        console.log(savedAnalysis);
});

const zoomOptions = {
    pan: {
      enabled: true,
      mode: 'x',
      speed: 10,              // Control the speed of the panning when dragging
      threshold: 1,
      onPanStart({ chart }) {
        freezeAxis(chart.scales.y);
      },
      onPanComplete({ chart }) {
        unfreezeAxis(chart.scales.y);
      }
    },
    zoom: {
      wheel: {
        enabled: true,
        mode: 'x',
        onZoomStart({ chart }) {
            freezeAxis(chart.scales.y);
          },
        onZoomComplete({ chart }) {
            unfreezeAxis(chart.scales.y);
          }

      },
      pinch: {
        enabled: false
      },
      mode: 'x'
    }
  };


  function freezeAxis(scale) {
    scale.options.min = scale.min;
    scale.options.max = scale.max;
  }
  
  function unfreezeAxis(scale) {
    scale.options.min = null; // or infinite value, e.g., -1/0
    scale.options.max = null;
  }

  const borderPlugin = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
      const {ctx, chartArea: {left, top, width, height}} = chart;
      if (chart.options.plugins.zoom.zoom.wheel.enabled) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
      }
    }
  };


function getColour(colourKey) {
    // Check if the key already exists in chartColours
    let colour;
    //console.log("chartColours: ", colourKey);
    if (chartColours[colourKey]) {
        //console.log("Colour already found! ", colourKey, chartColours[colourKey]);
        return chartColours[colourKey];
    } else {
        //console.log("Generate New Colour ", colourKey);
        
        // Generate a unique color not already in chartColours
        do {
            colour = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        } while (Object.values(chartColours).includes(colour));
        
        // Assign and store this color in chartColours
        chartColours[colourKey] = colour;
        return colour;
    }
}


// Create button for message viewer page
window.addEventListener("load", function() { 
    if (currentUrl.includes("chrome-extension://")) {
        // skip
        scrollBarStyle(document);
        const divider = document.getElementById("divider");
        const leftContainer = document.getElementById("dataViewerContainer");
        const rightContainer = document.getElementById("chartsContainer");

        let initialX
		let dividerRect
		let initialLeft
        let isResizing = false;
        leftContainer.style.left = "0px"; 
        //divider.style.left = "50%"; 
        //rightContainer.style.width = "50%"; 
        const toggleSliderBtn = document.getElementById("toggleSliderBtn");
        toggleSliderBtn.innerText = "<";
        let previousWidth = leftContainer.style.width || "300px"; // Default width
        
        let toggleslider = false;
        let leftContainerDisplay = leftContainer.style.display;
        toggleSliderBtn.addEventListener("click", (e) => {
            console.log("Clicked Toggle Slider");
            if (toggleslider) {
                // Slider on, turn on behaviour.
                let previousWidthNumeric = parseInt(previousWidth.replace("px", ""), 10) || 300;
                console.log("Preivous Width ", previousWidth);
                // Restore the previous width
                //leftContainer.style.minWidth = "150px";
                
                leftContainer.style.width = previousWidth || "300px";
                leftContainer.style.display = leftContainerDisplay;
                leftContainer.children[0].style.display = leftContainerDisplay;
                divider.style.left = previousWidth || "300px";
                console.log("value of window change: ", window.innerWidth, previousWidth, window.innerWidth - (previousWidth || "300px"))
                rightContainer.style.width = (window.innerWidth - (previousWidthNumeric || 300)) +"px";
                //previousWidth = leftContainer.style.minWidth || "150px"; // Default width
                toggleSliderBtn.innerText = "<";
                toggleslider = false;
                toggleSliderBtn.style.marginRight = "unset";
            } else {
                // Slider off, turn on behaviour
                // Save the current width and set to 0
                previousWidth = leftContainer.style.width || "300px"; // Default width
                console.log("Preivous Width ", previousWidth);
                //leftContainer.style.minWidth = "0px";
                
                
                leftContainer.style.minWidth = "0px"; // Default width
                divider.style.left = "0px";
                rightContainer.style.width = "100%";
                toggleSliderBtn.innerText = ">";
                toggleSliderBtn.style.marginLeft = "5px";
                //previousWidth = leftContainer.style.width;
                leftContainer.style.display = "none";
                leftContainer.children[0].style.display = "none";
                toggleslider = true;
            }
        });

        
        divider.addEventListener("mousedown", function (e) {
            if (e.target == toggleSliderBtn) return
            document.body.classList.add('no-select');
            isResizing = true;
            document.body.style.cursor = "col-resize";
            initialX = e.clientX;
			dividerRect = divider.getBoundingClientRect();
			initialLeft = dividerRect.left;
            
            
            //toggleSliderBtn.innerText = "<";
            if (toggleslider) {
                leftContainer.style.width = "0px";
            }
            
        });

        document.addEventListener("mousemove", function (e) {
            if (!isResizing) return;
            
            console.log("Mouse X:", e.clientX, "Divider Left:", divider.style.left);
            // Check current width of the right container
            const currentRightWidth = rightContainer.offsetWidth;
            const currentleftWidth = leftContainer.offsetWidth;

            console.log("dividerWidth", dividerRect.left);
            console.log("currentRightWidth", currentRightWidth, e.clientX);
            console.log("currentleftWidth", currentleftWidth, e.clientX);
            console.log("window.innerWidth", window.innerWidth, window.width);

            // Prevent resizing if the width is less than the minimum (e.g., 300px)
            if (currentRightWidth < 300 && (window.innerWidth - e.clientX) < 300) return;
            const newLeft = initialLeft + (e.clientX - initialX);            
            if (newLeft > 0) leftContainer.style.display = leftContainerDisplay;
            if (newLeft > 50) leftContainer.children[0].style.display = leftContainerDisplay;
            if ((newLeft < 300) && (!toggleslider)) newLeft = 300; // Minimum width
            if (newLeft < 300) leftContainer.style.display.minWidth = 300;
			//divider.style.left = newLeft + "px";
			//leftContainer.style.width = leftContainer.style.width  + (initialX - e.clientX);
			//rightContainer.style.width = (window.innerWidth - e.clientX - 5) + "px";

			divider.style.left = newLeft + "px";
			leftContainer.style.width = newLeft - 5 + "px";
			rightContainer.style.width = (window.innerWidth - newLeft) - 5 + "px";

        });

        document.addEventListener('mouseup', () => {
            document.body.classList.remove('no-select');
        });

        document.addEventListener("mouseup", function () {
            document.body.classList.remove('no-select');
            if (isResizing) {
                toggleSliderBtn.innerText = "<";
                toggleslider = false;
                toggleSliderBtn.style.marginRight = "unset";
            }
            isResizing = false;
            document.body.style.cursor = "default";
        });
        
        document.getElementById("resetZoomBtn").addEventListener("click", () => {
            console.log("clicked!!!!!!!!!")
            if (showBarGraph) {
                barChart.resetZoom();
            }
            lineChart.resetZoom();
            
        })
        
        
        
        // TO be removed v
        // Update chart config from textarea
        /*
        document.getElementById('updateChart').addEventListener('click', () => {
            const newConfig = document.getElementById('barChartConfig').value;
            try {
                const parsedConfig = JSON.parse(newConfig);
                barChart.config = parsedConfig;
                barChart.update(); // Destroy the old chart
                //barChart = new Chart(barChartCtx, parsedConfig); // Create a new chart with updated config
            } catch (error) {
                console.error('Invalid JSON:', error);
                alert('Please enter a valid JSON configuration.');
            }
        });*/
        // TO be removed ^

        // Add button bars to divs
        let messageViewBox = document.getElementById("selectedMessages");
        let selectedDataBox = document.getElementById("selectedData");
        let importedDataBox = document.getElementById("chartData");

        // add button bar
        let selectedMessagesBar = messageButtonBar(document, "selectedMessages");
        openSelectedMessagesButton(document, selectedMessagesBar);
        let clearSelectedMessagesBtn = clearSelectedMessagesButton(document, selectedMessagesBar)
        minimiseButton(document, messageViewBox,selectedMessagesBar);
        messageViewBox.appendChild(selectedMessagesBar);       

        selectedDataBar = messageButtonBar(document, "selectedData");
        let toggleFilterBtn = toggleFilterButton(document, selectedDataBar);
        
        minimiseButton(document, selectedDataBox,selectedDataBar);
        selectedDataBox.appendChild(selectedDataBar);
        
        let chartDataBar = messageButtonBar(document, "chartData");
        minimiseButton(document, importedDataBox,chartDataBar);
        importedDataBox.appendChild(chartDataBar);

        clearSelectedMessagesBtn.addEventListener('click', () => {
            if (sortedMessageArray.length == 0) {
                return
            }
            
            console.log("attempting to clear: ", barChart.data.datasets);
            barChart.data.datasets.forEach(dataset => {
                dataset.borderWidth = 0; // Set all border widths
                dataset.borderColour = ""; // Set all border widths
                dataset.inflateAmount = 0;
            });
        
            barChart.update();
            
            sortedMessageArray = [];
            selectedChartElementsTime = [];
            updateDataViewerSelectedMessage();
            updateSelectedTimeChart(barChart);
            barChart.update();
        })


        toggleFilterBtn.addEventListener("click", (e)=> {
            if (filterOn) {
                // set all charts back to chartData
                //buildAllCharts(chartData, chartData.headers);
                updateAllCharts(chartData, chartData.headers)
                //console.log("CHARTDATA FILTER: ", chartData);
                // Set button class back to off
                e.target.classList.remove("on");
                e.target.classList.add("off");
                e.target.innerText = "Toggle Filter: Off";
                if (showBarGraph) {
                    barChart.options.plugins.subtitle.text = "(All)";
                    barChart.update();
                }
                lineChart.options.plugins.subtitle.text = '(All)';
                if (lineChart.config.data.datasets.length > 8) {
                    lineChart.config.options.plugins.legend.position = "left"
                } else {
                     lineChart.config.options.plugins.legend.position = "top"
                }
                lineChart.update();
                filterOn = false;
            } else {
                // set all charts to filterData
                //console.log("FILTERDATA FILTER: ", filterData);
                //buildAllCharts(filterData, chartData.headers);
                updateAllCharts(filterData, chartData.headers)

                if (showBarGraph) {
                    barChart.options.plugins.subtitle.text = "(Filtered: " + pieChartSelected + ":" + selectedPieChartItem +")";
                    barChart.update();
                }
                lineChart.options.plugins.subtitle.text = "(Filtered: " + pieChartSelected + ":" + selectedPieChartItem +")";
                if (lineChart.config.data.datasets.length > 8) {
                    lineChart.config.options.plugins.legend.position = "left"
                } else {
                     lineChart.config.options.plugins.legend.position = "top"
                }
                lineChart.update();
                e.target.classList.remove("off");
                e.target.classList.add("on");
                e.target.innerText = "Toggle Filter: On";
                filterOn = true;
            }
        })

    } else {

        let analysisBtn = document.createElement("button");
        analysisBtn.classList.add("whizButton");
        analysisBtn.classList.add("analysisBtn");
        let analysisBtnLi = document.createElement("li");
        //buttonStyling(analysisBtn);
        analysisBtn.innerText = "Analyse";
        analysisBtnLi.appendChild(analysisBtn)
        messageViewerBtnBar.appendChild(analysisBtnLi);

        //document.body.appendChild(analysisBtn);

        analysisBtn.onclick = function() { 
            // Analysis object created in the save message viewer script.
            // Grab data from page
            let data = extractDynamicTableData(); 

            //Get max an min datetime from data
            let dataSearch = false;
            console.log(savedAnalysis);

            // Send in message to background monitor
            chrome.runtime.sendMessage({type: "analysis", data: data, currentUrl: currentUrl, analysis: dataSearch}).then((response) => {
                //console.log("Analysis response",response);
            });
        }
        /*
        let analysisSaveBtn = document.createElement("button");
        
        buttonStyling(analysisSaveBtn);
        analysisSaveBtn.style.backgroundColor = "pink";
        analysisSaveBtn.style.color = "white";
        analysisSaveBtn.style.position = "absolute";
        analysisSaveBtn.style.marginLeft = "270px";
        analysisSaveBtn.style.bottom = "5px";
        analysisSaveBtn.innerText = "Analyse & Save";

        document.body.appendChild(analysisSaveBtn);

        analysisSaveBtn.onclick = function() { 
            // Analysis object created in the save message viewer script.
            // Grab data from page
            let data = extractDynamicTableData(); 

            //Get max an min datetime from data
            
            let range = getTimeRange(data.data[0].data);
            let dataSearch = false;
            
            console.log("SETTINGS: ", settings);
            dataSearch = saveSearchAnalysis(range, "");
            // TODO: save data search into local storage.
            console.log("dataSearch", dataSearch); 
            savedAnalysis.push(dataSearch)
            chrome.storage.local.set({ analysis: savedAnalysis
                }).then(() => {
                    console.log("Analysis is set");
                });
            
            console.log(savedAnalysis);

            // Send in message to background monitor
            chrome.runtime.sendMessage({type: "analysis", data: data, currentUrl: currentUrl, analysis: dataSearch}).then((response) => {
                //console.log("Analysis response",response);
            });
            
        }*/
    }
})

// Export data from Message Viewer Table
function extractDynamicTableData() {
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
        for (let i = 2; i < headerCells.length; i++) {
            if (i==2) {
                headers.push("Count");
            } else{ 
                headers.push(headerCells[i].textContent.trim());
            }
           
        }
    }
    //console.log("HEADERS: ", headers);
    // Extract data from the rest of the rows
    for (let i = 0; i < rows.length-1; i++) {
        const cells = rows[i].getElementsByTagName("td");
        const rowData = {};

        for (let j = 2; j < cells.length; j++) {
            if (j==2) {
                rowData[headers[j-2]] = 1;
            } else {
                if (headers[j-2]=="Time Created") {
                    let timeCreated = cells[j].textContent
                    timeCreated = timeCreated.slice(0,19)
                    timeCreated = timeCreated.replaceAll(" ", "T")
                    rowData["TimeCreated"] = timeCreated;
                } else {
                    rowData[headers[j-2]] = cells[j].textContent.replace("\n", "");
                }

                if (headerCells[j-2].textContent.trim() == "Session") {
                    let sessionId = stubUrl[0] + "EnsPortal.VisualTrace.zen?SESSIONID=" + cells[j-2].textContent.replace("\n", "");
                    rowData["sessionURL"] = sessionId;
                }
                

            }
            
        }

        dataRows.push(rowData);
    }
    //console.log("Extracted Data", dataRows);
    // Dynamically format data for Chart.js
    // the second column is the labels (x-axis) and other columns are datasets
    // 	2024-10-17 12:35:25.024
    //const labels = dataRows.map(row => (typeof row["Time Created"] === 'string' ? row["Time Created"].slice(0, 19).replace(" ", "T") : ''));
    const datasets = [
        {
            label: "Messages",
            data: dataRows,
            backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}`,
            borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}`,
            borderWidth: 3
        }
    ];
  

    return {
        headers: headers,
        data: datasets
    };
}


function buildAllCharts(data, headers) {
    //console.log("Message matched: Performing an action");
    time = setDynamicChartControlOption(data.data[0].data);
        //chartData = data;

        const skipHeaders = ["Count", "ID", "Time Created", "Session"];
        const pieHeaders = ["Source", "Target", "Error", "Status"]

        for (let i = 0; i < headers.length; i++) {
            if (skipHeaders.includes(headers[i])) {
                //skip
                //console.log("skipping: ", headers[i])
            } else if (pieHeaders.includes(headers[i])) {
                let pieChart = createPieChart(data, headers[i]);
                pieCharts.push(pieChart);
                let btnBar = messageButtonBar(document, headers[i]);
                pieChart.domObject.parentElement.appendChild(btnBar);
                
                let lineGraphViewBtn = lineGraphViewButton(document, btnBar);
                minimiseChartButton(document, pieChart.domObject, btnBar);
                maximiseButton(document, btnBar);
                pieChart.lineGraphViewBtn = lineGraphViewBtn;
                lineGraphViewBtn.clicked = false;
                lineGraphViewBtn.addEventListener('click', ()=> {
                    console.log("THIS IS THE PIE CHART: ", pieChart);
                    if (!lineGraphViewBtn.clicked) {
                        lineGraphViewBtn.clicked = true;
                        lineGraphViewBtn.innerText = "ON";
                        lineGraphViewBtn.style.background = "green";
                        toggleLineGraph = headers[i];
                        let prepData
                        if (filterOn) {
                            prepData = JSON.parse(JSON.stringify(filterData.data[0].data));
                        } else {
                            prepData = JSON.parse(JSON.stringify(data.data[0].data));
                        }
                        lineChartData = lineGraphDataPrepWithColumnfilter(prepData, headers[i]);
                        for (let i = 0; i < pieCharts.length; i++) {
                            if ((pieCharts[i].chart.options.type == "doughnut") && (pieCharts[i] != pieChart)) {
                                console.log(pieCharts[i]);
                                pieCharts[i].lineGraphViewBtn.style.background = "red";
                                pieCharts[i].lineGraphViewBtn.innerText = "OFF"
                                pieCharts[i].lineGraphViewBtn.clicked = false;
                            }
                        }
                    } else {
                        lineGraphViewBtn.clicked = false;
                        lineGraphViewBtn.innerText = "OFF";
                        lineGraphViewBtn.style.background = "red";
                        toggleLineGraph = false;
                        let prepData
                        if (filterOn) {
                            prepData = JSON.parse(JSON.stringify(filterData.data[0].data));
                        } else {
                            prepData = JSON.parse(JSON.stringify(data.data[0].data));
                        }
                        lineChartData = collateDataByTimeFrame(prepData);
                    }    
                    
                    console.log("lineChartData",lineChartData);
                    lineChart.data.datasets = lineChartData.datasets;
                    lineChart.data.labels = lineChartData.labels;
                    if (lineChart.config.data.datasets.length > 8) {
                        lineChart.config.options.plugins.legend.position = "left"
                    } else {
                         lineChart.config.options.plugins.legend.position = "top"
                    }
                    lineChart.update();
                })
                
            } else {

                let newCanvas = document.createElement("canvas")
                let chartContainer = document.createElement("div");
                chartContainer.classList.add("chartContainer")
                chartContainer.appendChild(newCanvas);

                let chartRow = document.createElement("div");
                chartRow.classList.add("chart-row")
                
                

                let customRow = document.getElementById("customRow");
                if ((customRow.lastChild.childElementCount == 2) || (customRow.childElementCount == 0)) {
                    chartRow.appendChild(chartContainer);
                    customRow.appendChild(chartRow);
                } else {
                    customRow.lastChild.appendChild(chartContainer);
                }


                newCanvas.id = headers[i]
                let pieChart = createPieChart(data, headers[i]);
                pieCharts.push(pieChart);
                let btnBar = messageButtonBar(document, headers[i]);
                pieChart.domObject.parentElement.appendChild(btnBar);
                
                let lineGraphViewBtn = lineGraphViewButton(document, btnBar);
                minimiseChartButton(document, pieChart.domObject, btnBar);
                maximiseButton(document, btnBar);
                pieChart.lineGraphViewBtn = lineGraphViewBtn;
                lineGraphViewBtn.addEventListener('click', ()=> {
                    console.log("THIS IS THE PIE CHART: ", pieChart);
                    if (!lineGraphViewBtn.clicked) {
                        lineGraphViewBtn.clicked = true;
                        lineGraphViewBtn.innerText = "ON";
                        lineGraphViewBtn.style.background = "green";
                        toggleLineGraph = headers[i];
                        let prepData
                        if (filterOn) {
                            prepData = JSON.parse(JSON.stringify(filterData.data[0].data));
                        } else {
                            prepData = JSON.parse(JSON.stringify(data.data[0].data));
                        }
                        lineChartData = lineGraphDataPrepWithColumnfilter(prepData, headers[i]);
                        for (let i = 0; i < pieCharts.length; i++) {
                            if ((pieCharts[i].chart.options.type == "doughnut") && (pieCharts[i] != pieChart)) {
                                pieCharts[i].lineGraphViewBtn.style.background = "red";
                                pieCharts[i].lineGraphViewBtn.innerText = "OFF"
                                pieCharts[i].lineGraphViewBtn.clicked = false;
                            }
                        }
                    } else {
                        lineGraphViewBtn.clicked = false;
                        lineGraphViewBtn.innerText = "OFF";
                        lineGraphViewBtn.style.background = "red";
                        toggleLineGraph = false;
                        let prepData
                        if (filterOn) {
                            prepData = JSON.parse(JSON.stringify(filterData.data[0].data));
                        } else {
                            prepData = JSON.parse(JSON.stringify(data.data[0].data));
                        }
                        lineChartData = collateDataByTimeFrame(prepData);
                    }    
                    
                    console.log("lineChartData",lineChartData);
                    lineChart.data.datasets = lineChartData.datasets;
                    lineChart.data.labels = lineChartData.labels;
                    if (lineChart.config.data.datasets.length > 8) {
                        lineChart.config.options.plugins.legend.position = "left"
                    } else {
                         lineChart.config.options.plugins.legend.position = "top"
                    }
                    lineChart.update();
                })
            }
        }
        
        if (data.data[0].data.length > dataLimit) {
            showAlertWithOptions('Data exceeds data limit of ' + dataLimit + ' recommended for using the bar chart. Do you want to load the bar chart?', function (response) {
                if (response === 'continue') {
                    console.log('User chose to continue.');

                    showBarGraph = true;
                    //document.getElementById("lineChart").parentElement.parentElement.style.display = "none";
                    let timeChart = createTimeChartBar(data);
                    let btnBar = messageButtonBar(document, timeChart.domObject.id);
                    timeChart.domObject.parentElement.parentElement.appendChild(btnBar);
                    minimiseChartButton(document, timeChart.domObject, btnBar);
                    maximiseButton(document, btnBar);
                    //console.log("collatedData", collateDataByTimeFrame(data.data[0].data));

                } else {
                    document.getElementById("barChartRow").style.display = "none";
                }
            })
        } else {
            showBarGraph = true;
            //document.getElementById("lineChart").parentElement.parentElement.style.display = "none";
            let timeChart = createTimeChartBar(data);
            let btnBar = messageButtonBar(document, timeChart.domObject.id);
            timeChart.domObject.parentElement.parentElement.appendChild(btnBar);
            minimiseChartButton(document, timeChart.domObject, btnBar);
            maximiseButton(document, btnBar);
            //console.log("collatedData", collateDataByTimeFrame(data.data[0].data));
        }
        chartData = data
        //document.getElementById("barChart").parentElement.parentElement.style.display = "none";
        const newDataset = JSON.parse(JSON.stringify(data.data[0].data));
        let lineChartData = collateDataByTimeFrame(newDataset);
        let lineChartObj = createTimeChartLine(lineChartData);
        console.log(lineChart);
        console.log("post collation", lineChartData);
        let btnBar = messageButtonBar(document, "lineChart");
        lineChartObj.domObject.parentElement.parentElement.appendChild(btnBar);
        minimiseChartButton(document, lineChartObj.domObject, btnBar);
        maximiseButton(document, btnBar);

}

function createTimeChartBar(chartData, timeUnit) {

    // Use the data to create a Chart.js chart
    let canvas = document.getElementById('barChart')
    barChartCtx = canvas.getContext('2d');
    const labels = chartData.data[0].data.map(row => row.TimeCreated);

    let dataSets = prepareTimeChartData(chartData);
    console.log("original timechart data: ", dataSets);

    
    //time = setDynamicChartControlOption(chartData.data[0].data);
    console.log("CreateTimeChartBar");
    //console.log("SETS: ", dataSets);
    let config = {
        type: 'bar', // You can change this to 'bar', 'line', 'pie', etc.
        data: {
            labels: labels,
            datasets: dataSets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                zoom: zoomOptions,                
                beforeInit: (chart, options) => {
                      chart.legend.afterFit = () => {
                        if (chart.legend.margins) {
                          // Put some padding around the legend/labels
                          chart.legend.options.labels.padding = 20;
                          // Because you added 20px of padding around the whole legend,
                          // you will need to increase the height of the chart to fit it
                          chart.height += 40;
                        }
                      };
                },
                
                legend: {
                    display: false, // Hides the legend,
                    padding: {
                        bottom: 20
                    }
                },
                datalabels: {
                    display: false
                },
                title: {
                    display: true,
                    text: "Messages by Time" // Set the chart title here
                },
                subtitle: {
                    display: true,
                    text: '(All)' // Customize chart title
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            console.log("tooltip label context",context);
                            const backtickString = Object.entries(context.dataset.data[0])
                            .filter(([key]) => key !== "Count" && key !== "sessionURL")
                            .map(([key, value]) => `${key}: ${value}
                            `)


                            return backtickString;
                        }
                    }
                }
            },
            parsing: {
                yAxisKey: "Count",
                xAxisKey: "TimeCreated"
              },
            scales: {
                x: {
                    clip: true,
                    stacked: true,
                    type: 'time',
                    time: {
                        unit: time,
                        round: time,
                        tooltipFormat: 'yyyy-MM-dd HH:mm', // Format for tooltip
                        displayFormats: {
                            hour: 'yyyy-MM-dd HH:mm', // Format for axis labels
                            day: 'yyyy-MM-dd',
                            minute: 'yyyy-MM-dd HH:mm'
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            },
            onClick: (event, elements) => {
                const chart = event.chart;
                // HIGHLIGHTS
                // Clear previous highlights
                /*for (let i =0; i < charts.length; i++) {
                    chart.data.datasets[0].borderWidth = chart.data.datasets[0].data.map(() => 0);
                    chart.update();
                }*/
                let alreadySelected = false;

                if (elements.length > 0) { // Check if a bar was clicked
                    const datasetIndex = elements[0].datasetIndex;
                    const dataIndex = elements[0].index;
            
                    // Access the specific dataset
                    const dataset = config.data.datasets[datasetIndex];
                    
                    /*
                    // Ensure backgroundColor and borderColor are arrays for individual bar styling
                    if (!Array.isArray(dataset.backgroundColor)) {
                        dataset.backgroundColor = new Array(dataset.data.length).fill(dataset.backgroundColor || 'rgba(0,0,0,0.5)');
                    }
                    if (!Array.isArray(dataset.borderColor)) {
                        dataset.borderColor = new Array(dataset.data.length).fill(dataset.borderColor || 'rgba(0,0,0,0.5)');
                    }
                    
                    // Ensure borderWidth is an array for individual bar styling
                    if (!Array.isArray(dataset.borderWidth)) {
                        dataset.borderWidth = new Array(dataset.data.length).fill(1); // Default width
                    }*/
            
                    // Set the clicked bar's border color to black and border width to 6
                    

                    if (dataset.borderColor == 'black') {
                        alreadySelected = true;
                        dataset.borderColor = '';
                        dataset.borderWidth = 0;
                        dataset.inflateAmount = 0;
                        dataset.borderSkipped = false;
                        event.chart.update();
                        console.log("dataset clicked", dataset);
                    } else {
                        dataset.borderColor = 'black';
                        dataset.borderWidth = 2;
                        dataset.borderSkipped = false;
                        dataset.inflateAmount = inflateAmount;
                        event.chart.update();
                        
                        console.log("dataset clicked", dataset);
                    }
            
                    // Update the chart to apply the changes
                   event.chart.update();
                }
                
                // Selected Elements update
                if (elements.length > 0) {
                    const datasetIndex = elements[0].datasetIndex;
                    const dataIndex = elements[0].index;
                    const data = config.data.datasets[datasetIndex].data[0];
                    if (alreadySelected) {
                        const index = selectedChartElementsTime.findIndex(item => item === data);
                        // Check if the object exists in the array
                        if (index !== -1) {
                            // Remove the object at the found index
                            selectedChartElementsTime.splice(index, 1);
                        }
                    } else {
                        selectedChartElementsTime.push(data);
                    }
                    
                   
                    updateDataViewerSelectedMessage();
                }
                
                
            },
            onHover: (event, elements) => {
                
                if (elements.length) {
                    // Custom behavior for hover
                    canvas.style.cursor = 'pointer';
                    const segment = elements[0];
                    const datasetIndex = segment.datasetIndex;
                    const index = segment.index;
                    console.log('Hovering over segment:', datasetIndex, index);
    
                    // Additional custom actions can go here
                } else {
                    canvas.style.cursor = 'default';
                }
            },
            barThickness: 20 // Set a fixed thickness for the bars

        }
       //plugins: [borderPlugin]
    }
    barChartConfig = config;
    dynamicChartTimeConfig = config;
    //console.log("Chart config", config);
     // Load initial config into textarea
     //document.getElementById('barChartConfig').value = JSON.stringify(barChartConfig, null, 2);
      //const dynamicChart = new Chart(ctx, cfg)
    barChart = new Chart(barChartCtx, config);
    console.log("ChartDataBAR config", config);

    //See if selected elements are in this chart
    updateSelectedTimeChart(barChart);
    charts.push(barChart);
    //console.log("chart created!");
    return {chart: barChart, domObject: canvas }
}

function createTimeChartLine(chartData) { 
    // Use the canvas element where the chart will be rendered
    let canvas = document.getElementById('lineChart');
    lineChartCtx = canvas.getContext('2d');
    //time = setDynamicChartControlOption(chartData.data[0].data);
    lineChartData = chartData;
    console.log("line chart chartData", chartData); // Debugging: Log chart data
    console.log("Selected time frame:", time); // Debugging: Log selected time frame

    // Access the data for the specified time frame
    let data = lineChartData; // Use 'time' to access the specific time frame (e.g., "day", "hour")

    if (!data) {
        console.log('No data available for the selected timeframe.');
        return;
    }
        //console.log("chartDataObject", chartDataObject);

    // Configure the chart options
    let config = {
        type: 'line', // Specify line chart type
        data: {
            labels: data.labels,
            datasets: data.datasets
        }, // Pass in prepared data
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                zoom: zoomOptions,
                title: {
                    display: true,
                    text: 'Messages by Time' // Customize chart title
                },
                subtitle: {
                    display: true,
                    text: '(All)' // Customize chart title
                },
                legend: {
                    position: 'top', // Display the legend at the top
                    labels: {
                        padding: 20 // Optional padding for labels
                    }
                },
                datalabels: {
                    display: false // Hides labels on data points
                }
            },
            scales: {
                x: {
                    type: 'time', // Use time scale for x-axis
                    time: {
                        unit: chartData['time'], // Dynamically use the 'time' argument (e.g., "day", "hour")
                        tooltipFormat: 'yyyy-MM-dd HH:mm', // Format for tooltip
                        displayFormats: {
                            hour: 'yyyy-MM-dd HH:mm', // Format for axis labels
                            day: 'yyyy-MM-dd',
                            minute: 'yyyy-MM-dd HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: true, // Set y-axis to begin at zero
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    };

    // Initialize the chart with the canvas context and the configuration
    lineChart = new Chart(lineChartCtx, config);
    charts.push(lineChart);
    console.log("Chart created successfully.");
    return {chart: lineChart, domObject: canvas }
}

function prepareTimeChartDataLine(chartData) {
    let dataSets = []
    for (let i = 0; i < chartData.length; i++ ) {
        
        //let colour = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
        let colour = getColour(chartData[i].TimeCreated);
        let set = {
            label: chartData[i].TimeCreated,
            data: [
                chartData[i]
            ],
            backgroundColor: colour,
            borderColor: colour,
            borderWidth: 3
        }
        dataSets.push(set);

    }
    return dataSets
}


function prepareTimeChartData(chartData) {
    let dataSets = []
    for (let i = 0; i < chartData.data[0].data.length; i++ ) {
        
        //let colour = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
        let colour = getColour(chartData.data[0].data[i].TimeCreated);
        let set = {
            label: chartData.data[0].data[i].TimeCreated,
            data: [
                chartData.data[0].data[i]
            ],
            backgroundColor: colour,
            borderColor: colour,
            borderWidth: 3
        }
        dataSets.push(set);

    }
    return dataSets
}

function updateDataViewerSelectedMessage() {
    console.log('dataviewerData pre change', selectedChartElementsTime);
    
    const selectedMessage = document.getElementById('selectedMessage');
    selectedMessage.innerHTML = ""; // Clear any existing content

    // Create a table structure
    const table = document.createElement('table');
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.classList.add("data-table");
    
    // Iterate over the data entries
 
    if (selectedChartElementsTime.length > 0) {
        const HeaderRow = document.createElement('tr');
        // Header row
        for (const [key, value] of Object.entries(selectedChartElementsTime[0])) {
            if (key === 'sessionURL' || key === 'Count') continue; // Skip specific keys
            const keyCell = document.createElement('th');
            keyCell.style.fontWeight = "bold";
            keyCell.textContent = key;
            HeaderRow.appendChild(keyCell);
        }
        table.appendChild(HeaderRow); 
        
        for (let i = 0; i < selectedChartElementsTime.length; i++) {
            let dataRow = document.createElement('tr');
            for (const [key, value] of Object.entries(selectedChartElementsTime[i])) {
                if (key === 'sessionURL' || key === 'Count') continue; // Skip specific keys

                // Key cell (bold text)
                const dataCell = document.createElement('td');
                if (key === 'Session') {
                    // Create a clickable link for the 'Session' key
                    const link = document.createElement('a');
                    link.href = selectedChartElementsTime[i]['sessionURL'];
                    link.target = '_blank';
                    link.textContent = value;
                    dataCell.appendChild(link);
                } else {
                    // Plain text for other values
                    dataCell.textContent = value;
                }
                dataRow.appendChild(dataCell);
                // Add row to the table
            }
            table.appendChild(dataRow); 
        }
    } else {
        return
    }
    sortedMessageArray = JSON.parse(JSON.stringify(selectedChartElementsTime));
    for (let i = 0; i < sortedMessageArray.length; i++) {
        sortedMessageArray[i]["messageStartOperation"] = sortedMessageArray[i].Source;
        sortedMessageArray[i]["messageEndOperation"] = sortedMessageArray[i].Target;
        sortedMessageArray[i]["messageNumber"] = sortedMessageArray[i].ID;
    }
    console.log(selectedChartElementsTime);
   

    selectedMessage.appendChild(table); // Append the table to the dataViewer div
}

function closePopup(button) {
    const modal = button.parentElement;
    modal.parentElement.removeChild(modal);
}

document.addEventListener("DOMContentLoaded", function() {
    // Select all radio buttons with the name "timeUnit"
    const timeUnitRadios = document.getElementsByName("timeUnit");

    // Add a change event listener to the dropdown
    const timeUnitDropdown = document.querySelector('#dynamicChartControlBox select'); // Assuming the dropdown is within dynamicChartControlBox
    if (timeUnitDropdown) {
        timeUnitDropdown.addEventListener('change', function () {
            // Get the value of the selected option
            const selectedValue = this.value;
            time = this.value;
            //console.log("Selected time unit:", selectedValue);
            // Call function to update your chart or perform other actions
            updateChartTimeUnit(selectedValue);
        });
    }
});

// Function to handle the change in time unit
function updateChartTimeUnit(timeUnit) {
    // Implement your logic to update the chart based on the selected time unit
    //console.log("Update chart to use time unit:", timeUnit);
    time = timeUnit;
    if (showBarGraph) {
        let previousUnit = dynamicChartTimeConfig.options.scales.x.time.unit;
        let previousRound = dynamicChartTimeConfig.options.scales.x.time.round;
        dynamicChartTimeConfig.options.scales.x.time.unit = timeUnit;
        dynamicChartTimeConfig.options.scales.x.time.round = timeUnit;
        console.log(barChart.config, dynamicChartTimeConfig);
        barChart.config.options.scales = dynamicChartTimeConfig.options.scales;
        if (filterOn) {
            let data = prepareTimeChartData(filterData);
            barChart.config.data.datasets = data;
        } else {
            let data = prepareTimeChartData(chartData);
            barChart.config.data.datasets = data;
        }
        //barChart.destroy(); // Destroy the old chart
        try {
            //barChart = new Chart(barChartCtx, dynamicChartTimeConfig); // Create a new chart with updated config
            updateSelectedTimeChart(barChart);
            barChart.update();
        } catch (err) {
            console.log(err);
            dynamicChartTimeConfig.options.scales.x.time.unit = previousUnit;
            dynamicChartTimeConfig.options.scales.x.time.round = previousRound;
            
            barChart.config.options.scales = dynamicChartTimeConfig.options.scales;
            updateSelectedTimeChart(barChart);
            barChart.update();
            alert(err);        
        }

    } 
    let lineChartData;
    let newDataset;
    if (filterOn) {
        newDataset = JSON.parse(JSON.stringify(filterData.data[0].data));
    } else {
        newDataset = JSON.parse(JSON.stringify(chartData.data[0].data));
    }
    if (toggleLineGraph) {
        lineChartData = lineGraphDataPrepWithColumnfilter(newDataset, toggleLineGraph);
    } else {
        lineChartData = collateDataByTimeFrame(newDataset);
    }
    lineChart.config.data.datasets = lineChartData.datasets
    lineChart.config.data.labels = lineChartData.labels
    lineChart.options.scales.x.time.unit = timeUnit;
    lineChart.options.scales.x.time.round = timeUnit;
    if (lineChart.config.data.datasets.length > 8) {
        lineChart.config.options.plugins.legend.position = "left"
    } else {
         lineChart.config.options.plugins.legend.position = "top"
    }
    lineChart.update();


}


function createPieChart(chartData, key) {
    Chart.register(ChartDataLabels);
    // Use the data to create a Chart.js chart
    let canvas = document.getElementById(key)
    let ctx = canvas.getContext('2d');
    //canvas.setAttribute("width", "400")
    //canvas.setAttribute("height", "400")
    //canvas.width = "400";
    //canvas.height = "400";

    let dataSet = transformDataPieChart(chartData.data, key)
    
    let dynamicChartPie = new Chart(ctx, {
        type: 'doughnut', // Specify the type of chart
        data: dataSet,
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            layout: {
                padding: {
                    top: 50,    // Add top padding
                    right: 20,  // Add right padding
                    bottom: 20, // Add bottom padding
                    left: 20    // Add left padding
                }
            },
            plugins: {
                legend: {
                    position: 'left'
                },
                datalabels: {
                    font: {
                        weight: 'bold'
                    },
                    color: '#ffffff', // Set the text color
                    anchor: 'center', // Position the label
                    align: 'center', // Align the label
                    clamp: true, // Prevent labels from spilling outside the chart
                    formatter: (value) => {
                        return value; // Show the value in the segment
                    }
                },
                title: {
                    display: true,
                    text: key // Set the chart title here
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return label + ': ' + value; // Custom tooltip
                        }
                    }
                }
            },
            onHover: (event, elements) => {
                
                if (elements.length) {
                    // Custom behavior for hover
                    if (filterOn) {
                        // No change
                    } else {
                        canvas.style.cursor = 'pointer';
                        const segment = elements[0];
                        const datasetIndex = segment.datasetIndex;
                        const index = segment.index;
                        console.log('Hovering over segment:', datasetIndex, index);
                    }
                    
    
                    // Additional custom actions can go here
                } else {
                    canvas.style.cursor = 'default';
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {

                    if (filterOn) {
                        return
                    }
                    pieChartSelected = key;
                    // HIGHLIGHTS
                     // Clear previous highlights
                     for (let i =0; i < charts.length; i++) {
                        if (charts[i].options.type == "doughnut") {
                            charts[i].data.datasets[0].borderWidth = charts[i].data.datasets[0].data.map(() => 0);
                            charts[i].update();
                        }
                    }
                     

                    // Get the clicked element(s)
                    const activePoints = dynamicChartPie.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                    //console.log("active points vs selectedChartElement", activePoints, selectedChartElement);
                    console.log("selectedChartElement",selectedChartElement);
                    // Compare by the index of the clicked segment to see if it matches the selected element
                    if (selectedChartElement && activePoints.length && selectedChartElement[0].index === activePoints[0].index) {
                        // update data
                        dataSet = transformDataPieChart(chartData.data, key)
                            
                        //console.log("UNFILTERED DATA given to createDataViewerTable: ", dataSet);
                        createDataViewerTable([]);  // resets data viewer
                        selectedChartElement = null;     // Reset the selection
                        
                    } else {
                        // Set selectedChartElement to the current activePoints
                        selectedChartElement = activePoints;

                        const dataIndex = elements[0].index;
                        selectedPieChartItem = dataSet.labels[dataIndex];
                        let data = [];
                        for (const item of chartData.data[0].data) {
                            // Check if the item's value for the specified key matches the event value
                            if (item[key] === dataSet.labels[dataIndex]) {
                                data.push(item); // Add matching item to collatedItems
                            }
                        }
                        filterData = {
                            headers: chartData.headers,
                            data: [
                                {
                                    data: data
                                }
                            ]
                        };

                        //console.log("FILTERED DATA given to createDataViewerTable: ", data)
                        createDataViewerTable(data);

                        if (activePoints.length) {
                            const clickedIndex = activePoints[0].index;
                            
                            // Highlight the clicked segment by increasing the border width
                            dynamicChartPie.data.datasets[0].borderWidth[clickedIndex] = 6;
                            
                            // Optionally, change the border color for the highlighted segment
                            dynamicChartPie.data.datasets[0].borderColor = dynamicChartPie.data.datasets[0].backgroundColor.map((color, i) =>
                                i === clickedIndex ? '#000000' : color  // Black border for clicked segment
                            );

                            
                    }
                    // Update the chart to apply changes
                    dynamicChartPie.update();
                }

                    
                    
                }
            }
        }
    })
    barChartConfig = dynamicChartPie.config;
    charts.push(dynamicChartPie);
    //console.log("Chart config", key, dynamicChartPie.config);
     // Load initial config into textarea
     //document.getElementById('barChartConfig').value = JSON.stringify(barChartConfig, null, 2);
      //const dynamicChart = new Chart(ctx, cfg)
    return {chart: dynamicChartPie, domObject: canvas }
    //console.log("chart created!");
}

function createDataViewerTable(data, createTable = true) {
    // Get the dataViewer element to place the table
    console.log("createDataViewerTable: ", data);
    const dataViewer = document.getElementById('dataViewer');
    dataViewer.innerHTML = ""; // Clear previous content
    if (data.length == 0) {
        let blankDiv = document.createElement("div")
        return blankDiv
    }

    // Create the table element
    const table = document.createElement('table');
    table.classList.add('data-table'); // Optional: add a CSS class for styling

    // Create the header row
    const headerRow = document.createElement('tr');
    const keys = Object.keys(data[0]).filter(key => key !== "Count" && key !== "sessionURL");
    
    keys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create rows for each data item
    data.forEach(item => {
        const row = document.createElement('tr');

        keys.forEach(key => {
            const cell = document.createElement('td');

            if (key === "Session") {
                // Create a clickable link for the session
                const link = document.createElement('a');
                link.href = item.sessionURL;
                link.target = '_blank';
                link.textContent = 'View Session';
                cell.appendChild(link);
            } else {
                cell.textContent = item[key];
            }
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    if (createTable) {
        dataViewer.appendChild(table);
    }
    

    return table
}

/// Set the colours here
function transformDataPieChartOG(originalData, key) {
        const counts = {};
        //console.log("originalData", originalData);
        // Loop through the original datasets
        originalData.forEach(dataset => {
            dataset.data.forEach(entry => {
                const value = entry[key]; // Get the value based on the specified key
    
                // Initialize the count if it doesn't exist
                if (!counts[value]) {
                    counts[value] = 0;
                }
    
                // Increment the count for this value
                counts[value] += entry.Count; // Assuming Count is always 1
            });
        });
    
        // Prepare the new data format for the pie chart
        const transformedData = {
            datasets: [{
                data: Object.values(counts), // The count values
                backgroundColor: data.labels.map(label => chartColours[label] || getColour(label)) 
            }],
            labels: Object.keys(counts) // The sources or targets
        };
    
        return transformedData;
    }


    function transformDataPieChart(originalData, key) {
        const counts = {};
        //console.log("Creating chart: ", key);
    
        // Loop through the original datasets
        originalData.forEach(dataset => {
            dataset.data.forEach(entry => {
                const value = entry[key]; // Get the value based on the specified key
    
                // Initialize the count if it doesn't exist
                if (!counts[value]) {
                    counts[value] = 0;
                }
    
                // Increment the count for this value
                counts[value] += entry.Count; // Assuming Count is always 1
            });
        });
    
        // Prepare the new data format for the pie chart
        const labels = Object.keys(counts); // The sources or targets
        const dataValues = Object.values(counts); // The count values
    
        // Generate the background colors
        const backgroundColor = labels.map(label => {
            return chartColours[label] || getColour(label);
        });
        //console.log("Chosen colour: ", backgroundColor);
        const transformedData = {
            labels: labels, // The sources or targets
            datasets: [{
                data: dataValues, // The count values
                backgroundColor: backgroundColor // The corresponding colors
            }]
        };
    
        // Logging for debugging purposes
        //console.log("Transformed Data:", transformedData);
    
        return transformedData;
    }


function updateAllCharts(data) {
    console.log("Updating data with ", data);
    for (let i =0; i < charts.length; i++) {
        //time = setDynamicChartControlOption(data.data[0].data);
        if (charts[i].options.type == "doughnut") {
            let key = charts[i].options.plugins.title.text;
            let dataSet = transformDataPieChart(data.data, key);
    
            charts[i].data = dataSet;
            charts[i].update();
        } else if ((charts[i].options.type == "bar") && (showBarGraph)) {
            console.log("unprepared: ", data);
            let barData = prepareTimeChartData(data);
            console.log("prepared: ", barData);
            charts[i].data.datasets = barData;
            updateSelectedTimeChart(charts[i]);
            
            charts[i].update();
        } else if ((charts[i].options.type == "line")) {
            const newDataset = JSON.parse(JSON.stringify(data.data[0].data));
            let collatedData
            if (toggleLineGraph) {
                collatedData = lineGraphDataPrepWithColumnfilter(newDataset, toggleLineGraph)
            }else {
                collatedData = collateDataByTimeFrame(newDataset);
            } 
            console.log(collatedData, time);
            //charts[i].data.labels = collatedData[time].labels;
            charts[i].data.datasets = collatedData.datasets;
            charts[i].update();
        }
    }
}

function updateSelectedTimeChart(chart) {
    for (let i = 0; i < chart.data.datasets.length; i++) {
        for (let y = 0; y < selectedChartElementsTime.length; y++) {
            if (chart.data.datasets[i].data[0].ID === selectedChartElementsTime[y].ID) {
                console.log((chart.data.datasets[i].data[0].ID === selectedChartElementsTime[y].ID), chart.data.datasets[i], selectedChartElementsTime[y], chart.data.datasets[i].data[0].ID,  selectedChartElementsTime[y].ID)
                chart.data.datasets[i].borderColor = "black";
                chart.data.datasets[i].inflateAmount = inflateAmount;
                chart.data.datasets[i].borderSkipped = false;
                chart.data.datasets[i].borderRadius = 5;
                chart.data.datasets[i].borderWidth = 2; // No quotes for numeric values
            }
        }
    }
    chart.update()
}


function getTimeRange(data) {
    console.log("GetTimeRange data", data);
    const timestamps = data.map(item => new Date(item.TimeCreated));
    
    // Get earliest and latest timestamps
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Format earliest and latest dates
    const formatEarliest = formatDate(earliest);
    const formatLatest = formatDate(latest);

    return {earliest, latest, formatEarliest, formatLatest}

}


function setDynamicChartControlOption(data) {
    // Extract all TimeCreated timestamps
    console.log("timestamp data ", data);

    let range = getTimeRange(data)

    // Calculate the time difference in milliseconds
    const timeDiffMs = range.latest - range.earliest;
    
    // Convert time difference to days for easy comparison
    const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
    console.log(timeDiffDays, range.earliest, range.latest);
    // Determine the appropriate time unit
    let selectedOption;
    if (timeDiffDays > 365) {
        selectedOption = "year";   // Use years if over 365 days
    } else if (timeDiffDays > 31) {
        selectedOption = "month";  // Use months if over 31 days
    } else if (timeDiffDays > 7) {
        selectedOption = "week";  // Use months if over 31 days
    }  else if (timeDiffDays > 1) {
        selectedOption = "day";    // Use days if over 1 day
    } else if (timeDiffDays * 24 > 1) {
        selectedOption = "hour";   // Use hours if over 1 hour
    } else {
        selectedOption = "minute"; // Use minutes otherwise
    }

    const controlBox = document.getElementById('dynamicChartControlBox');
    const dropdown = controlBox.querySelector('select'); // Find the dropdown
    if (dropdown) {
        dropdown.value = selectedOption; // Set the dropdown value to the selected option
    }
    return selectedOption
}

function saveAnalysisButton() {
    let analysisSaveBtn = document.getElementById("analysisSave");
    analysisSaveBtn.style.backgroundColor = "green";
    analysisSaveBtn.style.color = "white";
    analysisSaveBtn.style.position = "absolute";
    analysisSaveBtn.style.marginLeft = "270px";
    analysisSaveBtn.style.bottom = "5px";
    analysisSaveBtn.innerText = "Save Analysis";
    analysisSaveBtn.style.display = "block";
    let analysisTitle = document.getElementById("analysisTitle");
    analysisSaveBtn.onclick = function() {         
        
        // Send in message to background monitor
        let range = getTimeRange(chartData.data[0].data);
        chrome.runtime.sendMessage({type: "analysis_save", messageSearchTab:messageSearchTab, analysisName:analysisTitle.value, range: range}).then((response) => {
            //console.log("Analysis response",response);
        });
    }
    return analysisSaveBtn
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log("Message received:", message);

    // You can perform any action based on the received message here
    if (message.message === "analysis_data") {
        //console.log("message = ", message);
        chartData = message.data;
        
        let table = createDataViewerTable(chartData.data[0].data,false);
        let chartDataViewer = document.getElementById("chartDataViewer")
        chartDataViewer.appendChild(table);
        buildAllCharts(message.data, message.data.headers)
        messageSearchTab = message.messageSearchTab
    } /*else if (message.message === "analysis_save") {
        let analysis = false;
        
        analysis = saveSearchAnalysis(message.range, message.name); 
        console.log("SETTINGS: ", settings);

        // TODO: save data search into local storage.
        console.log("dataSearch", analysis); 
        savedAnalysis.push(analysis)
        chrome.storage.local.set({ analysis: savedAnalysis
            }).then(() => {
                console.log("Analysis is set");
            });

        sendResponse({ response: "analysis_saved" });
    }*/



    // Optionally send a response back
    sendResponse({ response: "Message received on the new tab" });
});

function collateDataByTimeFrameOG(data) {
    const { earliest, latest } = getTimeRange(data);
    const totalRange = latest - earliest; // Time range in milliseconds
    let collatedTime = setDynamicChartControlOption(data);

    // Define time intervals in milliseconds
    const timeFrames = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000, // Approximate
        year: 365 * 24 * 60 * 60 * 1000 // Approximate
    };

    const result = {};

    // Iterate over all time frames
    for (const [timeFrame, timeFrameMs] of Object.entries(timeFrames)) {
        const collatedData = {};
        const labels = []; // To store the label (time) values
        const dataPoints = []; // To store the y-axis values (counts)

        data.forEach(item => {
            const time = new Date(item.TimeCreated).getTime();
        
            // Calculate the starting time of the bucket this timestamp belongs to
            const bucketStartTime = new Date(Math.floor(time / timeFrameMs) * timeFrameMs);
        
            // Format time as YYYY-MM-DD (or any appropriate time format)
            const bucketKey = bucketStartTime.toISOString().split('.')[0]; 
        
            // Initialize count for this bucket if not already set
            if (!collatedData[bucketKey]) {
                collatedData[bucketKey] = { count: 0 };
            }
        
            // Increment the count for this bucket
            collatedData[bucketKey].count++;
        });

        // Populate labels and data points
        Object.entries(collatedData).forEach(([key, details]) => {
            labels.push(key); // Date string is pushed to labels
            dataPoints.push(details.count); // Count value is pushed to data
        });

        // Prepare dataset for this timeframe
        const dataset = {
            label: timeFrame,
            data: dataPoints, // Assign the actual data points to the dataset
            borderColor: "rgb(111,111,111)", 
            backgroundColor: "rgb(111,111,111)",
            borderWidth: 2
        };

        // Store the dataset under the respective time frame
        result[timeFrame] = { labels, datasets: [dataset] };
    }

    result["time"] = collatedTime;
    console.log("result of all datasets for lineChart", result);
    return result;
}



function collateDataByTimeFrameog2(data) {
    const { earliest, latest } = getTimeRange(data);
    const totalRange = latest - earliest; // Time range in milliseconds
    let collatedTime = setDynamicChartControlOption(data);

    // Define time intervals in milliseconds
    const timeFrames = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000, // Approximate
        year: 365 * 24 * 60 * 60 * 1000 // Approximate
    };

    const result = {};

    // Iterate over all time frames
    for (const [timeFrame, timeFrameMs] of Object.entries(timeFrames)) {
        const collatedData = {};
        const labels = []; // To store the label (time) values
        const dataPoints = []; // To store the y-axis values (counts)

        // Step 1: Group data into buckets
        data.forEach(item => {
            const time = new Date(item.TimeCreated).getTime();

            // Calculate the start of the bucket this timestamp belongs to
            const bucketStartTime = new Date(Math.floor(time / timeFrameMs) * timeFrameMs);

            // Format the bucket key (e.g., YYYY-MM-DDTHH:mm:ss)
            const bucketKey = bucketStartTime.toISOString().split('.')[0];

            // Initialize count for this bucket if not already set
            if (!collatedData[bucketKey]) {
                collatedData[bucketKey] = { count: 0 };
            }

            // Increment the count for this bucket
            collatedData[bucketKey].count++;
        });

        // Step 2: Sort bucket keys to determine valid range
        const sortedKeys = Object.keys(collatedData).sort((a, b) => new Date(a) - new Date(b));

        // Step 3: Fill only adjacent missing buckets
        sortedKeys.forEach((bucketKey, index) => {
            const currentBucketTime = new Date(bucketKey).getTime();
            const nextBucketTime = currentBucketTime + timeFrameMs;
            const prevBucketTime = currentBucketTime - timeFrameMs;

            if (index === 0 || !collatedData[new Date(prevBucketTime).toISOString().split('.')[0]]) {
                // Fill the bucket immediately before this point
                const prevKey = new Date(prevBucketTime).toISOString().split('.')[0];
                collatedData[prevKey] = collatedData[prevKey] || { count: 0 };
            }

            if (index === sortedKeys.length - 1 || !collatedData[new Date(nextBucketTime).toISOString().split('.')[0]]) {
                // Fill the bucket immediately after this point
                const nextKey = new Date(nextBucketTime).toISOString().split('.')[0];
                collatedData[nextKey] = collatedData[nextKey] || { count: 0 };
            }
        });

        // Convert collatedData to final dataset format
        const filledData = Object.entries(collatedData)
            .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Ensure chronological order
            .map(([key, value]) => ({
                x: key,
                y: value.count
            }));

        // Prepare dataset for this timeframe
        const dataset = {
            label: timeFrame,
            data: filledData, // Assign the actual data points to the dataset
            borderColor: "rgb(111,111,111)", 
            backgroundColor: "rgb(111,111,111)",
            borderWidth: 2,
            pointStyle: (ctx) => {
                const value = ctx.dataset.data[ctx.dataIndex]; // Access the value of the current point
                console.log("CTX", ctx);
                return value === 0 ? false : 'circle'; // Hide points with y=0
            },
            radius: (ctx) => {
                const value = ctx.dataset.data[ctx.dataIndex]; // Access the value of the current point
                console.log("CTX", ctx);
                return value === 0 ? 0 : 5; // Set radius to 0 for points with y=0
            }
        };

        // Store the dataset under the respective time frame
        result[timeFrame] = { labels, datasets: [dataset] };
    }
    
    result["time"] = collatedTime;
    console.log("result of all datasets for lineChart", result);
    return result;
}

function collateDataByTimeFrameNearlyWorking(data) {
    const timeFrames = {
        minute: {
            ms: 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes()
            )),
        },
        hour: {
            ms: 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours()
            )),
        },
        day: {
            ms: 24 * 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            )),
        },
        week: {
            ms: 7 * 24 * 60 * 60 * 1000,
            normalize: (date) => {
                const day = date.getUTCDay(); // 0 = Sunday
                return new Date(Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - day
                ));
            },
        },
        month: {
            ms: 30 * 24 * 60 * 60 * 1000, // Approximate
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth()
            )),
        },
        year: {
            ms: 365 * 24 * 60 * 60 * 1000, // Approximation for simplicity
            normalize: (date) => new Date(Date.UTC(date.getUTCFullYear(), 0)), // Always start of the year
        },
    };

    const result = {};

    let timeFrame = timeFrames[time];
    let timeFrameMs = timeFrame.ms
    let normalize = timeFrame.normalize

    //for (const [timeFrame, { ms: timeFrameMs, normalize }] of Object.entries(timeFrames)) {
    const bucketedData = {};

    // Step 1: Group data by time bucket
    data.forEach((item) => {
        const normalizedTime = normalize(new Date(item.TimeCreated)).toISOString();
        if (!bucketedData[normalizedTime]) {
            bucketedData[normalizedTime] = 0;
        }
        bucketedData[normalizedTime] += item.Count;
    });

    // Step 2: Sort and fill gaps
    const sortedKeys = Object.keys(bucketedData).sort((a, b) => new Date(a) - new Date(b));
    const datasetData = [];

    for (let i = 0; i < sortedKeys.length; i++) {
        const currentKey = sortedKeys[i];
        const currentValue = bucketedData[currentKey];
        const currentTime = new Date(currentKey).getTime();

        // Add current bucket
        datasetData.push({ x: currentKey, y: currentValue });

        // Check for missing intervals
        if (i < sortedKeys.length - 1) {
            const nextKey = sortedKeys[i + 1];
            const nextTime = new Date(nextKey).getTime();

            for (let time = currentTime + timeFrameMs; time < nextTime; time += timeFrameMs) {
                const normalizedTime = normalize(new Date(time)).toISOString();
                datasetData.push({
                    x: normalizedTime,
                    y: 0,
                });
            }
        }
    }

    // Step 3: Ensure pre/post zeros
    const firstTime = new Date(sortedKeys[0]).getTime();
    const preZeroTime = new Date(firstTime - timeFrameMs).toISOString();
    if (!datasetData.find((d) => d.x === preZeroTime)) {
        datasetData.unshift({ x: preZeroTime, y: 0 });
    }

    const lastTime = new Date(sortedKeys[sortedKeys.length - 1]).getTime();
    const postZeroTime = new Date(lastTime + timeFrameMs).toISOString();
    if (!datasetData.find((d) => d.x === postZeroTime)) {
        datasetData.push({ x: postZeroTime, y: 0 });
    }

    // Step 4: Sort and remove unnecessary zeros
    datasetData.sort((a, b) => new Date(a.x) - new Date(b.x));

    const filteredData = datasetData.filter((point, index) => {
        if (index == 0 ) return false;// remove first
        if (index == datasetData.length - 1) return false; // remove last
        //console.log(timeFrame, point.y, index)
        if (point.y !== 0) return true; // Keep non-zero points
        let prev = datasetData[index - 1]?.y;
        let next  = datasetData[index + 1]?.y;
        return prev !== 0 || next !== 0; // Keep zero if neighbors are not both zero
    });

    // Step 5: Store result for the current timeframe
    result[timeFrame] = {
        labels: filteredData.map((point) => point.x),
        datasets: [
            {
                label: timeFrame,
                data: filteredData,
                borderColor: "rgb(111,111,111)",
                backgroundColor: "rgb(111,111,111)",
                borderWidth: 2,
                pointStyle: (ctx) => {
                    const value = ctx.raw.x; // Access the y-value of the current point
                    return value === 0 ? false : 'circle'; // Hide points with y=0
                },
                radius: (ctx) => {
                    const value = ctx.raw; // Access the y-value of the current point
                    return value === 0 ? 0 : 2; // Set radius to 0 for points with y=0
                }
            },
        ]
    };
    //}
    let collatedTime = setDynamicChartControlOption(data);
    //result["time"] = collatedTime;

    return result;
}

function collateDataByTimeFrameNotNearlyWorking(data) {
    let timeFrame = time;
    const timeFrames = {
        minute: {
            ms: 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes()
            )),
        },
        hour: {
            ms: 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours()
            )),
        },
        day: {
            ms: 24 * 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            )),
        },
        week: {
            ms: 7 * 24 * 60 * 60 * 1000,
            normalize: (date) => {
                const day = date.getUTCDay(); // 0 = Sunday
                return new Date(Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - day
                ));
            },
        },
        month: {
            ms: 30 * 24 * 60 * 60 * 1000, // Approximate
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth()
            )),
        },
        year: {
            ms: 365 * 24 * 60 * 60 * 1000, // Approximation for simplicity
            normalize: (date) => new Date(Date.UTC(date.getUTCFullYear(), 0)), // Always start of the year
        },
    };

    if (!timeFrames[timeFrame]) {
        throw new Error(`Invalid timeframe: ${timeFrame}`);
    }

    const { ms: timeFrameMs, normalize } = timeFrames[timeFrame];
    const bucketedData = {};

    // Step 1: Group data by time bucket
    data.forEach((item) => {
        const normalizedTime = normalize(new Date(item.TimeCreated)).toISOString();
        if (!bucketedData[normalizedTime]) {
            bucketedData[normalizedTime] = 0;
        }
        bucketedData[normalizedTime] += item.Count;
    });

    // Step 2: Sort and fill gaps
    const sortedKeys = Object.keys(bucketedData).sort((a, b) => new Date(a) - new Date(b));
    const datasetData = [];

    for (let i = 0; i < sortedKeys.length; i++) {
        const currentKey = sortedKeys[i];
        const currentValue = bucketedData[currentKey];
        const currentTime = new Date(currentKey).getTime();

        // Add current bucket
        datasetData.push({ x: currentKey, y: currentValue });

        // Check for missing intervals
        if (i < sortedKeys.length - 1) {
            const nextKey = sortedKeys[i + 1];
            const nextTime = new Date(nextKey).getTime();

            for (let time = currentTime + timeFrameMs; time < nextTime; time += timeFrameMs) {
                const normalizedTime = normalize(new Date(time)).toISOString();
                datasetData.push({
                    x: normalizedTime,
                    y: 0,
                });
            }
        }
    }

    // Step 3: Ensure pre/post zeros
    const firstTime = new Date(sortedKeys[0]).getTime();
    const preZeroTime = new Date(firstTime - timeFrameMs).toISOString();
    if (!datasetData.find((d) => d.x === preZeroTime)) {
        datasetData.unshift({ x: preZeroTime, y: 0 });
    }

    const lastTime = new Date(sortedKeys[sortedKeys.length - 1]).getTime();
    const postZeroTime = new Date(lastTime + timeFrameMs).toISOString();
    if (!datasetData.find((d) => d.x === postZeroTime)) {
        datasetData.push({ x: postZeroTime, y: 0 });
    }

    // Step 4: Sort and remove unnecessary zeros
    datasetData.sort((a, b) => new Date(a.x) - new Date(b.x));

    const filteredData = datasetData.filter((point, index) => {
        if (index === 0) return false; // Remove first
        if (index === datasetData.length - 1) return false; // Remove last
        if (point.y !== 0) return true; // Keep non-zero points
        let prev = datasetData[index - 1]?.y;
        let next = datasetData[index + 1]?.y;
        return prev !== 0 || next !== 0; // Keep zero if neighbors are not both zero
    });

    // Step 5: Return result for the current timeframe
    return {
        labels: filteredData.map((point) => point.x),
        datasets: [
            {
                label: timeFrame,
                data: filteredData,
                borderColor: "rgb(111,111,111)",
                backgroundColor: "rgb(111,111,111)",
                borderWidth: 2,
                pointStyle: (ctx) => {
                    const value = ctx.raw.x; // Access the y-value of the current point
                    return value === 0 ? false : 'circle'; // Hide points with y=0
                },
                radius: (ctx) => {
                    const value = ctx.raw; // Access the y-value of the current point
                    return value === 0 ? 0 : 2; // Set radius to 0 for points with y=0
                },
            },
        ],
    };
}

function collateDataByTimeFrame(data) {
    let timeFrame = time;
    const timeFrames = {
        minute: {
            ms: 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes()
            )),
        },
        hour: {
            ms: 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours()
            )),
        },
        day: {
            ms: 24 * 60 * 60 * 1000,
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate()
            )),
        },
        week: {
            ms: 7 * 24 * 60 * 60 * 1000,
            normalize: (date) => {
                const day = date.getUTCDay(); // 0 = Sunday
                return new Date(Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() - day
                ));
            },
        },
        month: {
            ms: 30 * 24 * 60 * 60 * 1000, // Approximate
            normalize: (date) => new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth()
            )),
        },
        year: {
            ms: 365 * 24 * 60 * 60 * 1000, // Approximation for simplicity
            normalize: (date) => new Date(Date.UTC(date.getUTCFullYear(), 0)), // Always start of the year
        },
    };

    if (!timeFrames[timeFrame]) {
        throw new Error(`Invalid timeframe: ${timeFrame}`);
    }

    const { ms: timeFrameMs, normalize } = timeFrames[timeFrame];
    const bucketedData = {};

    // Step 1: Group data by time bucket
    data.forEach((item) => {
        const normalizedTime = normalize(new Date(item.TimeCreated)).toISOString();
        if (!bucketedData[normalizedTime]) {
            bucketedData[normalizedTime] = 0;
        }
        bucketedData[normalizedTime] += item.Count;
    });

    // Step 2: Sort and fill gaps
    const sortedKeys = Object.keys(bucketedData).sort((a, b) => new Date(a) - new Date(b));
    const datasetData = [];

    for (let i = 0; i < sortedKeys.length; i++) {
        const currentKey = sortedKeys[i];
        const currentValue = bucketedData[currentKey];
        const currentTime = new Date(currentKey).getTime();

        // Add current bucket
        datasetData.push({ x: currentKey, y: currentValue });

        // Check for missing intervals
        if (i < sortedKeys.length - 1) {
            const nextKey = sortedKeys[i + 1];
            const nextTime = new Date(nextKey).getTime();

            for (let time = currentTime + timeFrameMs; time < nextTime; time += timeFrameMs) {
                const normalizedTime = normalize(new Date(time)).toISOString();
                datasetData.push({
                    x: normalizedTime,
                    y: 0,
                });
            }
        }
    }

    // Step 3: Remove duplicate `x` values
    const uniqueData = [];
    const seenXValues = new Set();

    datasetData.forEach((point) => {
        if (!seenXValues.has(point.x)) {
            seenXValues.add(point.x);
            uniqueData.push(point);
        }
    });

    // Step 4: Return result for the current timeframe
    return {
        labels: uniqueData.map((point) => point.x),
        datasets: [
            {
                label: timeFrame,
                data: uniqueData,
                borderColor: "rgb(111,111,111)",
                backgroundColor: "rgb(111,111,111)",
                borderWidth: 2,
                pointStyle: (ctx) => {
                    const value = ctx.raw.x; // Access the y-value of the current point
                    return value === 0 ? false : 'circle'; // Hide points with y=0
                },
                radius: (ctx) => {
                    const value = ctx.raw; // Access the y-value of the current point
                    return value === 0 ? 0 : 2; // Set radius to 0 for points with y=0
                },
            },
        ],
    };
}


function lineGraphDataPrepWithColumnfilter(data, column) {

    let columnData = getUniqueValues(data, column);
    let dataArray = [];
    let columnNames = [];
    columnData.forEach((item) => {
        const filteredData = data.filter((point, index) => {
            if (point[column] === item) return true; // Keep non-zero points
        });
        columnNames.push(item);
        let collatedData = collateDataByTimeFrame(filteredData);
        console.log("collated filtered data", collatedData);
        dataArray.push(collatedData);
    })
    let mergedResult = mergeCollatedDataAsDatasets(dataArray, columnNames);
    console.log(mergedResult);
    return mergedResult
}

function getUniqueValues(array, key) {
    return [...new Set(array.map(item => item[key]))];
}

function mergeCollatedDataAsDatasetsOG(collatedResults, columnNames) {
    const mergedResult = {};

    collatedResults.forEach((result, index) => {
        const columnName = columnNames[index];
        for (const timeFrame in result) {
            if (!result[timeFrame].labels) return
            if (!mergedResult[timeFrame]) {
                mergedResult[timeFrame] = { labels: [], datasets: [] };
            }

            // Merge labels
            console.log(result[timeFrame]);
            const newLabels = result[timeFrame].labels.filter(label =>
                !mergedResult[timeFrame].labels.includes(label)
            );
            mergedResult[timeFrame].labels.push(...newLabels);

            // Add dataset for this result
            const dataset = {
                label: columnName,
                data: result[timeFrame].datasets[0].data,
                backgroundColor: getColour(columnName),
                borderColor: getColour(columnName),
                pointStyle: (ctx) => {
                    const value = ctx.raw.x; // Access the y-value of the current point
                    return value === 0 ? false : 'circle'; // Hide points with y=0
                },
                radius: (ctx) => {
                    const value = ctx.raw; // Access the y-value of the current point
                    return value === 0 ? 0 : 2; // Set radius to 0 for points with y=0
                }
            };
            mergedResult[timeFrame].datasets.push(dataset);
        }
    });

    // Sort labels and ensure datasets' data matches labels
    for (const timeFrame in mergedResult) {
        mergedResult[timeFrame].labels.sort((a, b) => new Date(a) - new Date(b));

        // Sort each dataset's data by `x` (time) and ensure alignment with labels
        mergedResult[timeFrame].datasets.forEach(dataset => {
            dataset.data.sort((a, b) => new Date(a.x) - new Date(b.x));
        });
    }

    return mergedResult;
}

function mergeCollatedDataAsDatasets(collatedResults, columnNames) {
    const mergedResult = { labels: [], datasets: [] };

    // Collect and merge labels from all results
    const allLabels = new Set();
    collatedResults.forEach(result => {
        result.labels.forEach(label => allLabels.add(label));
    });

    // Sort the collected labels
    mergedResult.labels = Array.from(allLabels).sort((a, b) => new Date(a) - new Date(b));

    // Add datasets from each result
    collatedResults.forEach((result, index) => {
        const columnName = columnNames[index];

        // Create a new dataset for this column
        const dataset = {
            label: columnName,
            data: [],
            backgroundColor: getColour(columnName),
            borderColor: getColour(columnName),
            pointStyle: (ctx) => {
                const value = ctx.raw?.y; // Access the y-value of the current point
                return value === 0 ? false : 'circle'; // Hide points with y=0
            },
            radius: (ctx) => {
                const value = ctx.raw?.y; // Access the y-value of the current point
                return value === 0 ? 0 : 2; // Set radius to 0 for points with y=0
            }
        };

        // Map the result data to align with the merged labels
        mergedResult.labels.forEach(label => {
            const matchingPoint = result.datasets[0].data.find(point => point.x === label);
            dataset.data.push({
                x: label,
                y: matchingPoint ? matchingPoint.y : 0 // Fill missing values with 0
            });
        });

        // Add the dataset to the merged result
        mergedResult.datasets.push(dataset);
    });

    return mergedResult;
}



function showAlertWithOptions(message, callback) {
    // Create the alert container
    const alertBox = document.createElement('div');
    alertBox.style.position = 'fixed';
    alertBox.style.top = '50%';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translate(-50%, -50%)';
    alertBox.style.backgroundColor = 'white';
    alertBox.style.border = '1px solid black';
    alertBox.style.padding = '20px';
    alertBox.style.zIndex = '1000';
    alertBox.style.textAlign = 'center';
    alertBox.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    alertBox.style.borderRadius = '8px';

    // Add message text
    const messageText = document.createElement('p');
    messageText.textContent = message;
    alertBox.appendChild(messageText);

    // Create "Continue" button
    const continueButton = document.createElement('button');
    continueButton.textContent = "Yes, I don't mind if it's slow!";
    continueButton.style.margin = '10px';
    continueButton.style.padding = '10px 20px';
    continueButton.style.backgroundColor = '#4CAF50';
    continueButton.style.color = 'white';
    continueButton.style.border = 'none';
    continueButton.style.borderRadius = '5px';
    continueButton.style.cursor = 'pointer';

    // Create "Skip" button
    const skipButton = document.createElement('button');
    skipButton.textContent = 'No, I value speeeeeed';
    skipButton.style.margin = '10px';
    skipButton.style.padding = '10px 20px';
    skipButton.style.backgroundColor = '#f44336';
    skipButton.style.color = 'white';
    skipButton.style.border = 'none';
    skipButton.style.borderRadius = '5px';
    skipButton.style.cursor = 'pointer';

    // Append buttons to the alert box
    alertBox.appendChild(continueButton);
    alertBox.appendChild(skipButton);

    // Add the alert box to the document body
    document.body.appendChild(alertBox);

    // Event listeners for buttons
    continueButton.addEventListener('click', () => {
        document.body.removeChild(alertBox);
        callback('continue');
    });

    skipButton.addEventListener('click', () => {
        document.body.removeChild(alertBox);
        callback('skip');
    });
}

