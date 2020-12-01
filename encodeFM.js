export default function init() {
    document.getElementById('translate').onclick = () => {translate()}
}

// FileMaker can only access function names and variables that are declared in the global namespace.
//To allow the use of the translate function, add as a property to the window
window.translate = translate

function translate() {
    const ta = document.getElementById('input')
    encodeFM(ta.value)
}

function encodeFM( object ) {
    let obj = '';
    if( getVariableType(object) === "String"){
        obj = JSON.parse(object)
    } else{
        obj = object
    }
    const result = jsonEncodeFM( obj );
    document.getElementById("output").value = result;
}


function copyText() {
    console.log(document.getElementById("output").value)
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
                block = `[ "${k}" ; "${val}"; JSON${valType === "Unknown" ? "String" : valType }]`
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