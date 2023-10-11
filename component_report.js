/// Report Page Content Script
console.log("Report Page Content Script");

let instanceDomain = currentUrl.split("/")[0] + "/ProductionConfig.zen"
let instances
let iframesSearched = 0
let finder = document.getElementById("finder");
let instanceNumber
let businessComponents = []
let poorlyBusinessComponents = []

let ndTitle = document.getElementsByClassName("ndTitle");
let reportTitle
let reportDiv = document.createElement("div");
statusDiv = document.createElement("div");
let completeDiv = document.createElement("div");
let namespaces = []
let namespaceTotal = 0
let namespaceSearchResponse
let namespaceCount = 0

let ndTitleLength1 = ndTitle.length;
for (let i = 0; i < ndTitleLength1; i++) {
	if (ndTitle[i].innerText == "Did you know?") {
		reportTitle = ndTitle[i];
		reportTitle.innerText = "Erroring Components:";
		reportTitle.setAttribute("colspan", "2");
		break
	}
}

window.addEventListener("load", function() { 
	console.log("LOAD", document.getElementsByClassName("login").length);
	if (document.getElementsByClassName("login").length < 1) {
		let ndDidYou = document.getElementsByClassName("ndDidYou");
		console.log("ndDidYou: ", ndDidYou);
		if (ndDidYou.length != 0) {
			ensemble(ndDidYou);
		} else {	
			// Iris
			iris();
		}
		
	}

});


function extractProductionStatuses(iframe) {
	/// Extract and show the production's component statuses from the given iframe
	let iframeComponents = []
	iframe.iframeComponents = []
	let innerIframe = iframe.contentDocument.getElementById("frame_55");
	let iframeEmbed = innerIframe.getSVGDocument()
	let ellipses = iframeEmbed.getElementsByTagName("ellipse");
	

	let namespaceSection = document.getElementById(iframe.namespace);
	
	if (namespaceSection == undefined) {
		
		let namespaceSectionHeader = document.createElement("div");
		
		namespaceSectionHeader.addEventListener("click", function() {
			iframe.style.display = "";
			let length = iframe.iframeComponents.length;
			for (let x = 0; x < length; x ++) {
				iframe.iframeComponents[x].div.remove();
				poorlyBusinessComponents = poorlyBusinessComponents.filter(function(item) {
					return item !== iframe.iframeComponents[x]
				})
			}
			iframe.iframeComponents = []
			statusDiv.innerHTML = "Refreshing " + iframe.namespace + " namespace..."
			iframe.contentWindow.location.reload();
		});
		
		namespaceSectionHeader.style.margin = "5px";
		namespaceSectionHeader.style.width = "100%";
		namespaceSectionHeader.style.borderBottom = "1px solid grey";
		namespaceSectionHeader.id = (iframe.namespace);
		namespaceSectionHeader.innerHTML = "<a>" + iframe.namespace + "</a>";
		
		reportDiv.appendChild(namespaceSectionHeader);
	}
	let ellipsesLength = ellipses.length;
	for (let x = 0; x < ellipsesLength; x ++) {
		
		ellipses[x].componentName = ellipses[x].previousSibling.innerHTML
		let statusObject = getStatus(ellipses[x])
		let component = {
			id: iframe.namespace + "_" + ellipses[x].previousSibling.innerHTML,
			name: ellipses[x].previousSibling.innerHTML,
			namespace: iframe.namespace,
			status: statusObject.status,
			div: Object,
			parentIframe: iframe,
		}
		iframe.iframeComponents.push(component);
		
		component.div = document.createElement("div");
		component.div.style.width = "100%"
		component.div.style.height = "30px"
		component.div.style.margin = "0px"
		
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute("height", "30");
		svg.setAttribute("width", "50");
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.style.float = "left";
		svg.style.display = "inline";
		svg.style.width = "30px";
		
		var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttributeNS(null, "cx", "14");
		circle.setAttributeNS(null, "cy", "15");
		circle.setAttributeNS(null, "r", "10");
		circle.setAttributeNS(null, "stroke", "black");
		circle.setAttributeNS(null, "stroke-width", "1");
		circle.setAttributeNS(null, "fill", statusObject.fill);

		let divContent = document.createElement("p");
		divContent.innerHTML = component.div.innerHTML + component.name
		divContent.style.float = "left";
		divContent.style.display = "inline";
		divContent.style.width = "auto";
		divContent.style.margin = "5px";
		
		svg.appendChild(circle);
		component.div.insertBefore(svg, component.div.firstChild);
		component.div.appendChild(divContent);
		
		businessComponents.push(component);
		if ((statusObject.status == "Running") || (statusObject.status == "Disabled")) {
			//
		} else {
			attachComponent(component);
		}
		
	}
	iframesSearched ++
	completeDiv.innerHTML = "Namespaces responded " + String(iframesSearched) + "/" + String(namespaceTotal)
	if (iframesSearched > namespaceTotal) {
		completeDiv.innerHTML = namespaceSearchResponse
		completeDiv.innerHTML = ""
	}
	iframe.style.display = "none"
}


