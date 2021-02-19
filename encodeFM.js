import { errorMessage, clearErrorMessage } from "./components/errorMessage";

export default function init() {
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
window.flatten = jsonEncodeFlattenFM;

function setInput(jsonString) {
  const ta = document.getElementById("input");
  ta.value = jsonString;
}

function fmTranslate(str) {
  //set the input to string and translate
  setInput(str);
  encodeFM(str);
}

function translate() {
  const ta = document.getElementById("input");
  encodeFM(ta.value);
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
  const result = jsonEncodeFlattenFM(obj);
  clearErrorMessage();
  document.getElementById("output").value = result;
}

function copyText() {
  const output = document.getElementById("output");
  output.select();
  output.setSelectionRange(0, 99999); //meant for mobile according to w3 schools
  document.execCommand("copy");
}

function jsonEncodeFM(object, tablevel = 0) {
  //Check datatype of object passed.
  const vType = getVariableType(object);

  //If there are no keys, or an empty object, return just the object
  if (isEmpty(object)) {
    return `"${JSON.stringify(object)}"`;
  }

  if (vType === "Object" || vType === "Array") {
    const brackets = vType === "Object" ? "{}" : "[]";
    const keys = Object.keys(object);
    const blocks = keys
      .map((k) => {
        let block = ``;
        const val = object[k];
        const valType = getVariableType(object[k]);
        if (valType === "Object" || valType === "Array") {
          block = `[ "${k}" ; ${jsonEncodeFM(
            object[k],
            tablevel + 1
          )}; JSON${valType}]`;
        } else {
          const blockVal =
            valType === "Number" || valType === "Boolean" ? val : `"${val}"`;
          block = `[ "${k}" ; ${blockVal}; JSON${
            valType === "Unknown" ? "String" : valType
          }]`;
        }
        return block;
      })
      .join(`;\r${tabify(tablevel + 1)}`);
    // let starter = `JSONSetElement ( "${brackets}"; ${blocks} )`
    const sub = tablevel + 1;
    const thisTab = tabify(tablevel);
    const subTab = tabify(sub);
    let starter = `JSONSetElement (\r`;
    starter = starter + `${subTab}"${brackets}";\r`;
    starter = starter + `${subTab}${blocks}\r`;
    starter = starter + `${thisTab})`;

    return starter;
  } else {
    return `"${JSON.stringify(object)}"`;
  }
}

function jsonEncodeFlattenFM(object, result = [], parentKey = "") {
  // console.log("flatten => object", object);
  //Check datatype of object passed.
  const variableType = getVariableType(object);

  //If there are no keys, or an empty object, return just the object
  if (isEmpty(object)) {
    return `"${JSON.stringify(object)}"`;
  }
  //1. Get list of [{key, value, datatype}, ... ]
  if (variableType === "Object" || variableType === "Array") {
    //Set up brackets accordingly
    const brackets = variableType === "Object" ? "{}" : "[]";

    //first layer of keys
    const keys = Object.keys(object);

    keys.forEach((k) => {
      const val = object[k];
      const valType = getVariableType(object[k]);
      //if key is another array or object, do something recursive
      if (valType === "Object" || valType === "Array") {
        const key = parentKey === "" ? k : `${parentKey}[${k}]`;
        // const pKey = `${parentKey}[${key}]`;
        console.log("jsonEncodeFlattenFM => key:", key);
        jsonEncodeFlattenFM(val, result, key);
      } else {
        //if parent key is empty, check if the key is number or a string
        let key = "";
        if (parentKey === "") {
          key = getVariableType(k) === "String" ? k : `[${k}]`;
        } else {
          key =
            getVariableType(k) === "String"
              ? `${parentKey}.${k}`
              : `${parentKey}[${k}]`;
        }

        // const key = parentKey === "" ? k : `${parentKey}[${k}]`;
        const value = val;
        const dataType = `JSON${valType}`;
        result.push({
          key,
          value,
          dataType,
        });
      }
      // return block;
    });
    console.log("jsonEncodeFlattenFM => result:", createFlatFMJSON(result));
    return result;
  } else {
    return `"${JSON.stringify(object)}"`;
  }

  //2. Go through list and recreate a JSONSetElement() expression "Flattened" out
}

function createFlatFMJSON(valueList) {
  console.log("valueList", valueList);
  const result = valueList
    .map((obj) => {
      return `["${obj.key}" ; ${
        obj.dataType === "JSONString" ? `"${obj.value}"` : obj.value
      }; ${obj.dataType}]`;
    })
    .join(";\r");
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

function tabify(num = 0) {
  let tab = "";
  for (let i = 0; i < num; i++) {
    tab = tab + "    ";
  }
  return tab;
}
