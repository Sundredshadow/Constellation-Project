const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const scriptHandler = require('./scriptResponses.js');
const removeHandler = require('./removeBg.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const handleQueryData = (request, response) => {
  const body = [];
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    if (request.method === 'POST') { // post
      jsonHandler.addData(request, response, bodyParams);
    }
  });
};

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/css/default-styles.css': htmlHandler.getCSS,
    '/css/fonts/BarlowSemiCondensed-ThinItalic.ttf': htmlHandler.getFont,
    '/src/img/output.png': htmlHandler.getPNG,
    '/src/index': scriptHandler.getScript,
    '/src/loader': scriptHandler.getScript,
    '/src/edsLIB': scriptHandler.getScript,
    '/src/flocking': scriptHandler.getScript,
    '/src/removeBg' : removeHandler.getImageFromRemoveBg,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    notFound: jsonHandler.notFoundMeta,
  },
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  console.dir(parsedUrl.pathname);
  console.dir(request.method);

  if (request.method === 'POST') {
    handleQueryData(request, response);// true is post request
  } else if (parsedUrl.query) { // running GET based on id parameter
    urlStruct.GET['/loadmap'](request, response, parsedUrl.query);
  } else if (urlStruct[request.method][parsedUrl.pathname]) { // handle get
    urlStruct[request.method][parsedUrl.pathname](request, response, parsedUrl);
  } else {
    urlStruct[request.method].notFound(request, response);
  }
};
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1 ${port}`);
