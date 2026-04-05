import {v2 as cloudinary} from 'cloudinary';
//import {CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET,CLOUDINARY_CLOUD_NAME} from "../config";
cloudinary.config({

cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
api_key:process.env.CLOUDINARY_API_KEY,
api_secret:process.env.CLOUDINARY_API_SECRET,
});
export default cloudinary;