function postRequest(data, endpoint) {
  $(".spinner").css({ 'display' : 'block'});
  $.ajax({
    url: endpoint,
    type: "POST",
    data: data,
    contentType: "application/sparql-update; charset=UTF-8",
    error: (request, status, error) => {
      console.error(request.responseText);
      alert(status + ": " + error);
      $(".spinner").css({ 'display' : 'none'});
    },
    complete: () => {
      resetTable();
      $(".spinner").css({ 'display' : 'none'});
    }
  });
}

function patchRequest(data, endpoint) {
  $(".spinner").css({ 'display' : 'block'});
  $.ajax({
    url: endpoint,
    type: "PATCH",
    data: data,
    contentType: "application/sparql-update; charset=UTF-8",
    error: (request, status, error) => {
      console.error(request.responseText);
      alert(status + ": " + error);
      $(".spinner").css({ 'display' : 'none'});
    },
    complete: () => {
      resetTable();
      $(".spinner").css({ 'display' : 'none'});
    }
  });
}

function clearForm () {
  $("#subject").val('');
  $("#predicate").val('');
  $("#object").val('');
}

function updatePermalink() {

}

function resetTable() {
  query("?s", "?p", "?o");
}


async function query(subject, predicate, object) {
  subject = await validateSubject(subject);
  predicate = await validatePredicate(predicate);
  object = await validateObject(predicate, object, false);

  if (!subject || !predicate || !object) {
    console.error("Query Failed");
  }

  var graph = document.getElementById('docName').value;

  if (document.getElementById('dbmsBtn').checked) {
    var query =
    "PREFIX : <" + graph + "#>\n"
    + "SELECT DISTINCT" + " " + subject + " AS ?subject" + " " + predicate + " AS ?predicate" + " " + object + " AS ?object \n"
    + "FROM <" + graph + "> \n"
    + "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
  } else {
    var query =
    "DEFINE get:refresh" + " " + '"clean"' + "\n"
    + "DEFINE get:soft" + " " + '"replace"' + "\n"
    + "PREFIX : <" + graph + "#>\n"
    + "SELECT DISTINCT" + " " + subject + " AS ?subject" + " " + predicate + " AS ?predicate" + " " + object + " AS ?object \n"
    + "FROM <" + graph + "> \n"
    + "WHERE {" + " " + subject + " " + predicate + " " + object + " " + "}"
  }

  if (document.getElementById("sameAs").checked) {
    query = "DEFINE input:same-as" + '"yes" \n' + query ;
  }
  if (document.getElementById("inference").checked) {
    query = "DEFINE input:inference" + ' ' + "'" + document.getElementById("inferenceRule").value + "'" + ' \n' + query ;
  }

  var url = document.getElementById('endpoint').value + "?default-graph-uri=&query=" + encodeURIComponent(query) + "&should-sponge=&format=text%2Fcsv";

  if (document.getElementById("log-cmds").checked) {
    console.log('Query URL: \n' + url);
    console.log('Query body: \n' + query);
  }

  makeTable(url);
}

async function recordGen(subject, predicate, object) {
  var subject = await validateSubject(subject);
  var predicate = await validatePredicate(predicate);
  var object = await validateObject(predicate, object, true);
  var graph = document.getElementById('docName').value;
  var endpoint = document.getElementById('endpoint').value;

  if (!subject || !predicate || !object) {
    console.error("Insert Failed");
  }

  if (document.getElementById('dbmsBtn').checked) {
    var cmd =
    "PREFIX schema: <http://schema.org/>\n"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
    + "PREFIX : <" + graph + "#>\n"
    + "INSERT INTO GRAPH <" +graph+ "> \n{\n"
    + subject + ' ' + predicate + ' ' + object + " . \n"
    + "}";
    try {
      await postRequest(cmd, endpoint);
    } catch (err) {}
  } else {
    var cmd =
    "PREFIX schema: <http://schema.org/>\n"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
    + "INSERT DATA {@prefix : <" + docName + "#> ." + ' ' + subject + ' ' + predicate + ' ' + object + ' ' + ".}";
    try {
      await patchRequest(cmd, endpoint);
    } catch (err) {}
  }

  if (document.getElementById("log-cmds").checked) {
    console.log('Insert body: \n' + cmd);
  }
}

var recordDel = async (subject, predicate, object) => {
  var subject = await validateSubject(subject);
  var predicate = await validatePredicate(predicate);
  var object = await validateObject(predicate, object, false);
  var graph = document.getElementById('docName').value;
  var endpoint = document.getElementById('endpoint').value;

  if (!subject || !predicate || !object) {
    console.error("Delete Failed");
  }

  if (document.getElementById('dbmsBtn').checked) {
    var cmd =
    "PREFIX : <" + graph + "#>\n"
    + "DELETE { GRAPH <" + graph + "> {\n"
    + subject + ' ' + predicate + ' ' + object + "."
    + "\n }"
    + "\n }"
    + "WHERE { GRAPH <" + graph + "> { \n"
    + subject + ' ' + predicate + ' ' + object + "."
    + "} \n };"

    await postRequest(cmd, endpoint);
  } else {
    var cmd =
    "PREFIX schema: <http://schema.org/>\n"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
    + "PREFIX : <" + docName + "#>\n"
    + "DELETE DATA" + ' ' + "{" + subject + ' ' + predicate + ' ' + object + ' ' + ".}";

    await postRequest(cmd, endpoint);
  }

  if (document.getElementById("log-cmds").checked) {
    console.log('Delete body: \n' + cmd);
  }
}
