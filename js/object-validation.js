var predicateRange = async str => {
  var graph = document.getElementById("docName").value;

  var query =
  "PREFIX : <" + graph + "#>\n"
  + "ASK \n"
  + "WHERE \n"
  + "{ \n"
  + str + ' ' + "rdfs:range ?range .\n"
  + "filter (?range in (rdfs:Literal, xsd:string, xsd:decimal, xsd:integer, xsd:boolean, xsd:date, xsd:time))\n"
  +"}"

  var url = document.getElementById('endpoint').value + "?default-graph-uri=&query=" + encodeURIComponent(query) + "&should-sponge=&format=application%2Fsparql-results%2Bjson";

  if (document.getElementById("log-cmds").checked == true) {
    console.log("Query URL: " + url);
    console.log("Query Body" + query);
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

  try {
    const resp = await fetch(url,options); // resp awaits completion of fetch
    if (resp.status >= 200 && resp.status <= 300) {
      console.log(resp.status + " - " + resp.statusText);
    } else {
      throw new Error("Error " + resp.status +" - " + resp.statusText) ;
    }
    const json = await resp.json(); // constant awaits resp before being assigned (so it isn't assigned as a promise)
    return (json.boolean) ; // returns true or false returned by query after awaiting results
  } catch(e) {
    console.error('Predicate Range Lookup Failed', e) ;
    alert('Predicate Range Lookup Failed ' + e)
  }
}

var validateObject = async (str, validate) => {
  var object = await formatObject(str, validate);
  if (object.includes("Error")) {
    alert(object);
    return null;
  }
  return object;
}

var formatObject = async (str, validate) => {
  const urlexp = /(https|http|mailto|tel|dav|ftp|ftps|urn)[:^/s]/i;
  str = str.trim();

  // If object is the ? variable
  if (str.charAt(0) == "?") {
    return str ;
  }

  // If object should be validated
  if (validate) {
    var range = await predicateRange(await validatePredicate(str));
    if (str.includes('"') || str.includes("'")) {
      range = true ;
    }

    // If the range of the predicate is not a literal
    if (!range) {
      // Case: Correctly quoted URI
      if (str.charAt(0) == '<' && str.charAt(str.length-1) == '>') {
        return str ;
      }
      // Case: input is already a relative uri. Solution: return it as is
      if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length-1) == '>') {
        return str ;
      }
      // Case: Unquoted URI
      if (urlexp.test(str)) {
        return '<' + str + '>' ;
      }
      // Case: Unquoted relative URI
      if (str.charAt(0) == "#") {
        return '<' + str + '>' ; // Case: input is an unquoted relative uri. Solution: quote it
      }
      if (str.includes(":")) {
        return str ;
      }
      return ':' + str ;
    }

    if (isBlankNode(str)) {
      return formatBlankNode(str);
    }

    return formatLiteral(str);
  }

  // if object should not be validated
  // Case: Correctly quoted URI
  if (str.charAt(0) == '<' && str.charAt(str.length-1) == '>') {
    return str ;
  }
  // Case: input is already a relative uri. Solution: return it as is
  if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length-1) == '>') {
    return str ;
  }
  // Case: input is blank node
  if (isBlankNode(str)) {
    return formatBlankNode(str);
  }
  // Case: input is a literal with language tag
  if (isLangTag(str)) {
    return formatLangTag(str);
  }
  // Case: Unquoted URI
  if (urlexp.test(str)) {
    return '<' + str + '>' ;
  }
  // Case: literal value
  if (str.includes('\"') || str.includes('\'') || str.indexOf(' ') >= 0) {
    return formatLiteral(str);
  }
  // Case: Unquoted relative URI
  if (str.charAt(0) == "#") {
    return '<' + str + '>' ; // Case: input is an unquoted relative uri. Solution: quote it
  }
  // Case: input is a curie
  if (str.includes(":")) {
    return str ;
  }
  // Case: if no other case is hit make a relative URR
  return ':' + str ;
}
