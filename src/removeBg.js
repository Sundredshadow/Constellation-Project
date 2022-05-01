const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

function getImageFromRemoveBg(){
    const inputPath = "https://engineering.unl.edu/images/staff/Kayla-Person.jpg";
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));

    axios({
    method: 'post',
    url: 'https://api.remove.bg/v1.0/removebg',
    data: formData,
    responseType: 'arraybuffer',
    headers: {
        ...formData.getHeaders(),
        'X-Api-Key': 'uZqwe9zhJs5Z4YmpokkR3g5k',
    },
    encoding: null
    })
    .then((response) => {
    if(response.status != 200) return console.error('Error:', response.status, response.statusText);
    fs.writeFileSync("src/img/output.png", response.data);
    })
    .catch((error) => {
        return console.error('Request failed:', error);
    });
}

module.exports={
    getImageFromRemoveBg
};