import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// 配置 uploadthing 后端地址
export const UploadButton = generateUploadButton({
  url: "http://localhost:3001/api/uploadthing",
});

export const UploadDropzone = generateUploadDropzone({
  url: "http://localhost:3001/api/uploadthing",
});
