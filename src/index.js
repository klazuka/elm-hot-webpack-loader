const {inject} = require('elm-hot');

module.exports = function (content, map, meta) {
    return inject(content);
};