function attachComponent(component) {
	let namespaceSection = document.getElementById(component.namespace);
	//console.log(namespaceSection);
	if (namespaceSection == undefined) {

		console.log("\n\n\n\n\n THIS SHOULD NOt APPEAR");
		let namespaceSectionHeader = document.createElement("div");
		
		namespaceSectionHeader.addEventListener("click", function() {
			component.parentIframe.contentWindow.location.reload();
		});
		
		namespaceSectionHeader.style.margin = "5px";
		namespaceSectionHeader.style.width = "100%";
		namespaceSectionHeader.setAttribute("colspan", "1");		
		namespaceSectionHeader.innerHTML = "<a>" + component.namespace + "</a>";

		reportDiv.appendChild(namespaceSectionHeader);
		reportDiv.appendChild(component.div);


	} else 	{
		reportDiv.insertBefore(component.div, namespaceSection.nextSibling);
	}
	
	component.div.addEventListener("click", function() {
		//console.log("FOCUS");
		//component.parentIframe.scrollIntoView();
		window.location.href = component.parentIframe.src
		
	})
	
	poorlyBusinessComponents.push(component);

	statusDiv.innerHTML = "Found " + poorlyBusinessComponents.length + " poorly business components."
}



function getInstanceNumber(instanceDomain) {
	/// Get instance number so you don't have to iterate through every time
	let instancesLength = instances.length;
	for (var i = 0; i < instancesLength; i ++ ){
		if (instanceDomain.includes(instances[i].url)) {
			return i;
		}
	}
}

function getStatus(ellipse) {
	/// Returns the status of the provided ellipse element.
	let statusObject = {status: "", fill: ""}
	let green = "rgb(32, 192, 32)"
	let grey = "rgb(208, 208, 208)"
	let purple = "rgb(153, 0, 204)"
	let red = "rgb(255, 0, 0)"
	let lightGreen = "rgb(222, 255, 188)"
	let yellow = "rgb(255, 255, 0)"
	let other = "rgb(0, 0, 0)"
	
	if ((ellipse.style.fill == "#20C020") || (ellipse.style.fill == green)) {
		// Green - Status OK
		statusObject.status = "Running";
		statusObject.fill = green
	} else if ((ellipse.style.fill == "#D0D0D0") || (ellipse.style.fill == grey)) {
		// Grey - Status inactive
		statusObject.status = "Disabled";
		statusObject.fill = grey
	} else if ((ellipse.style.fill == "#9900CC") || (ellipse.style.fill == purple)) {
		// Purple - Status Retry
		statusObject.status = "Retry";
		statusObject.fill = purple
	} else if ((ellipse.style.fill == "red") || (ellipse.style.fill == red)) {
		// Red - Status Retry
		statusObject.status = "Error";
		statusObject.fill = red
	} else if ((ellipse.style.fill == "#DEFFBC") || (ellipse.style.fill == lightGreen)) {
		// Light Green - Status Running, not enabled
		statusObject.status = "Running, not enabled";
		statusObject.fill = lightGreen
	} else if ((ellipse.style.fill == "yellow") || (ellipse.style.fill == yellow)) {
		// Yellow - Status Running, not enabled
		statusObject.status = "Inactive";
		statusObject.fill = yellow
	} else {
		statusObject.status = "Other";
		statusObject.fill = other
	}
	
	return statusObject
}


