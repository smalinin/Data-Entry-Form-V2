var validateSubject = async str => {
  var subject = await formatSubject(str);
  if (subject.includes("Error")) {
    alert(subject);
    return null;
  }
  return subject;
}

var formatSubject = str => {
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
