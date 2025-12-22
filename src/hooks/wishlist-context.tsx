'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface WishlistItem {
  id: string;
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
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: WishlistItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const isInWishlist = (productId: string) => state.items.some((item) => item.productId === productId);
  const clearWishlist = () => dispatch({ type: 'CLEAR_WISHLIST' });

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        itemCount: state.items.length,
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
