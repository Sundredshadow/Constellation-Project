const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../index.html`);
const css = fs.readFileSync(`${__dirname}/../css/default-styles.css`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getPNG = (request, response, parsedUrl) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(fs.readFileSync(`${__dirname}/..${parsedUrl.pathname}`));
  response.end();
};

const getFont = (request, response, parsedUrl) => {
  response.writeHead(200, { 'Content-Type': 'font/ttf' });
  response.write(fs.readFileSync(`${__dirname}/..${parsedUrl.pathname}`));
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getPNG,
  getFont,
};
