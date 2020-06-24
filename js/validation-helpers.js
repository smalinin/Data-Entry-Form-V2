function formatLiteral(str) {
  str = str.trim();
  if (str.charAt(0) === '\"' && str.charAt(str.length - 1) === '\"') {
    return str;
  }
  if (str.charAt(0) === '\'' && str.charAt(str.length - 1) === '\'') {
    return str;
  }
  if (str.indexOf(' ') >= 0) {
    if (str.charAt(0) != '\"' && str.charAt(str.length - 1) != '\"') {
      if (str.charAt(0) === '\'' && str.charAt(str.length - 1) === '\'') {
        return '\"' + str + '\"';
      }
    }
  }
  return '\"' + str + '\"';
}

function isBlankNode(str) {
  str = str.trim();
  if (str.charAt(0) == "_" && str.charAt(1) == ":") {
    return true ;
  } else if (str.charAt(0) == "[" || str.charAt(str.length-1) == "]") {
    return true ;
  }
  return false;
}

function formatBlankNode(str) {
  str = str.trim();
  if (str.charAt(0) == "_" && str.charAt(1) == ":") {
    return str ;
  }
  if (str.charAt(0) == "[" && str.charAt(str.length-1) == "]") {
    return str ;
  }
  return "Error: Blank Node is incorrectly quotted" ;
}

function isLangTag(str) {
  const langexp = /@[a-zA-Z][a-zA-Z]/ ;
  str = str.trim();
  if (langexp.test(str)) {
    return true ;
  }
  return false ;
}

function isTyped(str) {
  str = str.trim();
  if (str.includes("^^")) {
    return true ;
  }
  return false ;
}

function formatLangTag(str) {
  str = str.trim();
  if (str.charAt(str.length - 3) === "@") {
    if (str.charAt(0) == '\"' && str.charAt(str.length - 4) == '\"') {// String is double quoted
      return str;
    }
    if (str.charAt(0) == '\'' && str.charAt(str.length - 4) == '\'') {// String is single quoted
      return str;
    }
  }
  return "Error: Language Tag is incorrectly formatted";
}
