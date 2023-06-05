require('dotenv').config(); // gets all environment variables from .env file
const jwt = require('jsonwebtoken'); // import the module jsonwebtoken which give the ability to sign, verify, decode and etc jwt tokens

// function input is user id, username, count and user type
const createAuthTokens = (user_id, username, count, user_type) => {
    const accessToken = jwt.sign({ // sign a jwt token with the keys and the values below
        user_id: user_id, // key = user_id, value = user_id
        username: username // key = username, value = username
    }, process.env.ACCESS_TOKEN_SECRET, { // secret key that by signing the token with it, the token will be verifiable using this secret key to verify the token
        expiresIn: "15m"
    }); // Token is valid for 15 minutes 
    const refreshToken = jwt.sign({ // sign a jwt token with the keys and the values below
        user_id: user_id, // key = user_id, value = user_id
        count: count, // key = count, value = count
        user_type: user_type // key = user_type, value = user_type
    }, process.env.REFRESH_TOKEN_SECRET, { // secret key that by signing the token with it, the token will be verifiable using this secret key to verify the token
        expiresIn: "7d"
    }); // Token is valid for 7 days
    return {refreshToken, accessToken}; // return the refresh and the access tokens
}

// function input is user id and email
const createResetToken = (user_id, email) => {
    const reset_password_token = jwt.sign({ // sign a jwt token with the keys and the values below
        user_id: user_id, // key = user_id, value = user_id
        email: email // key = email, value = email
    }, process.env.RESET_PASSWORD_TOKEN_SECRET, { // secret key that by signing the token with it, the token will be verifiable using this secret key to verify the token
        expiresIn: "15m"
    }); // Token is valid for 15 minutes
    return reset_password_token; // return the reset password token
}

// function input is email, username and password
const createActivateAccountToken = (email, username, password) => {
    const activate_account_token = jwt.sign({ // sign a jwt token with the keys and the values below
        email: email, // key = email, value = email
        username: username, // key = username, value = username
        password: password // key = password, value = password
    }, process.env.ACTIVATE_ACCOUNT_TOKEN_SECRET, { // secret key that by signing the token with it, the token will be verifiable using this secret key to verify the token
        expiresIn: "15m"
    }); // Token is valid for 15 minutes
    return activate_account_token; // return the activate account token
}
module.exports = { createAuthTokens: createAuthTokens, createResetToken: createResetToken, createActivateAccountToken: createActivateAccountToken }; // make it possible to import this module and use the functions that are listed
