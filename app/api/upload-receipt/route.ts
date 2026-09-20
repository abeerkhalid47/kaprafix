import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Please select a valid payment screenshot file.' },
        { status: 400 }
      );
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be under 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (cloudinaryConfigured) {
      try {
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'kaprafix-payment-receipts',
              resource_type: 'image',
              transformation: [{ width: 1400, height: 1800, crop: 'limit', quality: 'auto' }],
            },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result as { secure_url: string });
            }
          );
          uploadStream.end(buffer);
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          filename: file.name,
        });
      } catch (cloudErr: any) {
        console.error('[Cloudinary Receipt Upload Error]:', cloudErr);
        // Fallback to base64 data URI if Cloudinary upload errors
        const mimeType = file.type || 'image/jpeg';
        const base64Data = buffer.toString('base64');
        const dataUri = `data:${mimeType};base64,${base64Data}`;
        return NextResponse.json({
          success: true,
          url: dataUri,
          filename: file.name,
          isDataUri: true,
        });
      }
    } else {
      console.warn('[upload-receipt] Cloudinary not configured. Returning data URI fallback.');
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        filename: file.name,
        isDataUri: true,
      });
    }
  } catch (error: any) {
    console.error('Error in /api/upload-receipt:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload payment receipt.' },
      { status: 500 }
    );
  }
}
