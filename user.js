var JsonDB = require('node-json-db');

// second argument <=> auto save after push || if false we have to call .save()
// thirt argument <=> readable format.
var users_db = new JsonDB('./db/users', true, true);

var users = users_db.getData('/');


// new user
var user = {
    "name": "Nguyen",
    "password": "e10adc3949ba59abbe56e057f20f883e",
    "avatar": "/media/avatars/nguyen-hometime.com.jpg"
};

users_db.push('/nguyen@hometime.com', user, false);

// new playlist user