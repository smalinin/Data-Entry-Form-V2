var state;
const { OIDCWebClient } = OIDC;
const authClient = new OIDCWebClient({ solid: true });

var limit = Number("0");
var offset = Number("0");
var tableSize = 1;
var resultMode = null;

var dataTable;


//// <!-- Spinner Javascript -->
function showSpinner() {
	DOC.iSel("spinner").className = "show";
}

function hideSpinner() {
	DOC.iSel("spinner").className = DOC.iSel("spinner").className.replace("show", "");
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function showSnackbar(text1, text2) {
        const tm = 5000;
	var x = DOC.iSel("snackbar");
	DOC.qSel("#snackbar #msg1").innerText = text1;
	DOC.qSel("#snackbar #msg2").innerText = text2 ? text2 : '';
	//x.innerText = text;
	x.className = "show";
	setTimeout(function(){ x.className = x.className.replace("show", ""); }, tm);
	await delay(tm);
}



class State {
  constructor() {
    this.solid_storage = null;
    this.is_solid_id = false;
    this.webid = null;
	this.initialTab = "";
    this.initialSubject = "";
    this.initialPredicate = "";
    this.initialObject = "";
    this.initialDocumentName = "";
    this.initialEndpoint = "";
    this.lastState = {tab:"dbms", documentName:""};
  }
  
  loadPermalink() {
	this.resetPermalink();

	try {
	  var lastState = JSON.parse(sessionStorage.getItem('lastState'))
	  if (lastState) 
	    this.lastState = lastState;

	  if (!this.lastState.tab && (this.lastState.tab !== "dbms"  || this.lastState.tab !== "fs"))
	  	this.lastState.tab = "dbms";

	  if (this.lastState.endpoint)
	     DOC.iSel("sparql_endpoint").value = this.lastState.endpoint;

	} catch(e) {}

	var queryString = window.location.search;
	var params = new URLSearchParams(queryString);
	var setInputs = params.get("setInputs");

	if (setInputs == "true") {
		this.initialTab = decodeURIComponent(params.get("tab"));
		this.initialSubject = decodeURIComponent(params.get("subject"));
		this.initialPredicate = decodeURIComponent(params.get("predicate"));
		this.initialObject = decodeURIComponent(params.get("object"));
		this.initialDocumentName = decodeURIComponent(params.get("documentName"));
		this.initialEndpoint = decodeURIComponent(params.get("endpoint"));
		this.handlePermalink();

		if (this.initialTab === "dbms")
			$('a[href="#dbmsID"]').tab('show');
		else if (this.initialTab === "fs")
			$('a[href="#fsID"]').tab('show');
	}
	else {
	    var documentName;
	    if (this.getCurTab() === "fs") {
			$('a[href="#fsID"]').tab('show');
			if (this.lastState.documentName)
				DOC.qSel('#dbmsID #docNameID').value = this.lastState.documentName;
		} else {
			$('a[href="#dbmsID"]').tab('show');
			if (this.lastState.documentName)
				DOC.qSel('#fsID #docNameID').value = this.lastState.documentName;
		}
	}

	this.updateLoginState();
  }


  resetPermalink() {
    var permalink = DOC.iSel("permalinkID");
    permalink.href = window.location.href;
  }

  
  updatePermalink() {
	if (DOC.iSel('dbmsTabID').getAttribute('class') === "active") {
		this.lastState.tab = tab = "dbms";
	} else if (DOC.iSel('fsTabID').getAttribute('class') === "active") {
		this.lastState.tab = tab = "fs";
	}

	var permalink = DOC.iSel("permalinkID");
	var subject = this.checkId("subjectID");
	var predicate = this.checkId("predicateID");
	var object = this.checkId("objectID");
	var documentName = this.checkId("docNameID");
	var endpoint = DOC.iSel('sparql_endpoint');
	var tab = "";

	if (endpoint.value)
	  this.lastState.endpoint = endpoint.value;

	this.lastState.documentName = documentName.value;
	sessionStorage.setItem('lastState', JSON.stringify(this.lastState));

	var href = window.location.origin + window.location.pathname;
	href += "?setInputs=true&";
	href += "tab=" + encodeURIComponent(tab) + "&";
	href += "subject=" + encodeURIComponent(subject.value) + "&";
	href += "predicate=" + encodeURIComponent(predicate.value) + "&";
	href += "object=" + encodeURIComponent(object.value) + "&";
	href += "documentName=" + encodeURIComponent(documentName.value) + "&";
	href += "endpoint=" + encodeURIComponent(endpoint.value);
	permalink.href = href;
  }


  // Handle the permalink parameters
  handlePermalink() {
	var subject = this.checkPermalinkTab("subjectID");
	var predicate = this.checkPermalinkTab("predicateID");
	var object = this.checkPermalinkTab("objectID");
	var documentName = this.checkPermalinkTab("docNameID");
	var endpoint = DOC.iSel("sparql_endpoint");

	if (this.initialSubject) {
		subject.value = this.initialSubject;
		this.initialSubject = "";
	}
	if (this.initialPredicate) {
		predicate.value = this.initialPredicate;
		this.initialPredicate = "";
	}
	if (this.initialObject) {
		object.value = this.initialObject;
		this.initialObject = "";
	}
	if (this.initialDocumentName) {
		documentName.value = this.initialDocumentName;
		//this.initialDocumentName = "";
	}
	if (this.initialEndpoint) {
		endpoint.value = this.initialEndpoint;
		this.initialEndpoint = "";
	}
  }

  checkPermalinkTab(id) {
	if (this.initialTab === 'dbms')
		return DOC.qSel('#dbmsID #'+id);
	else
		return DOC.qSel('#fsID #'+id);
  }


  /* Gets the solid storage from window > application > session storage
  so it can be used as the document name for functions
  function is called when page is loaded/reloaded */
  docNameValue() {
	this.solid_storage = sessionStorage.getItem("solid_storage")
	var solid_storage_value = this.solid_storage;

	if (DOC.iSel("cmdID").checked == true) {
		console.log('solid storage: ' + this.solid_storage);
	}

	if (this.solid_storage && this.solid_storage !== "null") {
		DOC.qSel("#dbmsID #docNameID").value = solid_storage_value;
		DOC.qSel("#fsID #docNameID").value = solid_storage_value;
	} else {
		DOC.iSel("#dbmsID #docNameID").value = "urn:records:test";
	}

	// value from permalink
	if (this.initialDocumentName !== "" && this.initialTab !== "") {
		var documentName = this.checkPermalinkTab("docNameID");
		documentName.value = initialDocumentName;
	}
  }


  // This function checks which tab the user is in to determine focus of functions
  checkValue(id) {
	if (this.getCurTab() === 'dbms')
		return DOC.qSel('#dbmsFormID #'+id).value;
	else
		return DOC.qSel('#fsFormID #'+id).value;
  }


  // This function checks which tab the user is in to determine table to display data (different because of .value)
  checkId(id) {
	if (this.getCurTab() === "dbms")
		return DOC.qSel('#dbmsID #'+id);
	else
		return DOC.qSel('#fsID #'+id);
  }


  // Clears subject, predicate, object input fields
  clearInput() {
	var curDOC = this.checkId("docNameID");
	var curDocName = curDOC.value; // Stores current value of docName

	if (this.getCurTab() === "dbms") {
		DOC.iSel("dbmsFormID").reset(); // Resets entire form
	} else if (this.getCurTab() === "fs") {
		DOC.iSel("fsFormID").reset();
	}

	curDOC.value = curDocName; // Added so docname is not reset
  }

  getCurTab() {
    return this.lastState.tab;
  }

  
  async updateLoginState() {
	const loginButton = DOC.iSel('loginID');
	const logoutButton = DOC.iSel('logoutID');

	const session = await authClient.currentSession()
	const loggedHref = DOC.iSel('logged-href')
	const loggedIn = (session && session.hasCredentials());
	loginButton.classList.toggle('hidden', loggedIn)
	logoutButton.classList.toggle('hidden', !loggedIn)
	if (loggedIn) {
		var webid = session.idClaims.sub;
		if (webid) {
		    this.webid = webid;
			loggedHref.classList.remove('hidden')
			loggedHref.href = webid
			loggedHref.title = webid

			var rc = await loadProfile(webid);
			if (rc) {
			  this.solid_storage = rc.store;
			  this.is_solid_id = rc.is_solid_id;
			} else {
			  this.solid_storage = null;
			  this.is_solid_id = false;
			}
			sessionStorage.setItem('solid_storage', this.solid_storage);
			this.docNameValue()
		}

	} else {
		loggedHref.classList.add('hidden')
		loggedHref.href = ''
		loggedHref.title = ''
		this.solid_storage = null;
		this.is_solid_id = false;
		this.webid = null;
		sessionStorage.removeItem('solid_storage');
	}
	click_updateTable();
  }

}

			

class DOC {
  static qSel(sel) { return document.querySelector(sel) }
  static qSelAll(sel) { return document.querySelectorAll(sel) }
  static iSel(id) { return document.getElementById(id) }
  static qShow(sel) { DOM.qSel(sel).classList.remove('hidden') }
  static qHide(sel) { DOM.qSel(sel).classList.add('hidden') }
  static elShow(sel) { el.classList.remove('hidden') }
  static elHide(sel) { el.classList.add('hidden') }

  static qGetValue(sel) { return DOM.qSel(sel).value }
  static qSetValue(sel, val) { DOM.qSel(sel).value = val }

  static iGetValue(sel) { return DOM.iSel(sel).value }
  static iSetValue(sel, val) { DOM.iSel(sel).value = val }
}



///// <!-- These Functions are Used to Display Validation Errors -->
// Function is used to remove input field border color
function setInputColor(id) {
	DOC.qSel(id).className = DOC.qSel(id).className + " error";  // this adds the error class
}

// Function is used to remove input field border color
function removeInputColor(id) {
	DOC.qSel(id).className = "form-control"; // removes error class
}

// Function is used to display error message
function errorMessage(id, error) {
	DOC.qSel(id).innerHTML = error;
}



///// <!-- These Functions Handle the Form Validation -->

// Regular Expression for URIs
const regexp = /(https|http|mailto|tel|dav|ftp|ftps|urn)[:^/s]/i;

// This function validates the uri used for PATCH
function docNameValidation() {
	var str = DOC.qSel("#fsID #docNameID").value;

	try {
		if (regexp.test(str)) { //removes error for valid uri
			errorMessage("#fsID #docNameErrorID", "");
			removeInputColor('#fsID #docNameID');
		} else {
			setInputColor("#fsID #docNameID");
			errorMessage("#fsID #docNameErrorID", "Document name must be a full uri for patch method");
			throw new Error("Document Name must be a full uri for patch method"); // Throws error because input is not a valid uri
		}
	} catch (e) {
		console.error('Invalid uri', e);
	}
}

// Function checks if input is a blank node
function isBlankNode(str) {
	str = str.trim();
	if (str.charAt(0) == "_" && str.charAt(1) == ":") {
		return str;
	} else if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
		return str;
	} else {
		return false;
	}
}

