const controller = require('./controller');

module.exports.paths = app => {
    app.get('/', controller.loadLogin);
    app.get('/logout', controller.logout);
    app.get('/dashboard', controller.loadDash);
    app.get('/newSong',controller.loadnewSong);
    app.get('/library',controller.loadLibrary);
    app.get('/newpldets',controller.loadnewpldets)
    
    app.get('/getPlaylists',controller.getPlaylists);
    app.get('/getLim', controller.getLim);
    app.get('/getSongs', controller.getSongs);
    app.get('/getPlaylists', controller.getPlaylists);
    app.get('/getUploadedSongs', controller.getUploadedSongs);

    app.post('/uploadSong', controller.uploadFile);
    app.post('/getSongData', controller.getFile);
    app.post('/myuploadedsongs',controller.loaduploadedsongs);
    app.post('/newPlaylist',controller.addNewPlaylist);


}
