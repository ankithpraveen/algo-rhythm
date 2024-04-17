const getAudioContext = () => {
  AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContent = new AudioContext();
  gainNode1 = audioContent.createGain();
  return audioContent;
};


var audioContext;
var dur;
var gainNode1;
var source1;
var firstLoad = 1;
var startedAt = null;
var pausedAt = null;
var abuff = null;
var duration = null;
var playbackTime = null;
var rate = null;
var isPlaying = 0;

var queue = 0;
var currentindex = 0;

var newplsongs = 0;
var newplids = 0;
var result = null;
var pldropdown = '';

function respscroll() {
  if (window.innerWidth < 575) {
    document.getElementById("main").setAttribute("style", "background-image: linear-gradient(rgb(0, 0, 0), rgb(37, 37, 37));height: cover; min-height:100vh;padding-bottom:30vh");
  }
  else {
    document.getElementById("main").setAttribute("style", "background-image: linear-gradient(rgb(0, 0, 0), rgb(37, 37, 37));height: 100vh;");
  }
}

document.addEventListener('DOMContentLoaded', function () {
  dur = document.getElementById("duration");
  const volumeControl1 = document.querySelector('#volume1');
  volumeControl1.addEventListener('input', function () {
    gainNode1.gain.value = this.value;
  }, false);
  const seekControl1 = document.querySelector('#seek1');
  seekControl1.addEventListener('input', function () {
    pause();
    rate = this.value * 100;
    playbackTime = (duration * rate) / 100;
    updatedur();
  }, false);
  seekControl1.addEventListener('mouseup', function () {
    seek(this.value);
    seekstart = 0;
  }, false);


  setInterval(() => {
    if (isPlaying) {
      playbackTime = (Date.now() - startedAt) / 1000;
      rate = parseInt((playbackTime * 100) / duration, 10);
      seekControl1.value = Math.round((((playbackTime * 100) / duration) / 100 + Number.EPSILON) * 1000) / 1000;
      if (rate > 100) {
        if (!queue == 0) {
          if (currentindex < queue[2]) {
            play(queue[0][currentindex], queue[1][currentindex]);
            source1.stop();
            currentindex += 1;
            isPlaying = 0;
          }
          else {
            isPlaying = 0;
            playpauseswitch();
            pausedAt = 0;
          }
        }
        else {
          isPlaying = 0;
          playpauseswitch();
          pausedAt = 0;
        }
      }
      updatedur();
    }
  }, 100)

}, false);

function updatedur() {
  //Keep track of playback duration
  var seconds = (Math.round(playbackTime));
  var minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  if (seconds < 10) {
    seconds = '0' + seconds.toString();
  }
  dur.innerHTML = minutes + ":" + seconds;
}

var retrieve = 1;

function play(id, name) {
  document.getElementById("footer").style.display = "block";
  if (firstLoad) {
    audioContext = getAudioContext();
    firstLoad = 0;
  }
  load = document.getElementById("playpause");
  load.innerHTML = `<div class="d-flex justify-content-center">
    <div class="spinner-border text-white" role="status">
      <span class="visually-hidden"></span>
    </div>
  </div>`;
  retrieve = 0;
  axios.post('/getSongData', { song_id: id }, { responseType: 'arraybuffer', withCredentials: true }).then((response) => {
    // create audioBuffer (decode audio file)
    const audioBuffer = audioContext.decodeAudioData(response.data).then((audioBuffer) => {

      source1 = audioContext.createBufferSource();
      source1.buffer = audioBuffer;
      abuff = audioBuffer;
      source1.connect(gainNode1).connect(audioContext.destination);

      startedAt = Date.now();
      duration = audioBuffer.duration;

      source1.start();
      isPlaying = 1;
      playpauseswitch();
      load.innerHTML = `<button onclick="pause()" class="btn btn-primary btn-floating bg-white">
      <i class="fa fa-pause-circle fa-3x" style="color:#0f64f2"></i>
    </button>`;
      document.getElementById("nplaying").innerHTML = name;
      retrieve = 1;
    });
  }, (error) => {
    console.log(error);
  });
}

