const fs = require('fs'); // pull in the file system module

const getScript = (request, response, parsedUrl) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(fs.readFileSync(`${__dirname}/..${`${parsedUrl.pathname}.js`}`));
  response.end();
};

module.exports = {
  getScript,
};
