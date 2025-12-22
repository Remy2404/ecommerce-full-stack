import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { carts, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth.config';

// Get user's cart
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      // Create new cart
      const [newCart] = await db.insert(carts)
        .values({ userId: session.user.id })
        .returning();
      
      cart = { ...newCart, items: [] };
    }

    // Format cart items
    const formattedItems = cart.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product?.name || '',
      price: parseFloat(item.price),
      quantity: item.quantity,
      image: (item.product?.images as string[])?.[0] || '',
      maxStock: item.variant?.stock || item.product?.stock || 0,
      variantName: item.variant?.name,
    })) || [];

    const subtotal = formattedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return NextResponse.json({
      id: cart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, variantId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product
    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.isActive, true)),
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get variant if specified
    let variant = null;
    if (variantId) {
      variant = await db.query.productVariants.findFirst({
        where: and(
          eq(productVariants.id, variantId),
          eq(productVariants.isActive, true)
        ),
      });
    }

    // Check stock
    const availableStock = variant ? variant.stock : product.stock;
    if (quantity > availableStock) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
    });

    if (!cart) {
      const [newCart] = await db.insert(carts)
        .values({ userId: session.user.id })
        .returning();
      cart = newCart;
    }

    // Check if item already in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId),
        variantId ? eq(cartItems.variantId, variantId) : undefined
      ),
    });

    const price = variant ? parseFloat(variant.price) : parseFloat(product.price);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }

      await db.update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Add new item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        price: price.toString(),
      });
    }

    // Update cart timestamp
    await db.update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      );
    }

    // Get cart item
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!item || item.cart?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      // Remove item
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      // Check stock
      const availableStock = item.variant?.stock || item.product?.stock || 0;
      if (quantity > availableStock) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }

      await db.update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, itemId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Get cart item
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
      with: {
        cart: true,
      },
    });

    if (!item || item.cart?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
