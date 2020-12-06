# encodeFM
A FileMaker file to convert JSON syntax into the FileMaker JSONSetElement syntax

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
