var newplsongs = [];
var newplids = [];
var newplartists = [];
var tsugg = [];
var tadded = [];


var gotSongs = 0;
var songs = null;
function getSongs() {
  if (!gotSongs) {
    axios.get('/getSongs').then((response) => {
      gotSongs = 1;
      songs = response.data;
    }).then((response) => { dynamic_search({ keyCode: 8 }) });

  }
}

function newplaylist(u, d) {
  if (!(document.getElementById('plname').value == "MySongs")){
    axios.post('/newPlaylist', {
      playlistname: document.getElementById('plname').value,
      songnames: newplsongs,
      songids: newplids,
      artistnames:newplartists,
      update: u,
      delete: d
    }, { withCredentials: true })
      .then(function (response) {
        alert("Created!");
      })
    newplsongs = [];
    newplids = [];
    newplartists = [];
  }
  else{
    alert("Bruh");
  }
}


function addtolist(event) {
  if (!newplids.includes(event.id)) {
    newplsongs.push(event.name);
    newplids.push(event.id);
    newplartists.push(event.value);
    var tadded = document.getElementById("tadded");
    event.parentNode.parentNode.parentNode.removeChild(event.parentNode.parentNode);
    tadded.innerHTML += `<tr>
    <th scope="row" class="text-white"><figure>
    <blockquote class="blockquote">
      <p>
        `+ event.name + `
      </p>
    </blockquote>
    <figcaption class="blockquote-footer">
      <cite title="Source Title"> `+event.value+`</cite>
    </figcaption>
    </figure></th>
    <td style="text-align:right;" ><button type="button" class="btn btn-primary btn-floating bg-white" id="`+ event.id + `" onclick="removefromlist(this)" name="` + event.name + `" value="`+event.parentNode.name+`">
        <i class="fa fa-minus-circle fa-3x" style="color:#0f64f2"></i>
    </button></td>
    </tr>`;
  }
}

function dynamic_search(event) {
  if (gotSongs) {
    var x = event.keyCode;
    var tsugg = document.getElementById("tsugg");
    if (x >= 32 || x === 8) {
      var squery = document.getElementById("sname");
      var search_text = squery.value;
      var slength = search_text.length;
      if (!slength) {
        tsugg.innerHTML = ""
        return null;
      }
      search_text = search_text.toLowerCase();
      var to_display = [];
      for (var i = 0; i < songs.length; i++) {
        if (songs[i].filename.slice(0, slength).toLowerCase() == search_text) {
          to_display.push({ name: songs[i].filename, id: songs[i]._id ,a_name:songs[i].metadata.artistname});
        }
      }
      console.log(to_display);
      tsugg.innerHTML = ""
      for (var i in to_display) {
        if (!newplids.includes(to_display[i].id)) {
          tsugg.innerHTML += `<tr id="` + to_display[i].id + `">
                <th scope="row" class="text-white"><figure>
                <blockquote class="blockquote">
                  <p>
                    `+ to_display[i].name + `
                  </p>
                </blockquote>
                <figcaption class="blockquote-footer">
                  <cite title="Source Title">`+to_display[i].a_name+`</cite>
                </figcaption>
              </figure></th>
                <td style="text-align:right;"><button type="button" class="btn btn-primary btn-floating bg-white" id="`+ to_display[i].id + `" onclick="addtolist(this)" name="` + to_display[i].name + `" artist="`+to_display[i].a_name+`"  value="`+to_display[i].a_name+`">
                    <i class="fa fa-plus-circle fa-3x" style="color:#0f64f2"></i>
                </button></td>
            </tr>`;
        }
      }

    }
  }
}

function removefromlist(event) {
  newplsongs = newplsongs.filter(e => e !== event.name);
  newplids = newplids.filter(e => e !== event.id);
  newplartists = newplartists.filter(e => e !== event.artist);

  event.parentNode.parentNode.parentNode.removeChild(event.parentNode.parentNode);
  dynamic_search({keyCode:8});
}