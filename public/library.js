var newplsongs = [];
var newplis = [];
var result = null;


function showpl() {
    axios.get('/getPlaylists', { withCredentials: true }).then((response) => {
        result = response.data;
        var plshtml = ``;
        for (var i in response.data) {
            if (i < 2) {
                var pls = document.getElementById("pls0");
                plshtml += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="showplsongs('`+ (response.data[i]._id).toString() + `')">
                <img src="https://mdbootstrap.com/img/new/standard/nature/184.jpg" class="card-img-top" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>
                <div class="card-body">
                <h5 class="card-title">`+ response.data[i].playlistname + `</h5>
                </div></div></div>`;
                pls.innerHTML += plshtml;
                plshtml = "";
            }
            else {
                if (i % 3 == 2) {
                    plshtml += `<div class="carousel-item"> <div class="row"">`;
                    plshtml += `<div class="col-sm-3" style="padding-top: 1%"></div>`;
                }

                plshtml += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="showplsongs('`+ (response.data[i]._id).toString()+ `')">
                <img src="https://mdbootstrap.com/img/new/standard/nature/184.jpg" class="card-img-top" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>
                <div class="card-body">
                <h5 class="card-title">`+ response.data[i].playlistname + `</h5>
                </div></div></div>`;
                if (i % 3 == 1) {
                    plshtml += `</div></div>`
                    document.getElementById("car").innerHTML += plshtml;
                    plshtml = ""
                }
            }
        }



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

// function newplaylist(u, d) {
//     axios.post('/newPlaylist', {
//         playlistname: document.getElementById('plname').value,
//         songnames: newplsongs,
//         songids: newplids,
//         update: u,
//         delete: d
//     }, { withCredentials: true })
//         .then(function (response) {
//         })
//     newplsongs = [];
//     newplids = [];
// }


// function addtolist(sname, id) {
//     newplsongs.push(sname);
//     newplids.push(id);
// }

function showplsongs(plid) {
    var inner="";
    var flag=1;
    document.getElementById("carousel2").remove();
    for(var i in result){
        if(result[i]._id==plid){
            console.log(result[i]);
            inner += `<div id="carousel2"><h4 style="color: white">Songs in ` + result[i].playlistname +`</h4><div id="carouselExampleControls2" class="carousel slide" data-mdb-ride="carousel"><div class="carousel-inner" id="car2">`;
            for(var j=0;j<result[i].songnames.length;j++){
                if(j%3==0){
                    var x="";
                    if (j==0){x="active";}
                    inner +=`<div class="carousel-item `+x+` "><div class="row"><div class="col-sm-3" style="padding-top: 1%"></div>`;
                    flag=1;
                }
                inner += `<div class="col-sm-2" style="padding-top:1%">
                <div class="card">
                <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light"
                onclick="">
                <img src="https://mdbootstrap.com/img/new/standard/nature/184.jpg" class="card-img-top" alt="..." />
                <a>
                <div class="mask d-flex justify-content-center align-items-center"
                style="background-color: rgba(0, 0, 0, 0.45);">
                <button class="btn btn-primary btn-floating bg-white">
                <i class="fa fa-play-circle fa-3x" style="color:#0f64f2"></i>
                </button>
                </div>
                </a>
                </div>
                <div class="card-body">
                <h5 class="card-title">`+ result[i].songnames[j] + `</h5>
                </div></div></div>`;
                if(j%3==2){
                    inner +=`</div></div>`;
                    flag=0;
                }
            }
            if (flag) { inner += `</div></div>`;}
            inner +=`</div>
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
            document.getElementById("container").innerHTML+=inner;
            break;
        }
    }
}