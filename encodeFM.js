import {errorMessage, clearErrorMessage} from './components/errorMessage'

export default function init() {
    //Translate button
    document.getElementById('translate').onclick = () => {translate()}

    //Copy button
    document.getElementById('copy').onclick = () => {copyText()}
}

// FileMaker can only access function names and variables that are declared in the global namespace.
// To allow the use of the translate function, add as a property to the window
window.translate = translate

function translate() {
    const ta = document.getElementById('input')
    encodeFM(ta.value)
}

function encodeFM( object ) {
    if(object == '') return

    console.log(object)
    let obj = '';
    if( getVariableType(object) === "String"){
        try {
            obj = JSON.parse(object);
        } catch(e) {
            //Invalid Syntax
            return errorMessage()
        }
    } else{
        obj = object
    }
    const result = jsonEncodeFM( obj );
    clearErrorMessage()
    document.getElementById("output").value = result;
}


function copyText() {
    const output = document.getElementById('output')
    output.select()
    output.setSelectionRange(0,99999) //meant for mobile according to w3 schools
    document.execCommand('copy')
}

function jsonEncodeFM( object, tablevel = 0 ){  
    //Check datatype of object passed.
    const vType = getVariableType( object ) 
    if( vType === "Object" || vType === "Array") {
        
        const brackets = vType === "Object" ? "{}" : "[]"
        const keys = Object.keys(object);
        const blocks = keys.map( k => {
            let block = ``
            const val = object[k]
            const valType = getVariableType( object[k] )
            if( valType === "Object" || valType === "Array") {
                block = `[ "${k}" ; ${ jsonEncodeFM(object[k], tablevel + 1) }; JSON${valType}]`
            } else {
                const blockVal = valType === "Number" || valType === "Boolean" ? val : `"${val}"`
                block = `[ "${k}" ; ${blockVal}; JSON${valType === "Unknown" ? "String" : valType }]`
            }
            return block
        }).join(`;\r${tabify(tablevel + 1)}`)
        // let starter = `JSONSetElement ( "${brackets}"; ${blocks} )`
        const sub = tablevel + 1; 
        const thisTab = tabify(tablevel)
        const subTab = tabify(sub)
        let starter = `JSONSetElement (\r`
        starter = starter + `${subTab}"${brackets}";\r`
        starter = starter + `${subTab}${blocks}\r`
        starter = starter + `${thisTab})`

        //todo: format return to be not so ugly

        return starter
    } else {
        return object
    }
}

function getVariableType( object ) {
    const stringConstructor = "test".constructor;
    const arrayConstructor = [].constructor;
    const objectConstructor = ({}).constructor;
    if (object === null) {
        return "null";
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
    if(typeof object === "boolean"){
        return "Boolean"
    }
    if(typeof object === "number"){
        return "Number"
    }
    {
        return "Unknown";
    }
}


function tabify(num = 0){
    let tab = ''
    for (let i = 0; i < num; i++) {
        tab = tab + "    ";
    }
    return tab
}