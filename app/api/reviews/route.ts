import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/lib/models/Review';

// Configure Cloudinary only if credentials are present
const cloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Static seed data — 8 reviews so pagination is clearly visible (page 1=5, page 2=3)
const SEED_REVIEWS = [
  {
    name: 'Ali Khan',
    location: 'Lahore',
    rating: 5,
    text: 'Quality expectation se bhi achi hai! Bilkul waisi kaam ki jaise claim kiya tha. Repeat order karunga zaroor.',
    imageUrls: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop'],
    label: 'Perfect Trousers Hem',
    initials: 'AK',
    status: 'published' as const,
  },
  {
    name: 'Usman Raza',
    location: 'Karachi',
    rating: 5,
    text: 'Bahut acha product hai. Meri pants ka hem bilkul perfect ho gaya. Kisi ko bhi nahi pata ke tape use ki hai. Sab ko recommend karunga.',
    imageUrls: [],
    label: 'Invisible Alteration',
    initials: 'UR',
    status: 'published' as const,
  },
  {
    name: 'Ayesha Malik',
    location: 'Islamabad',
    rating: 5,
    text: 'Fast delivery aur packaging bhi solid thi. Product ne bilkul kaam kiya. Meri bachi ke school uniform ka hem perfect ho gaya 5 minutes mein.',
    imageUrls: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'],
    label: 'Quick Clothing Fix',
    initials: 'AM',
    status: 'published' as const,
  },
  {
    name: 'Sana Mirza',
    location: 'Multan',
    rating: 5,
    text: 'Pehle trust nahi tha online products pe, but is ne sach mein kaam kiya! Mere curtains ka hem bhi isi se kiya. Zabardast!',
    imageUrls: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop'],
    label: 'Perfect Curtains Hem',
    initials: 'SM',
    status: 'published' as const,
  },
  {
    name: 'Hamza Tariq',
    location: 'Faisalabad',
    rating: 5,
    text: 'Mere shalwar qameez ka hem 2 minute mein ho gaya. Bohot zabardast product hai. Pura paisa wasool hai. Zaroor try karein!',
    imageUrls: [],
    label: 'Shalwar Qameez Hem',
    initials: 'HT',
    status: 'published' as const,
  },
  {
    name: 'Fatima Noor',
    location: 'Rawalpindi',
    rating: 5,
    text: 'Mujhe darzi pe bill zyada lagta tha, ab ghar pe hi sab ho jata hai. Is tape ne zindagi aasan kar di. Highly recommend!',
    imageUrls: [],
    label: 'Easy Home Fix',
    initials: 'FN',
    status: 'published' as const,
  },
  {
    name: 'Bilal Ahmed',
    location: 'Peshawar',
    rating: 4,
    text: 'Acha product hai, thoda time lagta hai adjust karne mein lekin kaam bohot acha karta hai. Delivery bhi fast thi.',
    imageUrls: [],
    label: 'Trouser Alteration',
    initials: 'BA',
    status: 'published' as const,
  },
  {
    name: 'Zainab Sheikh',
    location: 'Sialkot',
    rating: 5,
    text: 'Mere abba ke shalwar ka hem barha karna tha, darzi ne mana kar diya tha. KapraFix ne minute mein kar diya. Bohot khush hai!',
    imageUrls: [],
    label: 'Perfect Hem Result',
    initials: 'ZS',
    status: 'published' as const,
  },
];


// ── GET /api/reviews ──────────────────────────────────────────────────────────
// Query params: ?page=1&limit=5
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Seed if DB has fewer than 8 reviews (handles first run AND existing 4-seed DBs)
    const count = await Review.countDocuments();
    if (count < 8) {
      await Review.deleteMany({}); // clear old seeds to avoid duplicates
      await Review.insertMany(SEED_REVIEWS);
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '5', 10));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ status: 'published' }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('[reviews GET]', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Accepts multipart/form-data
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await request.formData();

    const name = (formData.get('name') as string)?.trim();
    const location = (formData.get('location') as string)?.trim() ?? '';
    const rating = parseInt(formData.get('rating') as string, 10) || 5;
    const text = (formData.get('text') as string)?.trim();
    const label = (formData.get('label') as string)?.trim() ?? '';

    // Basic validation
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Upload images to Cloudinary (only if credentials are configured)
    const imageUrls: string[] = [];

    if (cloudinaryConfigured) {
      const imageFiles = formData.getAll('images') as File[];
      const validImages = imageFiles
        .filter((f) => f instanceof File && f.size > 0)
        .slice(0, 3);

      for (const file of validImages) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'kaprafix-reviews',
              resource_type: 'image',
              transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
            },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result as { secure_url: string });
            }
          );
          uploadStream.end(buffer);
        });

        imageUrls.push(uploadResult.secure_url);
      }
    } else {
      console.warn('[reviews POST] Cloudinary not configured — skipping image upload');
    }

    // Derive initials
    const parts = name.split(' ');
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

    const review = await Review.create({
      name,
      location,
      rating,
      text,
      imageUrls,
      label,
      initials,
      status: 'published',
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('[reviews POST]', error);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