// Function checks if input contains a language tag
function langTag(str) {
	const langexp = /@[a-zA-Z][a-zA-Z]/; // regexp for languge tag ex. @en
	if (langexp.test(str)) {
		return true;
	} else {
		return false;
	}
}

// Function formats literal inputs
function formatLiteral(str) {
	if (langTag(str)) { // str has lang tag
		strArray = str.split('@'); // split string at @ so the langtag is removed from string
		str = strArray[0].trim();
		langtag = '@' + strArray[1].trim(); // need to add @ because it is removed by split
		if (str.charAt(0) != '"' && str.charAt(0) != "'") {
			return '"' + str + '"' + langtag
		} else {
			return str + langtag
		}
	} else { // str does not have lang tag
		if (isBlankNode(str)) {
			return str;
		} else if (str.charAt(0) == "'" && str.charAt(str.length - 1) == "'") {
			return str // If string begins and ends with single quote return it as is
		} else if (str.charAt(0) == '"' && str.charAt(str.length - 1) == '"') {
			return str;
		} else if (str.indexOf(' ') >= 0) {
			if (str.charAt(0) != '"' && str.charAt(0) != "'") {
				return '"' + str + '"';
			} else {
				return str;
			}
		} else {
			return '"' + str + '"';
		}
	}
}

