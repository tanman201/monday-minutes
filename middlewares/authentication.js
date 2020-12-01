const jwt = require('jsonwebtoken');
const User = require("../models/user");

var middleware = {};

middleware.authenticate = async function(req, res, next) {
    // Grab session token from header
    let sessionToken = req.headers.authorization;

    // Decode session token to find user details
    const { exp, dat } = jwt.verify(
        sessionToken, 
        process.env.CLIENT_SECRET
    );
    let accountId = dat.account_id;
    let userId = dat.user_id;

    // Check if user exists and make one if the user doesn't
    User.findOne({mondayUserId: userId}, function(err, user){
        if(err){
            // TODO: HANDLE ERROR
            console.log("TODO: HANDLE ERROR");
        } else{
            if(!user){
                var newUser = {mondayUserId: userId};
                User.create(newUser, function(err, user){
                    if(err){
                        // TODO: HANDLE ERROR
                        console.log("TODO: HANDLE ERROR");
                    }else{
                        req.session = {user: user};
                        next();
                    }
                });
            }else{
                req.session = {user: user};
                next();
            }
        }
    });
}

module.exports = middleware;