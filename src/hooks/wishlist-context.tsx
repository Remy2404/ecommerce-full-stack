'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';

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
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
  isHydrated: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlist' && e.newValue) {
        try {
          dispatch({ type: 'SET_ITEMS', payload: JSON.parse(e.newValue) });
        } catch (err) {
          console.error('Failed to sync wishlist across tabs', err);
        }
      } else if (e.key === 'wishlist' && !e.newValue) {
        dispatch({ type: 'CLEAR_WISHLIST' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = (item: WishlistItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const isInWishlist = (productId: string) => state.items.some((item) => item.productId === productId);
  const clearWishlist = () => dispatch({ type: 'CLEAR_WISHLIST' });
  
  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.productId)) {
      removeItem(item.productId);
    } else {
      addItem(item);
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