// This function formats the Subject input. Comments are inline
function formatSubject() {
	if (state.getCurTab() === "dbms") {
		var str = DOC.qSel("#dbmsID #subjectID").value;
	} else if (state.getCurTab() === "fs") {
		var str = DOC.qSel("#fsID #subjectID").value;
	}

	if (str.charAt(0) == '<' && str.charAt(str.length - 1) == '>') {
		return str;
	} else if (regexp.test(str) && !isBlankNode(str)) {
		return '<' + str + '>'; // Case: input is a uri. Solution: quote it
	} else if (str.charAt(0) == "#") {
		return '<' + str + '>'; // Case: input is an unquoted relative uri. Solution: quote it
	} else if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length - 1) == '>') {
		return str; // Case: input is already a relative uri. Solution: return it as is
	} else if (str.includes(":") || str.includes("<#")) {
		return str; // Case: input is a curie. Solution: return it as is
	} else if (str.charAt(0) == "?") {
		return str; // checks if input is a variable for deletion
	}
	else {
		if (isBlankNode(str)) {
			return isBlankNode(str); // Case: input is a blank node. Solution: return it as is
		} else {
			return ':' + str; // Case: input is not a uri or a blank node. Solution: make it a relative uri
		}
	}
}

// If the subject is quoted or contains a space this function throws and error
function validateSubject() {
	var str = state.checkValue("subjectID");

	try {
		if (state.getCurTab() === "dbms") {
			if (isBlankNode(str)) { // removes error message for complete blank node
				errorMessage("#dbmsID #subjectErrorID", "");
				removeInputColor('#dbmsID #subjectID');
				return formatSubject();
			} else if (str.includes('"') || str.includes("'")) {
				setInputColor("#dbmsID #subjectID");
				errorMessage("#dbmsID #subjectErrorID", "Subject cannot contain a literal value unless it is a blank node");
				throw new Error("Subject cannot be a literal value"); // Throws error because input is a literal value
			} else if (str.indexOf(' ') >= 0) {
				setInputColor('#dbmsID #subjectID');
				errorMessage("#dbmsID #subjectErrorID", "Subject cannot contain spaces unless it is a blank node");
				throw new Error("Subject cannot contain spaces");
			}
			else {
				errorMessage("#dbmsID #subjectErrorID", "");
				removeInputColor("#dbmsID #subjectID");
				return formatSubject(); // Returns formatted subject because it is valid
			}
		} else if (state.getCurTab() === "fs") {
			if (isBlankNode(str)) { // removes error message for complete blank node
				errorMessage("#fsID #subjectErrorID", "");
				removeInputColor('#fsID #subjectID');
				return formatSubject();
			} else if (str.includes('"') || str.includes("'")) {
				setInputColor("#fsID #subjectID");
				errorMessage("#fsID #subjectErrorID", "Subject cannot contain a literal value unless it is a blank node");
				throw new Error("Subject cannot be a literal value"); // Throws error because input is a literal value
			} else if (str.indexOf(' ') >= 0) {
				setInputColor('#fsID #subjectID');
				errorMessage("#fsID #subjectErrorID", "Subject cannot contain spaces unless it is a blank node");
				throw new Error("Subject cannot contain spaces");
			}
			else {
				errorMessage("#fsID #subjectErrorID", "");
				removeInputColor("#fsID #subjectID");
				return formatSubject(); // Returns formatted subject because it is valid
			}
		}
	} catch (e) {
		console.error('Invalid Subject', e);
	}

}

// This function formats the Predicate input. Comments are inline
function formatPredicate() {
	var str = state.checkValue("predicateID");
	if (regexp.test(str) && !isBlankNode(str)) {
		return '<' + str + '>'; // Case: input is a uri. Solution: quote it
	} else if (str.charAt(0) == "#") {
		return '<' + str + '>'; // Case: input is an unquoted relative uri. Solution: quote it
	} else if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length - 1) == '>') {
		return str; // Case: input is already a relative uri. Solution: return it as is
	} else if (str.includes(":") || str.includes("<#")) {
		return str; // Case: input is a curie. Solution: return it as is
	} else if (str.charAt(0) == "?") {
		return str; // checks if input is a variable for deletion
	}
	else {
		if (str.charAt(0) == '<' && str.charAt(str.length - 1) == '>') {
			var newStr = str.slice(1, -1); // Case: input is quoted uri. Solution: must be unquotted to be recognize as a uri by regexp
			return formatPredicate(newStr);
		} else {
			return ':' + str; // Case: input is not a uri or a blank node. Solution: make it a relative uri
		}
	}
}

