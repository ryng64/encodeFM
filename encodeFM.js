import { errorMessage, clearErrorMessage } from "./components/errorMessage";
import JSONEditor from "jsoneditor";
import preferences, {
  toggleSemicolon,
  toggleVars,
} from "./components/preferences";

export default function init() {
  // //init preferences
  window.preferences = preferences();
  const semicolonSwitch = document.getElementById("customSwitch1");
  const useVars = document.getElementById("vars");

  const container = document.getElementById("jsoneditor");
  const options = {
    mode: "code",
    modes: ["code", "tree", "form"],
  };
  const editor = new JSONEditor(container, options, "");
  window.jseditor = editor;

  //Translate button
  document.getElementById("translate").onclick = () => {
    translate();
  };
  //SemiColon Switch
  semicolonSwitch.onchange = (e) => {
    toggleSemicolon(e);
  };
  //vars Switch
  useVars.onchange = (e) => {
    toggleVars(e);
  };

  //Save Button
  document.getElementById("save").onclick = () => {
    saveJSON();
  };

  //Copy button
  document.getElementById("copy").onclick = () => {
    copyText();
  };
}

// FileMaker can only access function names and variables that are declared in the global namespace.
// To allow the use of the translate function, add as a property to the window
window.translate = translate;
window.fmTranslate = fmTranslate;
window.flatten = jsonEncodeFM;
window.getJSON = getJSON;

function setInput(jsonString) {
  const json = JSON.parse(jsonString);
  window.jseditor.set(json);
}

function fmTranslate(str) {
  //set the input to string and translate
  setInput(str);
  encodeFM(str);
}

function translate() {
  const json = JSON.stringify(window.jseditor.get());
  encodeFM(json);
}

function getJSON() {
  const json = JSON.stringify(window.jseditor.get());
  return json;
}

function encodeFM(object) {
  if (object == "") return;

  let obj = "";
  if (getVariableType(object) === "String") {
    try {
      obj = JSON.parse(object);
    } catch (e) {
      //Invalid Syntax
      return errorMessage();
    }
  } else {
    obj = object;
  }

  const result = jsonEncodeFM(obj);

  clearErrorMessage();
  document.getElementById("output").value = result;
}

function copyText() {
  const output = document.getElementById("output");
  output.select();
  output.setSelectionRange(0, 99999); //meant for mobile according to w3 schools
  document.execCommand("copy");
}

function saveJSON() {
  const json = window.jseditor.get();
  FileMaker.PerformScript("Save JSON", JSON.stringify(json));
}

function jsonEncodeFM(object, result = [], parentKey = "") {
  //Check datatype of object passed.
  const variableType = getVariableType(object);

  //If there are no keys, or an empty object, return just the object
  if (isEmpty(object)) {
    return `"${JSON.stringify(object)}"`;
  }

  //1. Get list of [{key, value, datatype}, ... ]
  if (variableType === "Object" || variableType === "Array") {
    //first layer of keys
    const keys = Object.keys(object);

    keys.forEach((k) => {
      const val = object[k];
      const valType = getVariableType(object[k]);

      //if key is another array or object, do something recursive
      //check if it is a number
      const kType = variableType === "Object" ? "string" : "number";
      const dotnotation = k.includes(".") && kType === "string";
      let key = "";
      if (parentKey === "") {
        //inital key, numbers must go in [] and strings as they are.
        if (dotnotation) {
          key = `.['${k}']`;
        } else {
          key = kType === "string" ? k : `[${k}]`;
        }
      } else {
        //[] and . notation key that gets built as the function is executed recursively..
        if (dotnotation) {
          key = `${parentKey}['${k}']`;
        } else {
          key =
            kType === "string"
              ? `${parentKey}.${k}`
              : (key = `${parentKey}[${k}]`);
        }
      }

      if (valType === "Object") {
        if (Object.keys(val).length === 0) {
          const value = JSON.stringify(val);
          const dataType = `JSON${valType}`;
          result.push({
            key,
            value,
            dataType,
          });
        } else {
          //We gotta go deeper...
          jsonEncodeFM(val, result, key);
        }
        //if the array is empty don't go deeper
      } else if (valType === "Array") {
        if (val.length === 0) {
          const value = JSON.stringify(val);
          const dataType = `JSON${valType}`;
          result.push({
            key,
            value,
            dataType,
          });
        } else {
          //We gotta go deeper...
          jsonEncodeFM(val, result, key);
        }
      } else {
        const value = val;
        const dataType = `JSON${valType}`;
        result.push({
          key,
          value,
          dataType,
        });
      }
    });
    return createFMJSON(result, object);
  } else {
    return `"${JSON.stringify(object)}"`;
  }

  //2. Go through list and recreate a JSONSetElement() expression.
}

function createFMJSON(valueList, object) {
  const leadingSemi = window.preferences.semicolonLeading;
  const useVars = window.preferences.useVars;
  const brackets = getVariableType(object) === "Object" ? `"{}"` : `"[]"`;
  let result = "";
  const properties = valueList
    .map((obj, i, arr) => {
      let v = "";
      if (obj.dataType === "JSONBoolean" || obj.dataType === "JSONNumber") {
        v = obj.value;
      } else if (obj.dataType === "JSONNull") {
        v = `"${obj.value}"`;
      } else {
        v = `${JSON.stringify(obj.value)}`;
      }

      if (obj.dataType === "JSONString") {
        if (obj.value.includes("\t")) {
          v = `"${obj.value}"`;
        }
        if (obj.value.includes("\r")) {
          v = `"${obj.value.replaceAll("\r", "¶")}"`;
        }
        if (obj.value.includes("\n")) {
          v = `"${obj.value.replaceAll("\n", "¶")}"`;
        }
      }

      //example ["layouts"; "Projects"; JSONString]
      //example ["query.activeStatus"; True; JSONBoolean]
      if (useVars) {
        console.log("useVars", obj.key);
        console.log("useVars", obj.key.startsWith("["));
        v = obj.key.startsWith("[") ? obj.key.replace("[", "_") : obj.key;
        v = v.replaceAll("[", ".").replaceAll("]", "");
        v = v.replaceAll("'", "");
        v = `$${v}`;
      }

      if (leadingSemi) {
        return `; ["${obj.key}"; ${v}; ${obj.dataType}]`;
      } else if (i === arr.length - 1) {
        return `  ["${obj.key}"; ${v}; ${obj.dataType}]`;
      } else {
        return `  ["${obj.key}"; ${v}; ${obj.dataType}];`;
      }
    })
    .join("\r");
  result = `JSONSetElement( ${brackets}${
    leadingSemi ? "" : ";"
  } \r${properties}\r)`;
  return result;
}

function getVariableType(object) {
  const stringConstructor = "test".constructor;
  const arrayConstructor = [].constructor;
  const objectConstructor = {}.constructor;
  if (object === null) {
    return "Null";
  }
  if (object === undefined) {
    return "undefined";
  }
  if (object.constructor === stringConstructor) {
    return "String";
  }
  if (object.constructor === arrayConstructor) {
    return "Array";
  }
  if (object.constructor === objectConstructor) {
    return "Object";
  }
  if (typeof object === "boolean") {
    return "Boolean";
  }
  if (typeof object === "number") {
    return "Number";
  }
  {
    return "Unknown";
  }
}

function isEmpty(val) {
  const type = getVariableType(val);
  //
  if (type === "Object") {
    const keys = Object.keys(val);
    return keys.length === 0;
  }
  if (type === "Array") {
    return val.length === 0;
  }
  if (type === "String") {
    return val === "";
  }
  if (type === "Null") {
    return true;
  }
}
