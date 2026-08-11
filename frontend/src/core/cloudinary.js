import { Cloudinary } from "@cloudinary/url-gen";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const cld = cloudName
  ? new Cloudinary({ cloud: { cloudName }, url: { secure: true } })
  : null;
