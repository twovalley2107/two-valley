"use server";

import { v2 as cloudinary } from "cloudinary";
import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { ActionResult } from "@/types";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

/**
 * Server Action: Generate a signed upload token for Cloudinary client upload.
 * Strictly protected by assertAdminSession().
 */
export async function generateCloudinarySignatureAction(): Promise<ActionResult<CloudinarySignatureResult>> {
  try {
    await assertAdminSession();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: "Cloudinary configuration is missing on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
      };
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "two-valley/products";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    return {
      success: true,
      data: {
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unauthorized: Admin access required for image upload.",
    };
  }
}

/**
 * Server Action: Upload image file (Data URI) directly to Cloudinary from server.
 * Protected by assertAdminSession().
 */
export async function uploadProductImageToCloudinaryAction(
  fileDataUri: string,
  fileName?: string
): Promise<ActionResult<{ url: string; publicId: string }>> {
  try {
    await assertAdminSession();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false,
        error: "Cloudinary credentials missing on server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
      };
    }

    const uploadResult = await cloudinary.uploader.upload(fileDataUri, {
      folder: "two-valley/products",
      resource_type: "auto",
      public_id: fileName ? `prod_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, "_")}` : undefined,
    });

    return {
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to upload image to Cloudinary.",
    };
  }
}
