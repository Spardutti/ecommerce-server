const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();
const fs = require("fs");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

//UPLOAD FILE TO S3BUCKET

function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

//DOWNLOAD FILE FROM S3BUCKET

function getFile(req, res, next) {
  var params = { Bucket: keys.AWS_BUCKET, Key: req.params.imageId };
  s3.getObject(params, function (err, data) {
    if (err) {
      return res.send({ error: err });
    }
    res.send(data.Body);
  });
}
exports.getFileStream = getFile;
