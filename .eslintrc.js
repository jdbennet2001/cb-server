module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "mocha" : true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType" : "module",
        "ecmaVersion": 2018
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "no-console" : 0,
        "no-mixed-spaces-and-tabs" : 0,
        "no-unused-vars" : 0
    }
};