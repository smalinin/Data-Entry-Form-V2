var formatLiteral = str => {
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
  return "Subject Error: Literal value is incorrectly quoted"
}

var isBlankNode = str => {
  str = str.trim();
  if (str.charAt(0) == "_" && str.charAt(1) == ":") {
    return true ;
  } else if (str.charAt(0) == "[" || str.charAt(str.length-1) == "]") {
    return true ;
  }
  return false;
}

var formatBlankNode = str => {
  str = str.trim();
  if (str.charAt(0) == "_" && str.charAt(1) == ":") {
    return str ;
  }
  if (str.charAt(0) == "[" && str.charAt(str.length-1) == "]") {
    return str ;
  }
  return "Subject Error: Blank Node is incorrectly quotted" ;
}

var isLangTag = str => {
  const langexp = /@[a-zA-Z][a-zA-Z]/ ;
  str = str.trim();
  if (langexp.test(str)) {
    return true ;
  }
  return false ;
}

var formatLangTag = str => {
  str = str.trim();
  if (str.charAt(str.length - 1) === "@") {
    if (str.charAt(0) === '\"' && str.charAt(str.length - 2) === '\"') {// String is double quoted
      return str;
    }
    if (str.charAt(0) === '\'' && str.charAt(str.length - 2) === '\'') {// String is single quoted
      return str;
    }
  }
  return "Subject Error: Language Tag is incorrectly formatted";
}
