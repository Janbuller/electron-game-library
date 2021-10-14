'use strict';
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const fs = require("fs");//hallo
const exec = require("child_process").execFile
const open = require('open');
const {ipcRenderer} = require('electron');
const ini = require('ini')

let curSelGame = 0;

var db = {
  "globalSettings": {
    "blurAmount": 80
  },
  "games": [
  ]
}

function loadDB(path) {
  path += "/"
  fs.readdir(path, function(err, files) {
    if(err) {
      return console.error(err);
    }

    files.forEach(function(file) {
      if(fs.lstatSync(path+file).isDirectory()) {
        var info = ini.parse(fs.readFileSync(path+file+"/info.ini", 'utf-8'))
        let game = {}
        game.dirName = file;
        game.name = info.GameInfo.Name
        game.steam = info.GameInfo.Steam
        game.IdOrExe = info.GameInfo.IdOrExe
        game.blur = info.GameInfo.BlurBack
        game.description = fs.readFileSync(path+file+"/desc.txt", 'utf-8')
        game.images = {}
        game.images.bg = path+file+"/bg.png"
        game.images.thumb = path+file+"/thumb.png"
        db.games.push(game)
      }
    })
  })
}
loadDB("db")

function setupGamesList(inputDB) {
  var list = document.createElement("ul");
  list.setAttribute("id", "games-list")
  db.games.forEach(function(game, i) {
    var listItem = document.createElement("li");
    listItem.setAttribute("class", "game")
    listItem.innerText = game.name
    if(i == curSelGame) {
      listItem.setAttribute("id", "selected")
    }
    listItem.addEventListener("click", function(){gameClicked(i)}, false)
    list.appendChild(listItem)
  })
  document.getElementById("games-list").replaceWith(list);
}

function refreshAll() {
  const game = db.games[curSelGame]
  setupGamesList(db)
  document.getElementById("thumb-img").setAttribute("src", game.images.thumb)
  document.getElementById("bg-img").setAttribute("src", game.images.bg)
  document.getElementById("title-text").innerText = game.name
  document.getElementById("description-text").innerText = game.description
}

function gameClicked(index) {
  settingsClicked(true);
  curSelGame = index;
  refreshAll()
}

//var desc = document.getElementById("description-text");
//desc.innerText = db.games[0].description;

function playClicked() {
  const game = db.games[curSelGame]
  if(game.steam) {
    open('steam://rungameid/' + game.IdOrExe);
  } else {
    exec(game.IdOrExe, function(err, data) {
      console.log(err)
      console.log(data.toString())
    })
  }
}

function settingsClicked(justClose) {
  var imgHold = document.getElementById("thumb-img-holder");
  var setArea = document.getElementById("settings-area");
  var setButTex = document.getElementById("settings-text");

  if(justClose) {
    imgHold.hidden = false;
    setArea.hidden = true;
    setButTex.innerText = "Settings"
    return;
  }

  if(imgHold.hidden) {
    imgHold.hidden = false;
    setArea.hidden = true;
    setButTex.innerText = "Settings"
    saveSettingsFromMenu();
  } else {
    imgHold.hidden = true;
    setArea.hidden = false;
    setButTex.innerText = "Apply"
    loadSettingsForMenu()
  }
}

function loadSettingsForMenu() {
  var game = db.games[curSelGame]

  var InName = document.getElementById("name-input")
  var InSteam = document.getElementById("steam-checkbox")
  var TextExe = document.getElementById("exe-text")
  var InExe = document.getElementById("exe-input")
  var InImg = document.getElementById("image-input")
  var InBgImg = document.getElementById("bg-img-input")
  var InDesc = document.getElementById("description-input")

  InName.value = game.name
  InSteam.checked = game.steam;
  if(game.steam) {
    TextExe.innerText = "What is the Steam-ID"
  } else {
    TextExe.innerText = "Where is the game?"
  }
  InExe.value = game.IdOrExe;
  InDesc.value = game.description
}

function saveSettingsFromMenu() {
  var game = db.games[curSelGame]
  var InName = document.getElementById("name-input")
  var InSteam = document.getElementById("steam-checkbox")
  var TextExe = document.getElementById("exe-text")
  var InExe = document.getElementById("exe-input")
  var InImg = document.getElementById("image-input")
  var InBgImg = document.getElementById("bg-img-input")
  var InDesc = document.getElementById("description-input")

  var gameini = ini.parse(fs.readFileSync("db/"+game.dirName+"/info.ini", 'utf-8'))
  gameini.GameInfo.Name = InName.value;
  gameini.GameInfo.Steam = InSteam.checked;
  gameini.GameInfo.IdOrExe = InExe.value;
  fs.writeFileSync("db/"+game.dirName+"/info.ini", ini.stringify(gameini))
  fs.writeFileSync("db/"+game.dirName+"/desc.txt", InDesc.value)

  console.log(InImg.value)

  db.games = []
  loadDB("db")
  setTimeout(function() {refreshAll()}, 50);
}

function closeClicked(){
  console.log("close was clicked");
  ipcRenderer.send('close-clicked')
}

document.getElementById("play-button").addEventListener("click", function(){playClicked()})
document.getElementById("settings-button").addEventListener("click", function(){settingsClicked(false)})
document.getElementById("close-button").addEventListener("click", function(){closeClicked()})

document.getElementById("steam-checkbox").addEventListener("change", function() {
  var TextExe = document.getElementById("exe-text")
  if(this.checked) {
    TextExe.innerText = "What is the Steam-ID"
  } else {
    TextExe.innerText = "Where is the game?"
  }
})

setTimeout(function() {refreshAll()}, 50);
