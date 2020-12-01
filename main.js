import efm from './encodeFM'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css' // Import precompiled Bootstrap css
import '@fortawesome/fontawesome-free/css/all.css'

const sample = [
    {
        animal: 'cat',
        name: 'mako',
        color: 'black and white'
    },
    {
        animal: 'cat',
        name: 'swirly',
        color: 'tabby'
    },
    {
        animal: 'dog',
        name: 'coco',
        color: 'chocolate'
    },
]

//console log a sample json block
console.log(sample)

efm()