const micro = require('micro');
const handlers = require('./index.js');
micro(handlers).listen(process.env.PORT || 80);