// If the predicate is quoted, contains, or is a blank node a space this function throws and error
function validatePredicate() {
	var str = state.checkValue("predicateID");

	try {
		if (state.getCurTab() === "dbms") {
			if (str.includes('"') || str.includes("'")) {
				setInputColor('#dbmsID #predicateID');
				errorMessage("#dbmsID #predicateErrorID", "Predicate cannot be a literal value");
				throw new Error("Predicate cannot be a literal value"); // Throws error because input is a literal value
			} else if (str.indexOf(' ') >= 0) {
				setInputColor('#dbmsID #predicateID');
				errorMessage("#dbmsID #predicateErrorID", "Predicate cannot contain spaces");
				throw new Error("Predicate cannot contain spaces"); // Throws error because input subject can't contain spaces
			} else {
				removeInputColor('#dbmsID #predicateID');
				errorMessage("#dbmsID #predicateErrorID", "");
				return formatPredicate(); // Returns formatted subject because it is valid
			}
		} else if (state.getCurTab() === "fs") {
			if (str.includes('"') || str.includes("'")) {
				setInputColor('#fsID #predicateID');
				errorMessage("#fsID #predicateErrorID", "Predicate cannot be a literal value");
				throw new Error("Predicate cannot be a literal value"); // Throws error because input is a literal value
			} else if (str.indexOf(' ') >= 0) {
				setInputColor('#fsID #predicateID');
				errorMessage("#fsID #predicateErrorID", "Predicate cannot contain spaces");
				throw new Error("Predicate cannot contain spaces"); // Throws error because input subject can't contain spaces
			} else {
				removeInputColor('#fsID #predicateID');
				errorMessage("#fsID #predicateErrorID", "");
				return formatPredicate(); // Returns formatted subject because it is valid
			}
		}
	} catch (e) {
		console.error('Invalid Predicate', e);
	}
}

// This function formats the Object input. Comments are inline
async function validateObject(str) {
	var range = await predicateRange(); // function waits until range is a value rather than a promise
	var str = state.checkValue("objectID");

	if (str.includes('"') || str.includes("'")) {
		range = true;
	}

	if (!range) {
		if (str.charAt(0) == '<' && str.charAt(str.length - 1) == '>') { //Case: input is already qutoed uri. Return as is
			return str
		} else if (regexp.test(str) && !isBlankNode(str)) {
			return '<' + str + '>'; // Case: input is a uri. Solution: quote it
		} else if (str.charAt(0) == "#") {
			return '<' + str + '>'; // Case: input is an unquoted relative uri. Solution: quote it
		} else if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length - 1) == '>') {
			return str; // Case: input is already a relative uri. Solution: return it as is
		} else if (str.includes(":") || str.includes("<#")) {
			return str; // Case: input is a curie. Solution: return it as is
		}
		else {
			return ':' + str; // Case: input is not a uri or a blank node. Solution: make it a relative uri
		}
	}
	if (isBlankNode(str)) {
		return str; // Case : blank node
	} else {
		return formatLiteral(str);
	}
}

// This function formats the Object input. Comments are inline
function nonvalidatedObject() {
	var str = state.checkValue("objectID");

	if (regexp.test(str) && !isBlankNode(str)) {
		return '<' + str + '>'; // Case: input is a uri. Solution: quote it
	} else if (str.charAt(0) == "#") {
		return '<' + str + '>'; // Case: input is an unquoted relative uri. Solution: quote it
	} else if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length - 1) == '>') {
		return str; // Case: input is already a relative uri. Solution: return it as is
	} else if (str.includes(":") || str.includes("<#")) {
		return str; // Case: input is a curie. Solution: return it as is
	} else if (str.charAt(0) == "?") {
		return str; // checks if input is a variable for deletion
	} else if (str.charAt(0) == '<' && str.charAt(str.length - 1) == '>') {
		var newStr = str.slice(1, -1); // Case: input is quoted uri. Solution: must be unquotted to be recognize as a uri by regexp
		return nonvalidatedObject(newStr);
	} else if (str.includes('"') || str.includes("'") || str.indexOf(' ') >= 0) {
		return formatLiteral(str); // Case: input is a quoted literal value
	} else if (isBlankNode(str)) {
		return str; // Case : blank node
	}
	else {
		return ':' + str; // Case: input is not a uri or a blank node. Solution: make it a relative uri
	}
}




/////////  <!-- These functions handle the data table -->

// This function allows hyperlinks to be used in the table
function tableFormat(str) {
	// Regular Expression for URIs in table specifically
	const tableexp = /(https|http|mailto|tel|dav|ftp|ftps)[:^/s]/i;
	var graph = state.checkValue("docNameID");
	var strLabel = str; // variable for what is show on screen in the href

	if (DOC.iSel("uriID").checked == true) { //if user wants short URIs
		if (str.includes(graph)) { //if str is in fct format it still includes the docname
			strLabel = strLabel.replace(graph, ""); //remove the docName from string
		}
		if (str.includes("https://linkeddata.uriburner.com/describe/?url=")) {// of str is in fct format
			strLabel = strLabel.replace("https://linkeddata.uriburner.com/describe/?url=", "");
			strLabel = strLabel.replace("%23", "#");
		} else if (str.includes("nodeID://")) {
			strLabel = strLabel.replace("nodeID://", "_:");
		} else if (str.includes("#")) {
			strLabel = str.split('#')[1];
		} else if (str.includes("/")) {
			var strList = str.split("/");
			strLabel = strList.pop();
		}
	}

	if (tableexp.test(str)) { // if str is an absolute or relative uri
		str = '<a href="' + str + '">' + strLabel + '</a>'
		return str
	}
	else {
		return strLabel
	}
}


// This function sets the limit based on input and adjusts offset accordingly
function setLimit() { // reset offset when limit is changed
	if (limit != DOC.iSel("resultsID").value) {
		offset = Number("0");
	}
	limit = Number(DOC.iSel("resultsID").value);
}