function ensemble(ndDidYou) {
	
	if (ndDidYou.length > 1) {
		ndDidYou = ndDidYou[1]
	} else {
		ndDidYou = ndDidYou[0]
	}

	ndDidYou.innerHTML = "";
	ndDidYou.append(statusDiv);
	ndDidYou.append(completeDiv);
	ndDidYou.style.height = "100%";
	ndDidYou.style.overflowY = "auto";
	ndDidYou.style.overflowX = "hidden";
	ndDidYou.appendChild(reportDiv);

	links = document.getElementsByClassName("ndLink");
	let linksLength = links.length;
	for (let x = 0; x < linksLength; x ++) { 
		if (links[x].href.includes("EnsPortal.ProductionConfig.zen") && (links[x].parentNode.previousSibling.previousSibling.innerText.includes("Running"))) {
			namespaceTotal ++
			namespaces.push({
								href: String(links[x].href),
								hostname: links[x].parentNode.previousSibling.previousSibling.previousElementSibling.outerText.split(" in ")[1],
								status: links[x].parentNode.previousSibling.previousSibling.innerText.includes("Running")}
							);
		}
	}

	let namespacesLength = namespaces.length;
	for (let i = 0; i < namespacesLength; i ++) {
		namespaceCount ++
		let iframe = document.createElement("iframe");	
		iframe.iframeComponents = []

		iframe.src = String(namespaces[i].href)
		iframe.namespace = String(namespaces[i].hostname)
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		console.log("currentUrl", currentUrl);
		if ((currentUrl.includes("$NAMESPACE=%SYS")) || (currentUrl.split("/csp/sys/")[1] == "%25CSP.Portal.Home.zen") || (currentUrl.split("/csp/sys/")[1] == "UtilHome.csp")) {
			console.log("GENERAL NAMESPACE", i);
			document.body.appendChild(iframe);
			statusDiv.innerHTML = "Namespaces Requested " + String(namespaceCount) + "/" + String(namespaceTotal)
			namespaceSearchResponse = "Namespaces responded."

		} else {
			// Current Namespace only. 
			if (currentUrl.includes(namespaces[i].href.split("/EnsPortal.ProductionConfig.zen")[0].split("/").slice(-1)[0].toUpperCase())) {
				document.body.appendChild(iframe);
				statusDiv.innerHTML = "Namespaces Requested 1/1"
				namespaceSearchResponse = "Namespace responded."
				namespaceTotal = 1
			}
		}
		iframe.addEventListener("load", function() {
			extractProductionStatuses(iframe);

		});

	}
	
}


function iris() {
	// Iris
	ndTitle = document.getElementsByClassName("titleRow");
	let ndTitleLength = ndTitle.length;
	for (let i = 0; i < ndTitleLength; i++) {
		if (ndTitle[i].innerText == "Did you know?") {
			reportTitle = ndTitle[i];
			reportTitle.innerText = "Erroring Components:";
			reportTitle.setAttribute("colspan", "2");
			break
		}
	}
	
	ndDidYou = document.getElementsByClassName("welcomeTable");
	if (ndDidYou.length > 1) {
		ndDidYou = ndDidYou[1].childNodes[1].childNodes[1].childNodes[2]
	} else {
		ndDidYou = ndDidYou[0].childNodes[1].childNodes[1].childNodes[2]
	}
	
	console.log("ndDidYou: ", ndDidYou);

	
	ndDidYou.innerHTML = "";
	ndDidYou.append(statusDiv);
	ndDidYou.append(completeDiv);
	ndDidYou.style.height = "100%";
	ndDidYou.style.overflowY = "auto";
	ndDidYou.style.overflowX = "hidden";
	ndDidYou.appendChild(reportDiv);

	linksContainer = document.getElementById("messagePanel");
	links = linksContainer.getElementsByClassName("ndLink");
	console.log("LINKS:", links);
	let linksLength = links.length;
	for (let x = 0; x < linksLength; x ++) { 
		if (links[x].href.includes("EnsPortal.ProductionConfig.zen") && (links[x].parentNode.previousElementSibling.innerText.includes("Running"))) {
			namespaceTotal ++
			namespaces.push({
								href: String(links[x].href),
								hostname: links[x].parentNode.previousSibling.previousSibling.previousElementSibling.outerText.split(" in ")[1],
								status: links[x].parentNode.previousSibling.previousSibling.innerText.includes("Running")}
							);
		}
	}

	let namespacesLength = namespaces.length; 
	for (let i = 0; i < namespacesLength; i ++) {
		namespaceCount ++
		let iframe = document.createElement("iframe");	
		iframe.iframeComponents = []

		iframe.src = String(namespaces[i].href)
		iframe.namespace = String(namespaces[i].hostname)
		iframe.style.width = "100%";
		iframe.style.height = "100%";
		console.log("currentUrl", currentUrl);
		if ((currentUrl.includes("$NAMESPACE=%SYS")) || (currentUrl.split("/csp/sys/")[1] == "%25CSP.Portal.Home.zen") || (currentUrl.split("/csp/sys/")[1] == "UtilHome.csp")) {
			console.log("GENERAL NAMESPACE", i);
			document.body.appendChild(iframe);
			statusDiv.innerHTML = "Namespaces Requested " + String(namespaceCount) + "/" + String(namespaceTotal)
			namespaceSearchResponse = "Namespaces responded."

		} else {
			// Current Namespace only. 
			if (currentUrl.includes(namespaces[i].href.split("/EnsPortal.ProductionConfig.zen")[0].split("/").slice(-1)[0].toUpperCase())) {
				document.body.appendChild(iframe);
				statusDiv.innerHTML = "Namespaces Requested 1/1"
				namespaceSearchResponse = "Namespace responded."
				namespaceTotal = 1
			}
		}
		iframe.addEventListener("load", function() {
			irisExtractProductionStatuses(iframe);

		});

	}	
	
	
}