function prev() {
  if (currentindex > 1) {
    stopprevsong(queue[0][currentindex - 2], queue[1][currentindex - 2], 0);
    currentindex -= 1;
  }
}

function next() {
  if (currentindex < queue[2]) {
    stopprevsong(queue[0][currentindex], queue[1][currentindex], 0);
    currentindex += 1;
  }
}

function pause() {
  source1.stop();
  pausedAt = Date.now() - startedAt;
  isPlaying = 0;
  playpauseswitch();

}

function stopprevsong(id, name, news) {
  if (retrieve) {
    if (source1 && isPlaying == 1) {
      source1.stop();
      isPlaying = 0;
    }
    if (newplids == 0) {
      play(id, name);
    }
    else {
      if (news) {
        queue = [newplids, newplsongs, newplids.length];
        currentindex = newplids[0].indexOf(id) + 1;
      }
      else {
        queue = 0;
        currentindex = 0;
      }
      play(id, name);
    }
  }
  else {
    alert("Please wait for previous song to load");
  }
}

function resume() {
  //source1.start();
  startedAt = Date.now() - pausedAt;
  source1 = audioContext.createBufferSource();
  source1.buffer = abuff;
  source1.connect(gainNode1).connect(audioContext.destination);
  source1.start(0, pausedAt / 1000);
  isPlaying = 1;
  playpauseswitch();
}

function stop() {
  source1.stop();
  isPlaying = 0;
}


function seek(val) {
  if (isPlaying) {
    source1.stop();
    source1 = audioContext.createBufferSource();
    source1.buffer = abuff;
    source1.connect(gainNode1).connect(audioContext.destination);
    source1.start(0, playbackTime);
    startedAt = Date.now() - playbackTime * 1000;
  }
  else {
    pausedAt = playbackTime * 1000;
  }
}



var gotSongs = 0;
var gotPlaylists = 0;
var songs = null;
var playlists = null;
function getSongs() {
  if (!gotSongs) {
    var sugg = document.getElementById("sugg");
    sugg.innerHTML = `<div class="d-flex justify-content-center">
    <div class="spinner-border text-white" role="status">
    </div>
  </div>`;
    axios.get('/getSongs').then((response) => {
      gotSongs = 1;
      songs = response.data;
      dynamic_search({ keyCode: 8 });
      getPlaylists();
    });

  }
}


function getPlaylists() {
  if (!gotPlaylists) {
    var sugg = document.getElementById("sugg");
    sugg.innerHTML = `<div class="d-flex justify-content-center">
    <div class="spinner-border text-white" role="status">
    </div>
  </div>`;
    axios.get('/getPlaylists').then((response) => {
      //gotPlaylists = 1;
      playlists = response.data;
      display_trending_songs();
    });

  }
}

