import { Router, type IRouter } from "express";
import upload from "../middlewares/upload";
import cloudinary from "../lib/cloudinary";

const router: IRouter = Router();

router.post(
  "/upload-image",
  upload.single("image"),
  async (req: any, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image uploaded" });
        return;
      }

      const base64 = req.file.buffer.toString("base64");

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64}`,
        {
          folder: "scms-complaints",
        }
      );

      res.status(200).json({
        imageUrl: result.secure_url,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Failed to upload image",
      });
    }
  }
);

export default router;
