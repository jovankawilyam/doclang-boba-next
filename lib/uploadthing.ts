import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  dokumenLelang: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 8 },
    image: { maxFileSize: "8MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.url, file.name);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
