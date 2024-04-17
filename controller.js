require('dotenv').config();
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const { MongoClient } = require('mongodb');
var mongo = require('mongodb');
const uri = "mongodb+srv://ankith:" + process.env.MONGO_CLUSTER_PASSWORD + "@cluster0.op31g4e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "test";
const ObjectId = require('mongodb').ObjectId;

//init gridfs
let storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
        return {

            bucketName: 'fs',
            //Setting collection name, default name is fs      
            filename: req.body.song_name,
            //Setting file name to original name of file 
            metadata: { artistname: req.body.artist_name }
        }
    }
});

let upload = null;

storage.on('connection', (db) => {
    //Setting up upload for a single file  
    upload = multer({
        storage: storage
    }).single('song');
});

module.exports.getLim = (req, res) => {
    if (req.user) {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
            if (err) {
                console.log(err);
            }
            const db = client.db(dbName);
            db.collection("allplaylists").find({ email: req.user.email, playlistname: "MySongs" }).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send((5 - result[0].songids.length).toString());
                    console.log(result[0].songids.length);
                    client.close();
                }
            });
        });
    }
    else {
        res.redirect('/');
    }
};

module.exports.loadnewSong = (req, res) => {
    if (req.user) {
        res.render('newsong', { email: req.user.email, name: req.user.name });
    }
    else {
        res.redirect('/');
    }

};

module.exports.loadLibrary = (req, res) => {
    if (req.user) {
        res.render('library', { email: req.user.email, name: req.user.name });
    }
    else {
        res.redirect('/');
    }

};

module.exports.loadDash = (req, res) => {
    if (req.user) {
        res.render('dash', { email: req.user.email, name: req.user.name });
    }
    else {
        res.redirect('/');
    }
};

module.exports.loadLogin = (req, res) => {
    res.render('login', {});
};


/*module.exports.loadDash = (req, res) => {
    console.log(req.user);
    res.render('psong', {});
};*/

module.exports.logout = (req, res) => {
    req.logout();
    req.session.destroy(function (err) {
        res.redirect('/');
    });
};



module.exports.uploadFile = (req, res) => {
    if (!req.isAuthenticated()) {
        res.send("GTFO");
        return null;
    }
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            console.log(10);
        }
        else {
            console.log("DOnE?");
            var newsongid = req.file.id.toString();
            MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                if (err) {
                    console.log(err);
                }
                const db = client.db(dbName);
                db.collection("allplaylists").find({ email: req.user.email, playlistname: "MySongs" }).toArray(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var temp1 = result[0].songnames;
                        var temp2 = result[0].songids;
                        var temp3 = result[0].artistnames;
                        temp1.push(req.body.song_name);
                        temp2.push(newsongid);
                        temp3.push(req.body.artist_name);
                        db.collection("allplaylists").updateOne({ email: req.user.email, playlistname: "MySongs" }, { $set: { songnames: temp1, songids: temp2, artistnames: temp3 } }, function (err, res) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("1 document updated");
                            client.close();
                        });
                    }

                });

            });
            res.send(newsongid);
        }
    });
};


module.exports.getFile = (req, res) => {
    //Accepting user input directly is very insecure and should 
    //never be allowed in a production app. Sanitize the input.
    if (!req.isAuthenticated()) {
        res.send("GTFO");
        return null;
    }
    let fileId = req.body.song_id;
    //Connect to the MongoDB client
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

        if (err) {
            console.log(err);
            //'MongoClient Connection error' error: err.errMsg 
        }
        const db = client.db(dbName);
        var gfs = Grid(db, mongo);
        var readstream = gfs.createReadStream({
            _id: fileId
        });
        readstream.on('error', function (err) {
            console.log("An error occured", err);
            throw err;
        }).on('end', function (err) {
            client.close();
        });
        readstream.pipe(res);
    });
};

module.exports.getPlaylists = (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) {
            console.log(err);
        }
        const db = client.db(dbName);
        // finding playlists in db
        query = { email: req.user.email };
        db.collection("allplaylists").find(query).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            res.send(result);
            client.close();
        });
    });
};

module.exports.getSongs = (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) {
            console.log(err);
        }
        const db = client.db(dbName);
        db.collection("fs.files").find({}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            res.send(result);
            client.close();
        });
    });
}
module.exports.getPlaylists = (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) {
            console.log(err);
        }
        const db = client.db(dbName);
        db.collection("allplaylists").find({ email: req.user.email }).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            res.send(result);
            client.close();
        });
    });
}


module.exports.getUploadedSongs = (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) {
            console.log(err);
        }
        const db = client.db(dbName);
        db.collection("allplaylists").find({ email: req.user.email, playlistname: "MySongs" }).toArray(function (err, result) {
            if (err) {
                console.log(err);
            }
            res.send(result);
            client.close();
        });
    });
}

module.exports.loaduploadedsongs = (req, res) => {

    if (req.user) {
        res.render('newsong', { email: req.user.email, name: req.user.name });
    }
    else {
        res.redirect('/');
    }
};

module.exports.addNewPlaylist = (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) {
            console.log(err);
        }
        const db = client.db(dbName);
        if (req.body.update) {
            db.collection("allplaylists").find({ email: req.user.email, _id: ObjectId(req.body.playlistid) }).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                }
                var x = result[0].songnames;
                var y = result[0].songids;
                var z = result[0].artistnames;
                if (req.body.sdel) {
                    var sidind = y.indexOf(req.body.songid.toString());
                    x.splice(sidind, 1);
                    y.splice(sidind, 1);
                    z.splice(sidind, 1);
                }
                else {
                    x.push(req.body.songname);
                    y.push(req.body.songid);
                    z.push(req.body.artistname);
                }
                db.collection("allplaylists").updateOne({ email: req.user.email, _id: ObjectId(req.body.playlistid) }, { $set: { songnames: x, songids: y, artistnames: z } }, function (err, resl) {
                    if (err) {
                        console.log(err);
                    }
                    res.sendStatus(200);
                    console.log("1 document updated");
                    client.close();
                });
            });
        }
        else if (req.body.delete) {
            db.collection("allplaylists").deleteOne({ email: req.user.email, _id: ObjectId(req.body.playlistid) }, function (err, resl) {
                if (err) {
                    console.log(err);
                }
                console.log("1 document deleted");
                res.sendStatus(200);
                client.close();
            });
        }
        else {
            db.collection("allplaylists").insertOne({ email: req.user.email, playlistname: req.body.playlistname, songnames: req.body.songnames, songids: req.body.songids, artistnames: req.body.artistnames }, function (err, resl) {
                if (err) {
                    console.log(err);
                }
                console.log("1 document inserted");
                res.sendStatus(200);
                client.close();
            });
        }
    });
}

module.exports.loadnewpldets = (req, res) => {
    if (req.user) {
        res.render('newpldets', { email: req.user.email, name: req.user.name });
    }
    else {
        res.redirect('/');
    }
};