function irisExtractProductionStatuses(iframe) {
	/// Extract and show the production's component statuses from the given iframe
	let iframeComponents = []
	iframe.iframeComponents = []
	let innerIframe = iframe.contentDocument.getElementById("frame_58");
	console.log("innerIframe", innerIframe);
	let iframeEmbed = innerIframe.getSVGDocument()
	let ellipses = iframeEmbed.getElementsByTagName("ellipse");
	

	let namespaceSection = document.getElementById(iframe.namespace);
	
	if (namespaceSection == undefined) {
		
		let namespaceSectionHeader = document.createElement("div");
		
		namespaceSectionHeader.addEventListener("click", function() {
			iframe.style.display = ""
			let iframeComponentsLength = iframe.iframeComponents.length;
			for (let x = 0; x < iframeComponentsLength; x ++) {
				iframe.iframeComponents[x].div.remove();
				poorlyBusinessComponents = poorlyBusinessComponents.filter(function(item) {
					return item !== iframe.iframeComponents[x]
				})
			}
			iframe.iframeComponents = []
			statusDiv.innerHTML = "Refreshing " + iframe.namespace + " namespace..."
			iframe.contentWindow.location.reload();
		});
		
		namespaceSectionHeader.style.margin = "5px";
		namespaceSectionHeader.style.width = "100%";
		namespaceSectionHeader.style.borderBottom = "1px solid grey";
		namespaceSectionHeader.id = (iframe.namespace);
		namespaceSectionHeader.innerHTML = "<a>" + iframe.namespace + "</a>";
		
		reportDiv.appendChild(namespaceSectionHeader);
	}
	let ellipsesLength = ellipses.length;
	for (let x = 0; x < ellipsesLength; x ++) {
		
		ellipses[x].componentName = ellipses[x].previousSibling.innerHTML
		let statusObject = getStatus(ellipses[x])
		let component = {
			id: iframe.namespace + "_" + ellipses[x].previousSibling.innerHTML,
			name: ellipses[x].previousSibling.innerHTML,
			namespace: iframe.namespace,
			status: statusObject.status,
			div: Object,
			parentIframe: iframe,
		}
		iframe.iframeComponents.push(component);
		
		component.div = document.createElement("div");
		component.div.style.width = "100%"
		component.div.style.height = "30px"
		component.div.style.margin = "0px"
		
		let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute("height", "30");
		svg.setAttribute("width", "50");
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.style.float = "left";
		svg.style.display = "inline";
		svg.style.width = "30px";
		
		var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttributeNS(null, "cx", "14");
		circle.setAttributeNS(null, "cy", "15");
		circle.setAttributeNS(null, "r", "10");
		circle.setAttributeNS(null, "stroke", "black");
		circle.setAttributeNS(null, "stroke-width", "1");
		circle.setAttributeNS(null, "fill", statusObject.fill);

		let divContent = document.createElement("p");
		divContent.innerHTML = component.div.innerHTML + component.name
		divContent.style.float = "left";
		divContent.style.display = "inline";
		divContent.style.width = "auto";
		divContent.style.margin = "5px";
		
		svg.appendChild(circle);
		component.div.insertBefore(svg, component.div.firstChild);
		component.div.appendChild(divContent);
		
		businessComponents.push(component);
		if ((statusObject.status == "Running") || (statusObject.status == "Disabled")) {
			//
		} else {
			attachComponent(component);
		}
		
	}
	iframesSearched ++
	completeDiv.innerHTML = "Namespaces responded " + String(iframesSearched) + "/" + String(namespaceTotal)
	if (iframesSearched > namespaceTotal) {
		completeDiv.innerHTML = namespaceSearchResponse
		completeDiv.innerHTML = ""
	}
	iframe.style.display = "none"
}