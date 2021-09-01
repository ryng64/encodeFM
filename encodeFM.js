import { errorMessage, clearErrorMessage } from "./components/errorMessage";
import JSONEditor from "jsoneditor";
import 'jsoneditor/dist/jsoneditor.css';
// import './JSONEditorDemo.css';

export default function init() {

  //
  const container = document.getElementById("jsoneditor");
  const options = {mode:"code", modes:["code","tree","form"]}
  const editor = new JSONEditor(container, options);
  window.jseditor = editor
  
  //Translate button
  document.getElementById("translate").onclick = () => {
    translate();
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

function setInput(jsonString) {
  window.jseditor.set(jsonString)
}


function fmTranslate(str) {
  //set the input to string and translate
  setInput(str);
  encodeFM(str);
}

function translate() {
  const json = JSON.stringify(window.jseditor.get())
  encodeFM(json);
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
  const brackets = getVariableType(object) === "Object" ? `"{}"` : `"[]"`;
  let result = "";
  const properties = valueList
    .map((obj) => {
      let v = "";
      if (obj.dataType === "JSONBoolean" || obj.dataType === "JSONNumber") {
        v = obj.value;
      }else if(obj.dataType === "JSONNull"){
        v = `"${obj.value}"`
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
      return `; ["${obj.key}"; ${v}; ${obj.dataType}]`;
    })
    .join("\r");
  result = `JSONSetElement( ${brackets} \r${properties}\r)`;
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
