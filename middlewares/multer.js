import multer from "multer";
const upload = multer({ dest: "uploads/" });

//user profile-picture middleware
const profilePicture = upload.single("profilePics");

//product images middleware
const postMedia = upload.array("media", 15);

export { profilePicture, postMedia};
