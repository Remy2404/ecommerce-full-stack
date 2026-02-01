'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { useAuth } from './auth-context';
import * as wishlistService from '@/services/wishlist.service';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

const initialState: WishlistState = {
  items: [],
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      if (state.items.find((item) => item.productId === action.payload.productId)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.productId !== action.payload) };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
  isHydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load wishlist (API or LocalStorage)
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated) {
        try {
          const products = await wishlistService.getWishlist();
          const items: WishlistItem[] = products.map(p => ({
            productId: p.id,
            name: p.name,
            price: p.basePrice,
            image: p.images[0] || '/placeholder.png',
            stock: p.stock
          }));
          dispatch({ type: 'SET_ITEMS', payload: items });
        } catch (error) {
          console.error('Failed to load wishlist from server', error);
        }
      } else {
        // Guest: Load from localStorage
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          try {
            dispatch({ type: 'SET_ITEMS', payload: JSON.parse(saved) });
          } catch (e) {
            console.error('Failed to parse wishlist', e);
          }
        }
      }
      setIsHydrated(true);
    };

    loadWishlist();
  }, [isAuthenticated]);

  // Sync to localStorage ONLY for guests
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items, isHydrated, isAuthenticated]);

  const addItem = async (item: WishlistItem) => {
    // Optimistic update
    dispatch({ type: 'ADD_ITEM', payload: item });

    if (isAuthenticated) {
      try {
        await wishlistService.addToWishlist(item.productId);
        console.log(`Added ${item.name} to server wishlist`);
      } catch (error) {
        console.error('Failed to add to server wishlist', error);
        // Revert optimistic update on error
        dispatch({ type: 'REMOVE_ITEM', payload: item.productId });
      }
    }
  };

  const removeItem = async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    if (isAuthenticated) {
      try {
        await wishlistService.removeFromWishlist(productId);
        console.log(`Removed ${productId} from server wishlist`);
      } catch (error) {
        console.error('Failed to remove from server wishlist', error);
      }
    }
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
  };

  const isInWishlist = (productId: string) => state.items.some((item) => item.productId === productId);
  
  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.productId)) {
      await removeItem(item.productId);
    } else {
      await addItem(item);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        itemCount: state.items.length,
        isHydrated,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
