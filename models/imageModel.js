const fs = require('fs');

exports.encodeImageToBase64 = (imagePath) => {
  const image = fs.readFileSync(imagePath);
  return new Buffer.from(image).toString('base64');
};