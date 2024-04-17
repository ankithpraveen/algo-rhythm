
var lim = 0;
function getlim() {
    axios.get('/getLim', { withCredentials: true }).then((response) => {  lim = parseInt(response.data,10); });
}


function upload() {
    if (lim>0) {
        var formData = new FormData();
        var song = document.querySelector('#file1');
        var extension = (song.files[0].name).substring((song.files[0].name).lastIndexOf('.') + 1);
        if (!((document.getElementById('s_name').value).includes("'"))){
            if (extension == "mp3" || extension == "wav" || extension == "m4a") {
                if (song.files[0].size / 1048576 < 10) {
                    formData.append("song_name", document.getElementById('s_name').value);
                    formData.append("artist_name", document.getElementById('a_name').value);
                    formData.append("song", song.files[0]);
                    axios.post('/uploadSong', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            withCredentials: true
                        }
                    })
                        .then((response) => {
                            alert('Upload success boss');
                            console.log(response);
                        }, (error) => {
                            console.log(error);
                        });
    
    
                }
                else {
                    alert("too big");
    
                }
            }
            else {
                alert("Only mp3, m4a or wav files are supported");
            }
        }
        else{
            alert("There cannot be a ' in the song name")
        }
    }
    else{
        alert("Wait for limits to load / Song upload limit reached");
    }
}