function display_trending_songs() {
  if (gotSongs) {
    var sugg = document.getElementById("sugg");
    var trend = songs.slice(songs.length - 10, songs.length);
    trend = trend.reverse();
    var flag = 0;
    var temp = "";
    var to_display = [];
    for (var i = 0; i < trend.length; i++) {
      to_display.push({ name: trend[i].filename, id: trend[i]._id, artistname: trend[i].metadata.artistname });
    }
    sugg.innerHTML = "";
    if (to_display.length) {
      temp = `<div id="carousel"><h4 style="color: white">Trending Songs</h4><div id="carouselExampleControls" class="carousel slide" data-mdb-ride="carousel"><div class="carousel-inner" id="car">`;
    }
    else {
      temp = `<div id="carousel"><h4 style="color: white">No songs in db lol</h4></div`;
    }
    for (var i = 0; i < to_display.length; i++) {
      // sugg.innerHTML = sugg.innerHTML+"<br>"+`<button onclick = "play('`+to_display[i].id+`')" class="btn btn-primary">`+to_display[i].name+`</button><br>`;
      temp += ``;
      for (var j in playlists) {
        if (playlists[j].playlistname != "MySongs") {
          pldropdown += `<li><button class="dropdown-item" onclick="addtopl('` + playlists[j]._id + `','` + to_display[i].id + `','` + to_display[i].name + `','` + to_display[i].artistname + `')">` + playlists[j].playlistname + `</button></li>`;
        }
      }
      if (i % 5 == 0) {
        var x = "";
        if (i == 0) { x = "active"; }
        temp += `<div class="carousel-item ` + x + ` "><div class="row"><div class="col-sm-1" style="padding-top: 1%"></div>`;
        flag = 1;
      }
      temp += `<div class="col-sm-2" style="padding-top:10%">
                <div class="card" style="background-color:transparent;">
                  <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light" onclick="stopprevsong('`+ to_display[i].id + `','` + to_display[i].name + `',0);">
                    <img src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg" class="card-img-top rounded-bottom" alt="..." />
                    <a>
                      <div class="mask d-flex justify-content-center align-items-center"
                        style="background-color: rgba(0, 0, 0, 0.45);">
                        <button class="btn btn-primary btn-floating bg-white">
                          <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                        </button>
                      </div>
                    </a>
                  </div>
      

                  <blockquote style="padding-top:7px;padding-left:5px;margin-bottom:3px;" class="blockquote text-white">`+ to_display[i].name + `</blockquote><figcaption class="blockquote-footer" style="margin-bottom:3px;padding-top:10px;">
                  <cite title="Source Title">`+ to_display[i].artistname + `</cite>
                </figcaption>
                    <button class="text-info d-flex justify-content-start" style="font-size:15px;background-color:transparent;border:0px;padding-left:5px;" data-mdb-toggle="dropdown"
                    aria-expanded="false">Add to Playlist</button>
                    <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/newpldets">New Playlist</a></li>
                    <li>
                    <hr class="dropdown-divider" style="margin-top:0px;margin-bottom:0px;"/>
                    </li>`+ pldropdown + `</ul></div></div>`;
      if (i % 5 == 4) {
        temp += `</div></div>`;
        flag = 0;
      }
      pldropdown = '';
    }
    if (flag) { temp += `</div></div>`; }
    if (to_display.length) {
      temp += `</div>
              <button class="carousel-control-prev"  type="button"  data-mdb-target="#carouselExampleControls"  data-mdb-slide="prev" style="width:10%;padding-top:3%;">
              <span  class="carousel-control-prev-icon"   aria-hidden="true" ></span>
              <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-mdb-target="#carouselExampleControls"   data-mdb-slide="next"  style="width:10%;padding-top:3%;" >
              <span   class="carousel-control-next-icon"  aria-hidden="true"  ></span>
              <span class="visually-hidden">Next</span>
              </button>
              </div>
              </div>`;
    }
    sugg.innerHTML = temp;
  }

}

