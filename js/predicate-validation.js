var validatePredicate = async str => {
  var predicate = await formatPredicate(str);
  if (predicate.includes("Error")) {
    alert(predicate);
    return null;
  }
  return predicate;
}

var formatPredicate = str => {
  const urlexp = /(https|http|mailto|tel|dav|ftp|ftps|urn)[:^/s]/i;
  str = str.trim();
  // Case: string is ? variable
  if (str.charAt(0) == "?") {
    return str ;
  }
  // Case: Correctly quoted URI
  if (str.charAt(0) == '<' && str.charAt(str.length-1) == '>') {
    return str ;
  }
  // Case: Input is already a relative uri.
  if (str.charAt(0) == '<' && str.charAt(1) == '#' && str.charAt(str.length-1) == '>') {
    return str ;
  }
  // Case: input is blank node
  if (isBlankNode(str)) {
    return "Predicate Error: Predicate cannot be a blank node"
  }
  // Case: Unquoted URI
  if (urlexp.test(str)) {
    return '<' + str + '>' ;
  }
  // Case: literal value
  if (str.includes('\"') || str.includes('\'') || str.indexOf(' ') >= 0) {
    return "Predicate Error: Predicate cannot be a literal value";
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
