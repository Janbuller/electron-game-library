'use strict';
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

var fs = require("fs");//hallo
var exec = require("child_process").execFile

var db = {
  "globalSettings": {
    "blurAmount": 80
  },
  "games": [
    {
      "name": "Super Mario World",
      "dirName": "super_mario_world",
      "steam": false,
      "IdOrExe": "C:\\Program Files\\SNES\\emu.exe C:\\roms\\smw.sfc",
      "blur": false,
      "description": "Super Mario World is a 1990 platform game developed by Nintendo for the Super Nintendo Entertainment System (SNES). The story follows Mario's quest to save Princess Toadstool and Dinosaur Land from the series' antagonist Bowser and his minions, the Koopalings. The gameplay is similar to that of earlier Super Mario games: players control Mario or his brother Luigi through a series of levels in which the goal is to reach the goalpost at the end. Super Mario World introduced Yoshi, a dinosaur who can eat enemies, as well as gain abilities by eating the shells of Koopa Troopas.",
      "images": {
        "bg": "db/super_mario_world/bg.png",
        "thumb": "db/super_mario_world/thumb.png"
      }
    }
  ]
}

function readFolderRecurs(path) {
  path += "/"
  fs.readdir(path, function(err, files) {
    if(err) {
      return console.error(err);
    }
    files.forEach(function(file) {
      console.log(path+file);
      if(fs.lstatSync(path+file).isDirectory()) {
        readFolderRecurs(path+file);
      }
    })
  })
}
var desc = document.getElementById("description-text");
desc.innerText = db.games[0].description;

readFolderRecurs("db")

function playClicked() {
  exec("D:\\Blender 2\.9\\blender\.exe", function(err, data) {
    console.log(err)
    console.log(data.toString())
  })
  console.log("play was clicked");
}

function settingsClicked() {
  console.log("settings was clicked");
}

document.getElementById("play-button").addEventListener("click", function(){playClicked()})
