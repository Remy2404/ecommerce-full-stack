import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  console.log('🌱 Starting database seed...');
  
  // Debug: Check if DATABASE_URL is loaded (safely)
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not defined in .env.local');
    process.exit(1);
  }
  
  const maskedUrl = dbUrl.replace(/:(\/\/[^:]+:)([^@]+)@/, ':$1****@');
  console.log(`📡 Using database: ${maskedUrl.split('@')[1] || 'Unknown'}`);

  // Dynamically import dependencies after dotenv config
  const { db } = await import('../src/lib/db');
  const { 
    users, 
    merchants, 
    categories, 
    products, 
    addresses,
    reviews 
  } = await import('../src/lib/db/schema');
  const { hash } = await import('bcryptjs');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(merchants);
    await db.delete(addresses);
    await db.delete(categories);
    await db.delete(users);

    // Create Categories
    console.log('📁 Creating categories...');
    const categoryData = [
      { name: 'Electronics', slug: 'electronics', icon: '📱', sortOrder: 1 },
      { name: 'Accessories', slug: 'accessories', icon: '⌚', sortOrder: 2 },
      { name: 'Clothing', slug: 'clothing', icon: '👕', sortOrder: 3 },
      { name: 'Home & Living', slug: 'home-living', icon: '🏠', sortOrder: 4 },
      { name: 'Sports & Fitness', slug: 'sports-fitness', icon: '🏃', sortOrder: 5 },
    ];

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create Users (for merchants and reviews)
    console.log('👥 Creating users...');
    const hashedPassword = await hash('password123', 10);
    
    const userData = [
      {
        email: 'merchant1@store.com',
        phone: '+855123456789',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Electronics',
        role: 'merchant' as const,
      },
      {
        email: 'merchant2@store.com',
        phone: '+855123456790',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Fashion',
        role: 'merchant' as const,
      },
      {
        email: 'customer1@example.com',
        phone: '+855123456791',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'customer' as const,
      },
      {
        email: 'customer2@example.com',
        phone: '+855123456792',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Chen',
        role: 'customer' as const,
      },
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create Merchants
    console.log('🏪 Creating merchants...');
    const merchantData = [
      {
        userId: createdUsers[0].id,
        storeName: 'Tech Haven',
        description: 'Premium electronics and gadgets',
        phoneNumber: '+855123456789',
        email: 'support@techhaven.com',
        isVerified: true,
        rating: '4.8',
      },
      {
        userId: createdUsers[1].id,
        storeName: 'Fashion Forward',
        description: 'Trendy clothing and accessories',
        phoneNumber: '+855123456790',
        email: 'support@fashionforward.com',
        isVerified: true,
        rating: '4.9',
      },
    ];

    const createdMerchants = await db.insert(merchants).values(merchantData).returning();
    console.log(`✅ Created ${createdMerchants.length} merchants`);

    // Create Products
    console.log('📦 Creating products...');
    const productData = [
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: 'Premium Wireless Headphones Pro',
        slug: 'premium-wireless-headphones-pro',
        description: 'Experience crystal-clear audio with our flagship wireless headphones. Features active noise cancellation, 40-hour battery life, and premium comfort.',
        price: '299.99',
        comparePrice: '399.99',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        ],
        rating: '4.8',
        reviewCount: 124,
        isFeatured: true,
        soldCount: 450,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[1].id,
        name: 'Minimalist Leather Watch',
        slug: 'minimalist-leather-watch',
        description: 'A timeless design meets modern craftsmanship. Swiss movement, sapphire crystal, and genuine Italian leather strap.',
        price: '189.00',
        comparePrice: null,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
        rating: '4.9',
        reviewCount: 89,
        isFeatured: true,
        soldCount: 320,
      },
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: 'Smart Home Speaker',
        slug: 'smart-home-speaker',
        description: 'Voice-controlled smart speaker with premium 360° audio and smart home integration.',
        price: '149.00',
        comparePrice: '199.00',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80'],
        rating: '4.6',
        reviewCount: 203,
        isFeatured: false,
        soldCount: 580,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[2].id,
        name: 'Organic Cotton T-Shirt',
        slug: 'organic-cotton-tshirt',
        description: 'Sustainably sourced 100% organic cotton. Soft, breathable, and eco-friendly.',
        price: '45.00',
        comparePrice: null,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
        rating: '4.5',
        reviewCount: 67,
        isFeatured: false,
        soldCount: 890,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[1].id,
        name: 'Designer Sunglasses',
        slug: 'designer-sunglasses',
        description: 'UV400 protection with polarized lenses. Titanium frame for ultimate durability and style.',
        price: '275.00',
        comparePrice: '350.00',
        stock: 3,
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'],
        rating: '4.7',
        reviewCount: 45,
        isFeatured: false,
        soldCount: 123,
      },
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: 'Portable Power Bank',
        slug: 'portable-power-bank',
        description: '20000mAh capacity with fast charging support. Charge multiple devices simultaneously.',
        price: '59.99',
        comparePrice: '79.99',
        stock: 100,
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'],
        rating: '4.4',
        reviewCount: 312,
        isFeatured: false,
        soldCount: 1450,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[3].id,
        name: 'Ceramic Coffee Mug Set',
        slug: 'ceramic-coffee-mug-set',
        description: 'Handcrafted ceramic mugs. Set of 4 in earthy tones. Microwave and dishwasher safe.',
        price: '48.00',
        comparePrice: null,
        stock: 30,
        images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'],
        rating: '4.8',
        reviewCount: 156,
        isFeatured: false,
        soldCount: 670,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[4].id,
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'Extra thick 6mm cushioning with non-slip surface. Perfect for yoga, pilates, and workouts.',
        price: '65.00',
        comparePrice: '85.00',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'],
        rating: '4.6',
        reviewCount: 89,
        isFeatured: false,
        soldCount: 340,
      },
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: 'Wireless Gaming Mouse',
        slug: 'wireless-gaming-mouse',
        description: 'Ultra-responsive with customizable RGB lighting. 16000 DPI sensor for precision.',
        price: '79.99',
        comparePrice: '99.99',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'],
        rating: '4.7',
        reviewCount: 234,
        isFeatured: true,
        soldCount: 560,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[2].id,
        name: 'Denim Jacket Classic',
        slug: 'denim-jacket-classic',
        description: 'Timeless denim jacket with a modern fit. Premium quality cotton denim.',
        price: '129.00',
        comparePrice: null,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
        rating: '4.8',
        reviewCount: 98,
        isFeatured: true,
        soldCount: 280,
      },
    ];

    const createdProducts = await db.insert(products).values(productData).returning();
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create Reviews
    console.log('⭐ Creating reviews...');
    const reviewData = [
      {
        userId: createdUsers[2].id,
        productId: createdProducts[0].id,
        orderId: null as any,
        rating: 5,
        comment: 'Absolutely love these headphones! The sound quality is incredible and the noise cancellation works perfectly.',
        isVerifiedPurchase: true,
      },
      {
        userId: createdUsers[3].id,
        productId: createdProducts[0].id,
        orderId: null as any,
        rating: 4,
        comment: 'Great product, battery life is as advertised. Only minor issue is the case could be better.',
        isVerifiedPurchase: true,
      },
      {
        userId: createdUsers[2].id,
        productId: createdProducts[1].id,
        orderId: null as any,
        rating: 5,
        comment: 'Beautiful watch! The leather strap is very comfortable and the design is elegant.',
        isVerifiedPurchase: true,
      },
    ];

    const createdReviews = await db.insert(reviews).values(reviewData).returning();
    console.log(`✅ Created ${createdReviews.length} reviews`);

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${createdCategories.length} categories`);
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdMerchants.length} merchants`);
    console.log(`   - ${createdProducts.length} products`);
    console.log(`   - ${createdReviews.length} reviews`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