function dynamic_search(event) {
  if (gotSongs) {
    var flag = 0;
    var temp = "";
    var x = event.keyCode;
    var sugg = document.getElementById("sugg");
    if (x >= 32 || x === 8) {
      var squery = document.getElementById("sname");
      var search_text = squery.value;
      var slength = search_text.length;
      if (!slength) {
        sugg.innerHTML = ""
        display_trending_songs();
        return null;
      }
      search_text = search_text.toLowerCase();
      var to_display = [];
      for (var i = 0; i < songs.length; i++) {
        if (songs[i].filename.slice(0, slength).toLowerCase() == search_text) {
          to_display.push({ name: songs[i].filename, id: songs[i]._id, artistname: songs[i].metadata.artistname });
        }
      }
      sugg.innerHTML = "";
      if (to_display.length) {
        temp = `<div id="carousel"><h4 style="color: white">Search Results</h4><div id="carouselExampleControls" class="carousel slide" data-mdb-ride="carousel"><div class="carousel-inner" id="car">`;
      }
      else {
        temp = `<div id="carousel"><h4 style="color: white">No Results</h4></div`;
      }
      for (var i = 0; i < to_display.length; i++) {
        // sugg.innerHTML = sugg.innerHTML+"<br>"+`<button onclick = "play('`+to_display[i].id+`')" class="btn btn-primary">`+to_display[i].name+`</button><br>`;
        temp += ``;
        for (var j in playlists) {
          if (playlists[j].playlistname != "MySongs") {
            pldropdown += `<li><button class="dropdown-item" onclick="addtopl('` + playlists[j]._id + `','` + to_display[i].id + `','` + to_display[i].name + `','` + to_display[i].artistname + `')">` + playlists[j].playlistname + `</button></li>`;
          }
        }
        if (i % 5 == 0) {
          var x = "";
          if (i == 0) { x = "active"; }
          temp += `<div class="carousel-item ` + x + ` "><div class="row"><div class="col-sm-1" style="padding-top: 1%"></div>`;
          flag = 1;
        }
        temp += `<div class="col-sm-2" style="padding-top:10%">
                <div class="card" style="background-color:transparent;">
                  <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light" onclick="stopprevsong('`+ to_display[i].id + `','` + to_display[i].name + `',0);">
                    <img src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg" class="card-img-top rounded-bottom" alt="..." />
                    <a>
                      <div class="mask d-flex justify-content-center align-items-center"
                        style="background-color: rgba(0, 0, 0, 0.45);">
                        <button class="btn btn-primary btn-floating bg-white">
                          <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                        </button>
                      </div>
                    </a>
                  </div>
      

                  <blockquote style="padding-top:7px;padding-left:5px;margin-bottom:3px;" class="blockquote text-white">`+ to_display[i].name + `</blockquote><figcaption class="blockquote-footer" style="margin-bottom:3px;padding-top:10px;">
                  <cite title="Source Title">`+ to_display[i].artistname + `</cite>
                </figcaption>
                    <button class="text-info d-flex justify-content-start" style="font-size:15px;background-color:transparent;border:0px;padding-left:5px;" data-mdb-toggle="dropdown"
                    aria-expanded="false">Add to Playlist</button>
                    <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/newpldets">New Playlist</a></li>
                    <li>
                    <hr class="dropdown-divider" style="margin-top:0px;margin-bottom:0px;"/>
                    </li>`+ pldropdown + `</ul></div></div>`;
        if (i % 5 == 4) {
          temp += `</div></div>`;
          flag = 0;
        }
        pldropdown = '';
      }
      if (flag) { temp += `</div></div>`; }
      if (to_display.length) {
        temp += `</div>
              <button class="carousel-control-prev"  type="button"  data-mdb-target="#carouselExampleControls"  data-mdb-slide="prev" style="width:10%;padding-top:3%;">
              <span  class="carousel-control-prev-icon"   aria-hidden="true" ></span>
              <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-mdb-target="#carouselExampleControls"   data-mdb-slide="next"  style="width:10%;padding-top:3%;" >
              <span   class="carousel-control-next-icon"  aria-hidden="true"  ></span>
              <span class="visually-hidden">Next</span>
              </button>
              </div>
              </div>`;
      }
      sugg.innerHTML = temp;
    }
  }
}

function playpauseswitch() {
  var playpause = document.getElementById("playpause");
  if (isPlaying) {
    playpause.innerHTML = `<button onclick="pause()" class="btn btn-primary btn-floating bg-white">
    <i class="fa fa-pause-circle fa-3x" style="color:#0f64f2"></i>
  </button>`
  }
  else {
    playpause.innerHTML = `<button onclick="resume()" class="btn btn-primary btn-floating bg-white">
    <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
  </button>`
  }

}



