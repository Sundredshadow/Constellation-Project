const saves = [];
const uuid = {};
uuid.ID = 0;// intiallize a starting id// limited by size of obj.

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you were looking for was not found',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

// returns data of a single element or id of a data point in saves
const getDataMeta = (request, response, data) => {
  const newdata = data.replace(/[^0-9]/g, '');// set to only numbers
  if (newdata) {
    const element = saves.find((item) => item.name === newdata);
    if (!element) {
      return notFoundMeta(request, response);
    }
    return respondJSONMeta(request, response, 200);
  }
  return respondJSONMeta(request, response, 404);
};

const getData = (request, response, data) => {
  const newdata = data.replace(/[^0-9]/g, '');// set to only numbers
  if (newdata) {
    const element = saves.find((item) => item.name === newdata);
    if (!element) {
      return notFound(request, response);
    }
    const responseJSON = {
      element,
    };
    return respondJSON(request, response, 200, responseJSON);
  }
  const responseJSON = {
    message: 'Bad Request',
  };
  return respondJSON(request, response, 404, responseJSON);
};

// generates an unique id(essentially just iterates through numbers)
const getID = (request, response) => {
  uuid.ID++;
  const responseJSON = {
    uuid,
  };
  return respondJSON(request, response, 200, responseJSON);
};
// meta
const getIDMeta = (request, response) => respondJSONMeta(request, response, 200);

// gets the total size of save length and returns it
const getSize = (request, response) => {
  const { length } = saves;
  const responseJSON = {
    length,
  };
  return respondJSON(request, response, 200, responseJSON);
};

// meta
const getSizeMeta = (request, response) => respondJSONMeta(request, response, 200);

const addData = (request, response, body) => {
  const responseJSON = {
    message: 'Missing Params',
  };
  if (!body.gravitySpeed || !body.flowSpeed || !body.flowChance || !body.penSize || !body.blocks) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;
  // unique identifier
  let element = saves.find((item) => item.name === uuid.ID);
  if (element) {
    responseCode = 204;
  } else {
    saves.push({});
    element = saves[saves.length - 1];
    element.name = `${uuid.ID}`;
  }
  element.gravitySpeed = body.gravitySpeed;
  element.flowSpeed = body.flowSpeed;
  element.flowChance = body.flowChance;
  element.penSize = body.penSize;
  element.blocks = body.blocks;
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully!';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  getData,
  getDataMeta,
  getID,
  getIDMeta,
  getSize,
  getSizeMeta,
  addData,
  notFound,
  notFoundMeta,
};
