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
    reviews,
    orders,
    orderItems,
    payments,
    deliveries,
    carts,
    cartItems,
    productVariants,
    wishlists,
    notifications,
    wingPoints,
    wingPointsTransactions,
    promotions,
    promotionUsage
  } = await import('../src/lib/db/schema');
  const { hash } = await import('bcryptjs');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    // Delete in order of dependencies (child to parent)
    await db.delete(promotionUsage);
    await db.delete(promotions);
    await db.delete(wingPointsTransactions);
    await db.delete(wingPoints);
    await db.delete(notifications);
    await db.delete(wishlists);
    await db.delete(reviews);
    await db.delete(orderItems);
    await db.delete(payments);
    await db.delete(deliveries);
    await db.delete(orders);
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(merchants);
    await db.delete(addresses);
    await db.delete(categories);
    await db.delete(users);

    // Create Categories
    console.log('📁 Creating categories...');
    const categoryData = [
      { 
        name: 'Electronics', 
        slug: 'electronics', 
        icon: 'Smartphone', 
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
        sortOrder: 1 
      },
      { 
        name: 'Accessories', 
        slug: 'accessories', 
        icon: 'Watch', 
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        sortOrder: 2 
      },
      { 
        name: 'Clothing', 
        slug: 'clothing', 
        icon: 'Shirt', 
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        sortOrder: 3 
      },
      { 
        name: 'Home & Living', 
        slug: 'home-living', 
        icon: 'House', 
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
        sortOrder: 4 
      },
      { 
        name: 'Sports & Fitness', 
        slug: 'sports-fitness', 
        icon: 'Activity', 
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        sortOrder: 5 
      },
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
        isFeatured: true,
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
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: 'Bluetooth Portable Speaker',
        slug: 'bluetooth-portable-speaker',
        description: 'Waterproof wireless speaker with 360° sound and 12-hour battery life. Perfect for outdoor adventures.',
        price: '89.99',
        comparePrice: '119.99',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
        rating: '4.5',
        reviewCount: 178,
        isFeatured: true,
        soldCount: 420,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[1].id,
        name: 'Genuine Leather Wallet',
        slug: 'genuine-leather-wallet',
        description: 'Handcrafted genuine leather wallet with RFID protection and multiple card slots.',
        price: '65.00',
        comparePrice: null,
        stock: 25,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
        rating: '4.7',
        reviewCount: 134,
        isFeatured: false,
        soldCount: 290,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[2].id,
        name: 'Cotton Hoodie Premium',
        slug: 'cotton-hoodie-premium',
        description: 'Ultra-soft 100% cotton hoodie with kangaroo pocket and ribbed cuffs. Perfect for casual wear.',
        price: '75.00',
        comparePrice: '95.00',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
        rating: '4.6',
        reviewCount: 87,
        isFeatured: false,
        soldCount: 380,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[3].id,
        name: 'Faux Fur Throw Blanket',
        slug: 'faux-fur-throw-blanket',
        description: 'Luxuriously soft faux fur throw blanket. Machine washable and perfect for cozy evenings.',
        price: '55.00',
        comparePrice: null,
        stock: 18,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
        rating: '4.9',
        reviewCount: 76,
        isFeatured: false,
        soldCount: 195,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[4].id,
        name: 'Adjustable Dumbbells Set',
        slug: 'adjustable-dumbbells-set',
        description: '5-50lb adjustable dumbbells with quick-change mechanism. Space-saving design for home workouts.',
        price: '199.99',
        comparePrice: '249.99',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
        rating: '4.8',
        reviewCount: 145,
        isFeatured: true,
        soldCount: 167,
      },
      {
        merchantId: createdMerchants[0].id,
        categoryId: createdCategories[0].id,
        name: '10-inch Android Tablet',
        slug: '10-inch-android-tablet',
        description: 'High-performance tablet with 128GB storage, 8MP camera, and all-day battery life.',
        price: '249.99',
        comparePrice: '299.99',
        stock: 22,
        images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'],
        rating: '4.4',
        reviewCount: 98,
        isFeatured: false,
        soldCount: 310,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[1].id,
        name: 'Laptop Backpack Professional',
        slug: 'laptop-backpack-professional',
        description: 'Water-resistant laptop backpack with dedicated compartments and ergonomic design.',
        price: '89.99',
        comparePrice: null,
        stock: 28,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
        rating: '4.6',
        reviewCount: 203,
        isFeatured: true,
        soldCount: 445,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[2].id,
        name: 'Running Sneakers Lightweight',
        slug: 'running-sneakers-lightweight',
        description: 'Breathable mesh running shoes with cushioning and responsive sole. Perfect for daily runs.',
        price: '119.99',
        comparePrice: '149.99',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
        rating: '4.7',
        reviewCount: 167,
        isFeatured: true,
        soldCount: 520,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[3].id,
        name: 'Abstract Wall Art Canvas',
        slug: 'abstract-wall-art-canvas',
        description: 'Modern abstract canvas art print. 24x36 inches, ready to hang with wooden frame.',
        price: '79.99',
        comparePrice: null,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
        rating: '4.5',
        reviewCount: 62,
        isFeatured: false,
        soldCount: 134,
      },
      {
        merchantId: createdMerchants[1].id,
        categoryId: createdCategories[4].id,
        name: 'Resistance Bands Set',
        slug: 'resistance-bands-set',
        description: '5-piece resistance band set with varying resistance levels. Includes door anchor and carrying case.',
        price: '34.99',
        comparePrice: '49.99',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80'],
        rating: '4.6',
        reviewCount: 89,
        isFeatured: false,
        soldCount: 278,
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