function showpl() {
  var pls = document.getElementById("pls0");
  pls.innerHTML = `<div class="d-flex justify-content-center" id="plspinner">
  <div class="spinner-border text-white" role="status">
    <span class="visually-hidden"></span>
  </div>
</div>`;
  axios.get('/getPlaylists', { withCredentials: true }).then((response) => {
    result = response.data;
    var plshtml = `<div class="col-sm-3" style="padding-top: 1%"></div>
    <div class="col-sm-2" style="padding-top: 1%">
      <div class="card" style="background-color:transparent;">
        <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
          <img
            src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg"
            class="card-img-top rounded-bottom" alt="..." />
          <a href="/newpldets">
            <div class="
                    mask
                    d-flex
                    justify-content-center
                    align-items-center
                  " style="background-color: rgba(0, 0, 0, 0.45)">
              <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-plus-circle fa-3x" style="color: #0f64f2"></i>
              </button>
            </div>
          </a>
        </div>

        <h5 class="card-title text-white" style="padding-top:10px;padding-left:5px;">New Playlist</h5>

      </div>
    </div>`;
    var flag = 1;
    for (var i in response.data) {
      if (i < 2) {
        var pls = document.getElementById("pls0");
        plshtml += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card" style="background-color:transparent;">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="showplsongs('`+ (response.data[i]._id).toString() + `')">
                <img src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg" class="card-img-top rounded-bottom" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>

                <h5 class="card-title text-white" style="padding-top:10px;padding-left:5px;">`+ response.data[i].playlistname + `</h5>`;
        if (response.data[i].playlistname != "MySongs") {
          plshtml += `<button class="text-danger d-flex justify-content-start" style="font-size:15px;background-color:transparent;border:0px;padding-left:5px;" data-mdb-toggle="dropdown"
                aria-expanded="false" id="delpl">Delete</button>
                <ul class="dropdown-menu" aris-labeled-by="delpl">
                  <li><button class="dropdown-item text-body">Cancel</button></li>
                  <li><button class="dropdown-item text-danger" onclick="removepl('`+ (response.data[i]._id).toString() + `')">Confirm</button></li>
                </ul>`;
        }
        plshtml += `</div></div>`;
        pls.innerHTML += plshtml;
        plshtml = "";
      }
      else {
        if (i % 3 == 2) {
          plshtml += `<div class="carousel-item"> <div class="row">`;
          plshtml += `<div class="col-sm-3" style="padding-top: 1%"></div>`;
          flag = 1;
        }
        plshtml += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card" style="background-color:transparent;">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="showplsongs('`+ (response.data[i]._id).toString() + `')">
                <img src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg" class="card-img-top rounded-bottom" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>

                <h5 class="card-title text-white" style="padding-top:10px;padding-left:5px;">`+ response.data[i].playlistname + `</h5>
                <button class="text-danger d-flex justify-content-start" style="font-size:15px;background-color:transparent;border:0px;padding-left:5px;" data-mdb-toggle="dropdown"
                aria-expanded="false" id="delpl">Delete</button>
                <ul class="dropdown-menu" aris-labeled-by="delpl">
                  <li><button class="dropdown-item text-body">Cancel</button></li>
                  <li><button class="dropdown-item text-danger" onclick="removepl('`+ (response.data[i]._id).toString() + `')">Confirm</button></li>
                </ul>
                </div></div>`;
        if (i % 3 == 1) {
          plshtml += `</div></div>`;
          document.getElementById("car").innerHTML += plshtml;
          plshtml = "";
          flag = 0;
        }

      }
    }
    if (flag) {
      plshtml += `</div></div>`;
      document.getElementById("car").innerHTML += plshtml;
    }
    (document.getElementById("plspinner")).parentElement.removeChild(document.getElementById("plspinner"));



  });
}

