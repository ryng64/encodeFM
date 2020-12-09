# encodeFM
A FileMaker file to convert JSON syntax into the FileMaker JSONSetElement syntax

## Development
this project uses [Parcel](https://parceljs.org/getting_started.html) to build. I highly recomend taking the time to set up a parcel build as it saves soo much time in development.

> npm install

> parcel index.html

In a browser, go to http://localhost:1234/

Page will resfresh live as you update and save your code.

## Build
this may build a lot of files into a `dist/` folder, however the index.html file in this folder will contain all the javascript, css and html inlined into a single file. This build file is the added to the `html` field in the Web Direct Source Layout for encodeFM.

> parcel build index.html

- dist/index.html ( inlined html, css, javascript )
- put contents into encodeFM::html


## Translate

Paste in a any JSON formated text and Click Translate
- 'Translate' is a javascript function that can be called by the Perform Javascript in Web Viewer script step ( scripted button )


## Samples

List flat list of objects

```
[
  {
    "animal": "cat",
    "name": "mako",
    "color": "black and white"
  },
  {
    "animal": "cat",
    "name": "swirly",
    "color": "tabby"
  },
  {
    "animal": "dog",
    "name": "coco",
    "color": "chocolate"
  }
]
```

---

nested example

```
[
  {
    "animal": "cat",
    "name": "mako",
    "color": "black and white",
    "favoritePlaces": [
        "bedroom window", 
        "bathroom sink", 
        "scratching post"
    ],
    "attributes":{
        "eyes":"yellow",
        "loudnes":"31dB"
    }
  },
  {
    "animal": "cat",
    "name": "swirly",
    "color": "tabby",
    "favoritePlaces": [
        "climber", 
        "office chair", 
        "scratching post"
    ],
    "attributes":{
        "eyes":"green",
        "loudnes":"29dB"
    }
  },
  {
    "animal": "dog",
    "name": "coco",
    "color": "chocolate"

  }
]
```
