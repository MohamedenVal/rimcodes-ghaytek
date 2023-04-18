const expressJwt = require('express-jwt');

let secret = process.env.ACCESS_TOKEN_SECRET;

function authJwt() {
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            {url: /\/uploads(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/services(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/categories(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/messages(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/promotions(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/users(.*)/, method: ['GET', 'OPTIONS']},
            `/`,
            `/demands`,
            { url: /\/demands(.*)/ },
            { url: /\/auth(.*)/ },
            { url: /\/notifs(.*)/ },
            { url: /\/socket.io(.*)/ },
            // `/auth`,
            // `/auth/register`,
            // { url: /(.*)/ }
        ]
    });

    async function isRevoked(req, payload, done) {
        if(!(payload.role === 'Admin')) {
            done(null, true);
        };

        done();
    };
};

function clientsAuth(userId) {
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            
        ]
    });

    async function isRevoked(req, payload, done) {
        if(payload.userId === userId) {
            done(null, true);
        };

        done();
    };
}

module.exports = { authJwt }