const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const getImageFromRemoveBg = (request, resp, data) => {
  const formData = new FormData();
  formData.append('size', 'auto');
  const link = data.substring(5);
  formData.append('image_url', link);

  axios({
    method: 'post',
    url: 'https://api.remove.bg/v1.0/removebg',
    data: formData,
    responseType: 'arraybuffer',
    headers: {
      ...formData.getHeaders(),
      'X-Api-Key': '3FEtwDJvzdPsP12T6vA2FMtk',
    },
    encoding: null,
  })
    .then((response) => {
      if (response.status !== 200) return console.error('Error:', response.status, response.statusText);
      fs.writeFileSync('src/img/output.png', response.data);
      return console.dir('Success:', response.status);
    })
    .catch((error) => console.error('Request failed:', error));
};

module.exports = {
  getImageFromRemoveBg,
};