// var gotSongs = 0;
// var songs = null;
// function getSongs() {
//     if (!gotSongs) {
//         axios.get('/getSongs').then((response) => {
//             gotSongs = 1;
//             songs = response.data;
//         });

//     }
// }

function newplaylist(u, d, plid, sid, sname, aname, sdelete) {
  axios.post('/newPlaylist', {
    //playlistname: document.getElementById('plname').value,
    playlistid: plid,
    songname: sname,
    songid: sid,
    artistname: aname,
    update: u,
    delete: d,
    sdel: sdelete
  }, { withCredentials: true })
    .then(function (response) {
      if (sdelete) {
        lplaylists();
      }
    });
  newplsongs = 0;
  newplids = 0;
}


// function addtolist(sname, id) {
//     newplsongs.push(sname);
//     newplids.push(id);
// }

function showplsongs(plid) {
  var inner = "";
  var flag = 1;
  document.getElementById("carousel2").remove();
  for (var i in result) {
    if (result[i]._id == plid) {
      newplsongs = result[i].songnames;
      newplids = result[i].songids;
      newplartists = result[i].artistnames;
      if (!result[i].songnames.length) {
        alert("No songs added yet");
        document.getElementById("container").innerHTML += `<div id="carousel2"></div>`;
        return null;
      }
      inner += `<div id="carousel2"><h4 style="color: white">Songs in ` + result[i].playlistname + `</h4><div id="carouselExampleControls2" class="carousel slide" data-mdb-ride="carousel"><div class="carousel-inner" id="car2">`;
      for (var j = 0; j < result[i].songnames.length; j++) {
        if (j % 3 == 0) {
          var x = "";
          if (j == 0) { x = "active"; }
          inner += `<div class="carousel-item ` + x + ` "><div class="row"><div class="col-sm-3" style="padding-top: 1%"></div>`;
          flag = 1;
        }
        inner += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card" style="background-color:transparent;">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="stopprevsong('`+ result[i].songids[j] + `','` + result[i].songnames[j] + `',1)">
                <img src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg" class="card-img-top rounded-bottom" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>
                <blockquote style="padding-top:7px;padding-left:5px;margin-bottom:3px;" class="blockquote text-white">`+ result[i].songnames[j] + `</blockquote><figcaption class="blockquote-footer" style="margin-bottom:3px;padding-top:10px;">
                  <cite title="Source Title">`+ result[i].artistnames[j] + `</cite>
                </figcaption>
                <button class="text-danger d-flex justify-content-start" style="font-size:15px;background-color:transparent;border:0px;padding-left:5px;" data-mdb-toggle="dropdown"
                aria-expanded="false" id="remsongs">Remove</button>
                <ul class="dropdown-menu">
                <li><button class="dropdown-item text-body">Cancel</button></li>
                <li><button class="dropdown-item text-danger" onclick="removefrompl('`+ plid + `','` + result[i].songids[j] + `')">Confirm</button></li>
                </ul>
                </div></div>`;
        if (j % 3 == 2) {
          inner += `</div></div>`;
          flag = 0;
        }
      }
      if (flag) { inner += `</div></div>`; }
      inner += `</div>
            <button class="carousel-control-prev"  type="button"  data-mdb-target="#carouselExampleControls2"  data-mdb-slide="prev" >
            <span  class="carousel-control-prev-icon"   aria-hidden="true" ></span>
            <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-mdb-target="#carouselExampleControls2"   data-mdb-slide="next"   >
            <span   class="carousel-control-next-icon"  aria-hidden="true"  ></span>
            <span class="visually-hidden">Next</span>
            </button>
            </div>
            </div>`;
      document.getElementById("container").innerHTML += inner;
      document.getElementById("main").setAttribute("style", "background-image: linear-gradient(rgb(0, 0, 0), rgb(37, 37, 37));height: cover;padding-bottom:30vh; min-height:100vh");
      break;
    }
  }
}

function dash() {
  newplsongs = [];
  newplsids = [];
  newplartists = [];
  document.getElementById("main").innerHTML = `<!-- Navbar -->
        <!-- Container wrapper -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-black sticky-top">
            <div class="container-fluid">
            <!-- Toggle button -->
            <button
                class="navbar-toggler"
                type="button"
                data-mdb-toggle="collapse"
                data-mdb-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <i class="fa fa-bars"></i>
            </button>

            <!-- Collapsible wrapper -->
            <div class="collapse navbar-collapse" id="navbarSupportedContent">

                <!-- Left links -->
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a
                    class="nav-link active"
                    style="color: rgb(54, 176, 233)"
                    href="/dashboard"
                    >Dashboard</a
                    >
                </li>
                <li class="nav-item">
                    <a class="nav-link" style="color: white" href="javascript:void(0);" onclick="lplaylists()">
                    My Library</a
                    >
                </li>
                <li class="nav-item">
                    <a class="nav-link" style="color: white" href="/newSong"
                    >Upload New Song</a
                    >
                </li>
                </ul>
                <!-- Left links -->
            </div>
            <!-- Collapsible wrapper -->

            <!-- Right elements -->
            <div class="d-flex align-items-center">
                <form class="d-flex" style="padding-right: 5%">
                <input
                    class="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    type="text"
                    class="form-control"
                    onkeyup="dynamic_search(event)"
                    onclick="getSongs()"
                    id="sname"
                    value=""
                />
                </form>
                <!-- Avatar -->
                <a
                style="padding-right: 5%"
                class="dropdown-toggle d-flex align-items-center hidden-arrow"
                href="#"
                id="navbarDropdownMenuLink"
                role="button"
                data-mdb-toggle="dropdown"
                aria-expanded="false"
                >
                <i class="fa fa-user fa-lg"></i>
                <!-- <img
                src="https://mdbootstrap.com/img/new/avatars/2.jpg"
                class="rounded-circle"
                height="40"
                alt=""
                loading="lazy"
                /> -->
                </a>
                <ul
                class="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdownMenuLink"
                >
                <li>
                <span class="dropdown-item-text" href="#">`+ document.getElementById("name").innerHTML + `</span>
              </li>
              <li>
                <span class="dropdown-item-text" href="#">`+ document.getElementById("email").innerHTML + `</span>
              </li>
                <li>
                    <a class="dropdown-item" href="/logout">Logout</a>
                </li>
                </ul>
            </div>
            <!-- Right elements -->
            </div>
            <!-- Container wrapper -->
        </nav>

        <!-- Navbar -->

        <div id="load"></div>
        <div class="container">
            <div class="row" id="sugg"></div>
        </div>

        <br /><br />`;
  document.getElementById("bg").style.height = "100vh";
  document.getElementById("main").setAttribute("style", "background-image: linear-gradient(rgb(0, 0, 0), rgb(37, 37, 37));height: 100vh;");
  respscroll();
  let stateObj = { id: "100" };
  gotSongs = 0;
  window.history.replaceState(stateObj, "dashboard", "/dashboard");
  getSongs();
}



function lplaylists() {
  document.getElementById("main").innerHTML = `<!-- Navbar -->
      <!-- Container wrapper -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-black sticky-top">
        <div class="container-fluid">
          <!-- Toggle button -->
          <button
            class="navbar-toggler"
            type="button"
            data-mdb-toggle="collapse"
            data-mdb-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i class="fa fa-bars"></i>
          </button>

          <!-- Collapsible wrapper -->
          <div class="collapse navbar-collapse" id="navbarSupportedContent">

            <!-- Left links -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" style="color: white" href="javascript:void(0);" onclick="dash()"
                  >Dashboard</a
                >
              </li>
              <li class="nav-item">
                <a
                  class="nav-link active"
                  style="color: rgb(54, 176, 233)"
                  href="/library"
                >
                  My Library</a
                >
              </li>
              <li class="nav-item">
                <a class="nav-link" style="color: white" href="/newSong"
                  >Upload New Song</a
                >
              </li>
            </ul>
            <!-- Left links -->
          </div>
          <!-- Collapsible wrapper -->

          <!-- Right elements -->
            <!-- Avatar -->
            <a
              style="padding-right: 0.75%"
              class="dropdown-toggle d-flex align-items-center hidden-arrow"
              href="#"
              id="navbarDropdownMenuLink"
              role="button"
              data-mdb-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fa fa-user fa-lg"></i>
              <!-- <img
              src="https://mdbootstrap.com/img/new/avatars/2.jpg"
              class="rounded-circle"
              height="40"
              alt=""
              loading="lazy"
            /> -->
            </a>
            <ul
              class="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarDropdownMenuLink"
            >
            <li>
            <span class="dropdown-item-text" href="#">`+ document.getElementById("name").innerHTML + `</span>
          </li>
          <li>
            <span class="dropdown-item-text" href="#">`+ document.getElementById("email").innerHTML + `</span>
          </li>
              <li>
                <a class="dropdown-item" href="/logout">Logout</a>
              </li>
            </ul>
          </div>
          <!-- Right elements -->
        </div>
        <!-- Container wrapper -->
      </nav>

      <!-- Navbar -->
      <div id="load"></div>
      <div id="body">
        <div class="container" id="container">
          <h4 style="color: white">My Playlists</h4>
          <div
            id="carouselExampleControls1"
            class="carousel slide"
            data-mdb-ride="carousel"
          >
            <div class="carousel-inner" id="car">
              <div class="carousel-item active">
                <div class="row" id="pls0">
                  <div class="col-sm-3" style="padding-top: 1%"></div>
                  <div class="col-sm-2" style="padding-top: 1%">
                    <div class="card" style="background-color:transparent;">
                      <div
                        class="bg-image hover-overlay ripple"
                        data-mdb-ripple-color="light"
                      >
                        <img
                          src="https://i.etsystatic.com/13751308/r/il/f624e4/3698920649/il_570xN.3698920649_o89x.jpg"
                          class="card-img-top rounded-bottom"
                          alt="..."
                        />
                        <a href="/newpldets">
                          <div
                            class="
                              mask
                              d-flex
                              justify-content-center
                              align-items-center
                            "
                            style="background-color: rgba(0, 0, 0, 0.45)"
                          >
                            <button
                              class="btn btn-primary btn-floating bg-white"
                            >
                              <i
                                class="fa fa-plus-circle fa-3x"
                                style="color: #0f64f2"
                              ></i>
                            </button>
                          </div>
                        </a>
                      </div>

                        <h5 class="card-title text-white" style="padding-top:10px;padding-left:5px;">New Playlist</h5>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              class="carousel-control-prev"
              type="button"
              data-mdb-target="#carouselExampleControls1"
              data-mdb-slide="prev"
            >
              <span
                class="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button
              class="carousel-control-next"
              type="button"
              data-mdb-target="#carouselExampleControls1"
              data-mdb-slide="next"
            >
              <span
                class="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
          <br />
          <br />
          <div id="carousel2"></div>
        </div>
      </div>`;
  document.getElementById("main").setAttribute("style", "background-image: linear-gradient(rgb(0, 0, 0), rgb(37, 37, 37));height: 100vh;");
  showpl();
  respscroll();
  let stateObj = { id: "100" };
  window.history.replaceState(stateObj, "library", "/library");
}

function removefrompl(plid, songid) {
  newplaylist(1, 0, plid, songid.toString(), "", "", 1);
  alert("Song removed!");
}

function addtopl(plid, songid, songname, aname) {
  newplaylist(1, 0, plid, songid.toString(), songname, aname, 0);
  alert("Song added!");
}

function removepl(plid) {
  newplaylist(0, 1, plid, '', '', '', 1);
  alert("Playlist deleted!");
}