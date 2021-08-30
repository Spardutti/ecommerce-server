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
    Key: Date.now() + file.originalname,
  };

  return s3.upload(uploadParams).promise();
}

exports.uploadFile = uploadFile;

const deleteFileFromS3 = async (Key) => {
  const params = {
    Bucket: "ecommercemockup",
    Key: Key, //if any sub folder-> path/of/the/folder.ext
  };
  try {
    await s3.headObject(params).promise();
    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      return "ERROR in file Deleting : " + JSON.stringify(err);
    }
  } catch (err) {
    return "File not Found ERROR : " + err.code;
  }
};

exports.deleteFileFromS3 = deleteFileFromS3;