// This sets the size of the current table
async function setTableSize() {
	var graph = state.checkValue("docNameID");

	if (state.getCurTab() === "dbms") {
		var query =
			"SELECT DISTINCT COUNT(*) AS ?count FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	} else if (state.getCurTab() === "fs") {
		// Use of Sponger Pragma to force document reload during query evaluation
		var query =
			"DEFINE get:refresh" + " " + '"clean"' + "\n"
			+ "DEFINE get:soft" + " " + '"replace"' + "\n"
			+ "SELECT DISTINCT COUNT(*) AS ?count FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	}

	if (DOC.iSel("riID").checked == true) {// if reasoning and inference is on
		query = "DEFINE input:same-as" + '"yes" \n' + query;
	} else if (DOC.iSel("ruleNameID").checked == true) {
		query = "DEFINE input:inference" + ' ' + "'" + DOC.iSel("infRuleNameID").value + "'" + ' \n' + query;
	}

	var endpoint = DOC.iSel("sparql_endpoint").value + "?default-graph-uri=&query=";
	let url = endpoint + encodeURIComponent(query) + "&should-sponge=&format=application%2Fsparql-results%2Bjson";

	if (DOC.iSel("cmdID").checked == true) {
		console.log("Retrieving Table Length From: " + url);
		console.log("Query: " + query);
	}

	const options = {
		method: 'GET',
		headers: {
			'Content-type': 'application/sparql-results+json; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options)
		
		if (resp.ok && resp.status == 200) {
			var data = await resp.json();

			if (data.results.bindings.length > 0) {
				tableSize = Number(data.results.bindings[0].count.value);
			} else {
				console.log("Table size is 0");
			}

		} else {
			var msg = await resp.text();
			hideSpinner();
			console.error("Error: " + msg)
			await showSnackbar('Table Size Failed', `SPARQL endpoint Error: ${resp.status} ${resp.statusText}`);
		}

	} catch (e) {
		hideSpinner();
		console.error('Table Size Failed', e);
		await showSnackbar('Table Size Failed', `SPARQL endpoint Error: ${resp.status} ${resp.statusText}`);
	}
}




///////////  <!-- These Functions Handle the Functionality of the Page -->


//SPARQL INSERT SCRIPT
async function recordGen() {
	setLimit();
	showSpinner();
	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = await validateObject(); // insert function awaits object value before proceeding
	var graph = DOC.qSel("#dbmsID #docNameID").value;

	//SPARQL INSERT Query Generator
	var insert_cmd =
		"PREFIX schema: <http://schema.org/>\n"
		+ "PREFIX : <" + graph + "#>\n"
		+ "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
		+ "INSERT INTO GRAPH <" + graph + "> \n{\n"
		+ subject + ' ' + predicate + ' ' + object + " . \n"
		+ "}";

	var endpoint = DOC.iSel("sparql_endpoint").value;
	let url = endpoint;

	if (DOC.iSel("cmdID").checked == true) {
		console.log("endpoint for Target SPARUL Service: " + endpoint);
		console.log(insert_cmd);
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-type': 'application/sparql-update; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
		body: insert_cmd,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options);
		if (resp.status >= 200 && resp.status <= 300) {
			console.log(resp.status + " - " + resp.statusText);
			updateTable();
			hideSpinner();
		} else {
			throw new Error(`Error ${resp.status} - ${resp.statusText}`);
			hideSpinner();
		}
	} catch (e) {
		hideSpinner();
		console.error('Insert Failed', e);
		showSnackbar('Insert Failed', ''+e);
	}
//??--	await setTableSize();
}

//SPARQL DELETE SCRIPT
async function recordDel() {
	setLimit();
	showSpinner();
	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = nonvalidatedObject();
	var graph = DOC.qSel("#dbmsID #docNameID").value;

	//SPARQL DELETE Query Generator
	var delete_cmd =
		"PREFIX : <" + graph + "#>\n"
		+ "DELETE { GRAPH <" + graph + "> {\n"
		+ subject + ' ' + predicate + ' ' + object + "."
		+ "\n }"
		+ "\n }"
		+ "WHERE { GRAPH <" + graph + "> { \n"
		+ subject + ' ' + predicate + ' ' + object + "."
		+ "} \n };"

	var endpoint = DOC.iSel("sparql_endpoint").value;
	let url = endpoint;

	if (DOC.iSel("cmdID").checked == true) {
		console.log("endpoint for Target SPARUL Service: " + endpoint);
		console.log(delete_cmd);
	}

	const options = {
		method: 'POST',
		headers: {
			'Content-type': 'application/sparql-update; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
		body: delete_cmd,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options);
		if (resp.status >= 200 && resp.status <= 300) {
			console.log(resp.status + " - " + resp.statusText);
			updateTable();
			hideSpinner();
		}
		else {
			throw new Error(`Error ${resp.status} - ${resp.statusText}`);
			hideSpinner();
		}
	} catch (e) {
		hideSpinner();
		console.error('Delete Failed', e);
		showSnackbar('Delete Failed', ''+e);
	}
//??--	await setTableSize();
}

// function used to return data as CSV or XML
function downloadResults() {
	resultMode = "csv";
	var graph = state.checkValue("docNameID");

	if (state.getCurTab() === "dbms") {
		var data_query =
			"SELECT DISTINCT * FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	} else if (state.getCurTab() === "fs") {
		// Use of Sponger Pragma to force document reload during query evaluation
		var data_query =
			"DEFINE get:soft" + " " + '"soft"' + "\n" + "SELECT DISTINCT * FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	}

	if (limit >= 1) { // if results per page is active
		data_query = data_query + "\n" + "OFFSET " + offset + "\n" + "LIMIT " + limit;
	}

	if (DOC.iSel("riID").checked == true) {// if reasoning and inference is on
		data_query = "DEFINE input:same-as" + '"yes" \n' + data_query;
	} else if (DOC.iSel("ruleNameID").checked == true) {
		data_query = "DEFINE input:inference" + ' ' + "'" + DOC.iSel("infRuleNameID").value + "'" + ' \n' + data_query;
	}

	var endpoint = DOC.iSel("sparql_endpoint").value + "?default-graph-uri=&query=";
	if (DOC.iSel("csvID").checked == true) {
		var downloadURL = endpoint + encodeURIComponent(data_query) + "&should-sponge=&format=text%2Fcsv";
	} else if (DOC.iSel("xmlID").checked == true) {
		var downloadURL = endpoint + encodeURIComponent(data_query) + "&should-sponge=&format=application%2Fsparql-results%2Bxml";
	}


	if (DOC.iSel("cmdID").checked == true) {
		console.log("Retrieving CSV From: " + downloadURL);
		console.log("Query: " + data_query);
	}

	window.open(downloadURL);
}

/* Generates blank node queries and displays table reflecting them.
This function is required because blank node queries can
require n number of columns. */
async function bnQueryGen() {
	resultMode = "bn";
	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = nonvalidatedObject();
	var graph = state.checkValue("docNameID");


	if (state.getCurTab() === "dbms") {
		var query =
			"PREFIX : <" + graph + "#>\n"
			+ "SELECT DISTINCT * \n"
			+ "FROM <" + graph + "> \n"
			+ "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
	} else if (state.getCurTab() === "fs") {
		var query =
			"DEFINE get:soft" + " " + '"soft"' + "\n"
			+ "PREFIX : <" + graph + "#>\n"
			+ "SELECT DISTINCT * \n"
			+ "FROM <" + graph + "> \n"
			+ "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
	}

	await executeQuery(query, true);
}


// This function updates table to show results of a query
function click_queryGen() {
	offset = Number("0");
	queryGen();
}

async function queryGen() {
	resultMode = "query";

	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = nonvalidatedObject();
	var graph = state.checkValue("docNameID");

	if (isBlankNode(subject) || isBlankNode(object)) {
		bnQueryGen(); // if query includes blank node call bnQueryGen function
		return false; // returns false so the queryGen function stops executing
	}

	if (state.getCurTab() === "dbms") {
		var query =
			"PREFIX : <" + graph + "#>\n"
			+ "SELECT DISTINCT" + " " + subject + " AS ?subject" + " " + predicate + " AS ?predicate" + " " + object + " AS ?object \n"
			+ "FROM <" + graph + "> \n"
			+ "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
	} else if (state.getCurTab() === "fs") {
		var query =
			"DEFINE get:refresh" + " " + '"clean"' + "\n"
			+ "DEFINE get:soft" + " " + '"replace"' + "\n"
			+ "PREFIX : <" + graph + "#>\n"
			+ "SELECT DISTINCT" + " " + subject + " AS ?subject" + " " + predicate + " AS ?predicate" + " " + object + " AS ?object \n"
			+ "FROM <" + graph + "> \n"
			+ "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
	}

	await executeQuery(query, true);
}


// This function fetches the query results and returns them in json
function click_updateTable() {
	offset = Number("0");
	updateTable();
}

async function updateTable() {
	resultMode = "all";
	var graph = state.checkValue("docNameID");
	if (!graph) {
	  console.log("DocumentName is Empty");
	  return;
	}

	if (state.getCurTab() === "dbms") {
		var data_query =
			"SELECT DISTINCT * FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	} else if (state.getCurTab() === "fs") {
		// Use of Sponger Pragma to force document reload during query evaluation
		var data_query =
			"DEFINE get:refresh" + " " + '"clean"' + "\n"
			+ "DEFINE get:soft" + " " + '"replace"' + "\n"
			+ "SELECT DISTINCT * FROM <" + graph + "> WHERE {?subject ?predicate ?object}"
	}

	await executeQuery(data_query);
}


async function executeQuery(data_query, is_query) {

	setLimit();
	dataTable.clear().draw();
	showSpinner();

/***
	if (limit >= 1) { // if results per page is active
		data_query = data_query + "\n" + "OFFSET " + offset + "\n" + "LIMIT " + limit;
	}
***/
	data_query = data_query + "\n" + " LIMIT " + limit;

	if (DOC.iSel("riID").checked == true) {// if reasoning and inference is on
		data_query = "DEFINE input:same-as" + '"yes" \n' + data_query;
	} else if (DOC.iSel("ruleNameID").checked == true) {
		data_query = "DEFINE input:inference" + ' ' + "'" + DOC.iSel("infRuleNameID").value + "'" + ' \n' + data_query;
	}

	// CSV download
	if (DOC.iSel("csvID").checked == true || DOC.iSel("xmlID").checked == true) {
		await downloadResults();
	}

	var endpoint = DOC.iSel("sparql_endpoint").value + "?default-graph-uri=&query=";
	let url = endpoint + encodeURIComponent(data_query) + "&should-sponge=&format=application%2Fsparql-results%2Bjson";

	if (DOC.iSel("cmdID").checked == true) {
		console.log("Retrieving Table Data From: " + url);
		console.log("Query: " + data_query);
	}

	const options = {
		method: 'GET',
		headers: {
			'Content-type': 'application/sparql-results+json; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options)

		if (resp.ok && resp.status == 200) {
			var data = await resp.json();

			if (data.results.bindings.length > 0) {

			        var columns = [];
			        for(var i=0; i < data.head.vars.length; i++) {
			          columns.push({title: data.head.vars[i]});
			        }

				dataTable.destroy();
				$('#formTable').empty();
	
				dataTable = $('#formTable').DataTable({
					columns: columns, responsive: true
				});

				for (var i = 0; i < data.results.bindings.length; i++) {
					var subject = data.results.bindings[i].subject.value;
					var predicate = data.results.bindings[i].predicate.value;
					var object = data.results.bindings[i].object.value;
					if (DOC.iSel("fctID").checked == true) { //if fct checkbox is checked
						if (subject.includes(graph) || regexp.test(subject)) { //if subject is not a literal value
							subject = "https://linkeddata.uriburner.com/describe/?url=" + data.results.bindings[i].subject.value;
							subject = subject.replace("#", "%23"); // replaces # with %23 for fct results
						}

						if (predicate.includes(graph) || regexp.test(predicate)) { //if subject is not a literal value
							predicate = "https://linkeddata.uriburner.com/describe/?url=" + data.results.bindings[i].predicate.value;
							predicate = predicate.replace("#", "%23");
						}

						if (object.includes(graph) || regexp.test(object)) {
							object = "https://linkeddata.uriburner.com/describe/?url=" + data.results.bindings[i].object.value;
							object = object.replace("#", "%23");
						} else { //if object is literal value
							object = data.results.bindings[i].object.value;
						}

					} else {
						subject = data.results.bindings[i].subject.value;
						predicate = data.results.bindings[i].predicate.value;
						object = data.results.bindings[i].object.value;
					}

					var table_row = [tableFormat(subject), tableFormat(predicate), tableFormat(object)];
					dataTable.row.add(table_row);
				}
				dataTable.draw();
				hideSpinner();
			} else {
				hideSpinner();
				console.log("No data returned by query");
			}

		} 
		else {
			var msg = await resp.text();
			hideSpinner();
			if (is_query) {
				console.error('Query Failed', msg);
				alert('Query Failed ' + msg)
			} else {
				console.error('Table Refresh Failed', msg);
		        	await showSnackbar('Table Refresh Failed', `SPARQL endpoint Error: ${resp.status} ${resp.statusText}`);
		        }
		}

	} catch (e) {
		hideSpinner();
		if (is_query) {
			console.error('Query Failed', e);
			alert('Query Failed ' + e)
		} else {
			console.error('Table Refresh Failed', e);
			await showSnackbar('Table Refresh Failed', `SPARQL endpoint Error: ${resp.status} ${resp.statusText}`);
		}
	}
//??--	await setTableSize();
}


// This function gets the range of the predicate to determine if object is a literal or a reference
async function predicateRange() {
	var predicate = validatePredicate();
	var graph = state.checkValue("docNameID");

	var range_query =
		"PREFIX : <" + graph + "#>\n"
		+ "ASK \n"
		+ "WHERE \n"
		+ "{ \n"
		+ predicate + ' ' + "rdfs:range ?range .\n"
		+ "filter (?range in (rdfs:Literal, xsd:string, xsd:decimal, xsd:integer, xsd:boolean, xsd:date, xsd:time))\n"
		+ "}"

	var endpoint = DOC.iSel("sparql_endpoint").value + "?default-graph-uri=&query=";
	// This sets the url for retrieving the json
	let url = endpoint + encodeURIComponent(range_query) + "&should-sponge=&format=application%2Fsparql-results%2Bjson";

	if (DOC.iSel("cmdID").checked == true) {
		console.log("Recieving Predicate Range From: " + url);
		console.log("Query" + range_query);
	}


	const options = {
		method: 'GET',
		headers: {
			'Content-type': 'application/sparql-results+json; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options); // resp awaits completion of fetch

		if (resp.status >= 200 && resp.status <= 300) {
			console.log(resp.status + " - " + resp.statusText);
		} else {
			throw new Error(`Error ${resp.status} - ${resp.statusText}`);
		}
		const json = await resp.json(); // constant awaits resp before being assigned (so it isn't assigned as a promise)
		return (json.boolean); // returns true or false returned by query after awaiting results
	} catch (e) {
		console.error('Predicate Range Lookup Failed', e);
		showSnackbar('Predicate Range Lookup Failed', ''+e);
	}
}

async function turtleGen() {
	setLimit();
	showSpinner();

	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = await validateObject(); // insert function awaits object value before proceeding
	var docName = DOC.qSel("#fsID #docNameID").value;
	console.log("subject: " + subject)

	var turtle_cmd =
		`INSERT DATA {@prefix : <${docName}#> . ${subject}  ${predicate}  ${object} . } `

	let url = docName;

	if (DOC.iSel("fctID").checked == true) {
		console.log("Insert Command:" + turtle_cmd);
	}


	const options = {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/sparql-update; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
		body: turtle_cmd,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options);
		if (resp.status >= 200 && resp.status <= 300) {
			hideSpinner();
			console.log(resp.status + " - " + resp.statusText);
			updateTable();
		}
		else {
			hideSpinner();
			throw new Error(`Error ${resp.status} - ${resp.statusText}`);
		}
	} catch (e) {
		hideSpinner();
		showSnackbar('Insert Failed', ''+e);
		console.error('Insert Failed ' + e);
	}
//??--	await setTableSize();
}

async function turtleDel() {
	setLimit();
	showSpinner();

	var subject = validateSubject();
	var predicate = validatePredicate();
	var object = nonvalidatedObject(); // insert function awaits object value before proceeding
	var docName = DOC.qSel("#fsID #docNameID").value;
	var del_cmd;
	var is_solid_server = false;

	try {
		if (state.is_solid_id && (new URL(state.webid)).origin === (new URL(docName)).origin) {
	  		is_solid_server = true;
		}
	} catch (e) { }

	if (is_solid_server)
		del_cmd =
			`DELETE DATA {@prefix : <${docName}#> . ${subject}  ${predicate}  ${object} . } `
	else
		del_cmd =
			`PREFIX : <${docName}#> DELETE DATA { GRAPH <${docName}> { ${subject} ${predicate} ${object} . } }`;

	let url = docName;
	if (DOC.iSel("fctID").checked == true) {
		console.log("Delete Command:" + del_cmd);
	}


	const options = {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/sparql-update; charset=UTF-8',
		},
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
		body: del_cmd,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options);
		if (resp.status >= 200 && resp.status <= 300) {
			hideSpinner();
			console.log(resp.status + " - " + resp.statusText);
			updateTable();
		}
		else {
			throw new Error(`Error ${resp.status} - ${resp.statusText}`);
		}
	} catch (e) {
		hideSpinner();
		console.error('Delete Failed ' + e);
		showSnackbar('Delete Failed', ''+e);
	}
//??--	await setTableSize();
}




/////////  <!-- These functions are used for Authentication -->

async function loadProfile(webId) {
	try {
		var rc = await fetchProfile(webId);
		if (!rc)
		  return null;

		var uriObj = new URL(webId)
		uriObj.hash = uriObj.search = uriObj.query = '';

		var base = uriObj.toString()
		const kb = $rdf.graph()

		$rdf.parse(rc.profile, kb, base, rc.content_type);

		const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
		const PIM = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
		const SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/terms#");

		const s_webId = $rdf.sym(webId)

		uriObj.pathname = '/';
		var ret = uriObj.toString();

		var store = kb.any(s_webId, PIM('storage'));
		var inbox = kb.any(s_webId, LDP('inbox'));

		var s_issuer = kb.any(s_webId, SOLID('oidcIssuer'));
		var s_account = kb.any(s_webId, SOLID('account'));
		var s_pubIndex = kb.any(s_webId, SOLID('publicTypeIndex'));

		var is_solid_id = (s_issuer || s_account || s_pubIndex) ? true : false;

		if (inbox)
			return {store: inbox.value, is_solid_id};
		else if (store)
			return {store: store.value, is_solid_id};

	} catch (e) {
		console.error('Error', e)
		alert('Error ', e)
		return null;
	}
}

async function fetchProfile(url) {
    if (!url.startsWith('https://'))
      return null;

	const options = {
		method: 'GET',
		headers: { 'Accept': 'text/turtle, application/ld+json' },
		credentials: 'include',
		mode: 'cors',
		crossDomain: true,
	};

	var resp;
	try {
		resp = await authClient.authFetch(url, options);
		if (resp.ok) {
			var body = await resp.text();
			var contentType = resp.headers.get('content-type');
			return { profile: body, contentType };
		}
		else {
			console.log("Error " + resp.status + " - " + resp.statusText)
		}
	}
	catch (e) {
		console.error('Request failed', e)
		await showSnackbar('Request failed.', 'Could not fetch profile: '+url);
		return null;
	}
}

async function authLogin() {
	const url = "./oidc_web/login.html#relogin";
	const width = 650;
	const height = 400;
	const left = window.screenX + (window.innerWidth - width) / 2;
	const top = window.screenY + (window.innerHeight - height) / 2;
	const settings = `width=${width},height=${height},left=${left},top=${top}`;
	var win = window.open(url, 'Login', settings);
}

async function authLogout() {
	await authClient.logout()
	location.reload()
}

function showAbout()  {
    var dlg = $('#about-dlg .modal-content');
    $('#about-dlg').modal('show');
}


$(document).ready(async function () {

        state = new State();

	$('[data-toggle="tooltip"]').tooltip({
		placement: 'right'
	});

	DOC.iSel('loginID').onclick = () => { authLogin() }
	DOC.iSel('logoutID').onclick = () => { authLogout() }

	DOC.iSel('aboutID').onclick = () => { showAbout() }

	DOC.qSel('#dbmsID #subjectID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#dbmsID #predicateID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#dbmsID #objectID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#dbmsID #docNameID').onchange = () => { state.updatePermalink() }

	DOC.qSel('#dbmsID #clearBtnID').onclick = () => { state.clearInput() }
	DOC.qSel('#dbmsID #insertBtnID').onclick = () => { recordGen() }
	DOC.qSel('#dbmsID #deleteBtnID').onclick = () => { recordDel() }
	DOC.qSel('#dbmsID #queryBtnID').onclick = () => { click_queryGen() }
	DOC.qSel('#dbmsID #dataBtnID').onclick = () => { click_updateTable() }

	DOC.qSel('#fsID #subjectID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#fsID #predicateID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#fsID #objectID').onchange = () => { state.updatePermalink() }
	DOC.qSel('#fsID #docNameID').onchange = () => { state.updatePermalink() }

	DOC.qSel('#fsID #clearBtnID').onclick = () => { state.clearInput() }
	DOC.qSel('#fsID #insertBtnID').onclick = () => { turtleGen() }
	DOC.qSel('#fsID #deleteBtnID').onclick = () => { turtleDel() }
	DOC.qSel('#fsID #queryBtnID').onclick = () => { click_queryGen() }
	DOC.qSel('#fsID #dataBtnID').onclick = () => { click_updateTable() }

	DOC.qSel("#fsID #docNameID").addEventListener("input", docNameValidation);
	DOC.qSel("#dbmsID #subjectID").addEventListener("input", validateSubject);
	DOC.qSel("#fsID #subjectID").addEventListener("input", validateSubject);

	DOC.qSel("#dbmsID #predicateID").addEventListener("input", validatePredicate);
	DOC.qSel("#fsID #predicateID").addEventListener("input", validatePredicate);

	
	
	DOC.iSel('sparql_endpoint').onchange = () => { state.updatePermalink() }

	// update table and permalink on tab switch
	$('.nav-tabs a').on('shown.bs.tab', function (event) {
		var currTab = $(event.target).text();
		var prevTab = $(event.relatedTarget).text();
		if (currTab != "About" && prevTab != "About") {
			state.updatePermalink();
			click_updateTable();
		}
	});

	var columns = [{title:"subject"},{title:"predicate"},{title:"object"}];
	try {
		dataTable = $('#formTable').DataTable({
			columns: columns,
			responsive: true,
			columnDefs: [{
				targets: "_all",
				render: function (data, type, full, meta) {
//					return formatDisplay(data);
					return data;
				}
			}]
		})

  	} catch (err) {
    		console.error(err);
  	}

//??--        tableSize = Number(setTableSize());

	// check for permalink
	state.loadPermalink();
});




