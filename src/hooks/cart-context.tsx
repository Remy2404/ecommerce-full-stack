'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';

// Cart Item Type
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
  maxStock: number;
}

// Cart State
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

// Cart Actions
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => 
          item.productId === action.payload.productId && 
          item.variantId === action.payload.variantId
      );
      
      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingIndex];
        const newQuantity = Math.min(
          existingItem.quantity + action.payload.quantity,
          existingItem.maxStock
        );
        updatedItems[existingIndex] = { ...existingItem, quantity: newQuantity };
        return { ...state, items: updatedItems, isOpen: true };
      }
      
      return { ...state, items: [...state.items, action.payload], isOpen: true };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, Math.min(action.payload.quantity, item.maxStock)) }
          : item
      );
      return { ...state, items: updatedItems };
    }
    
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    
    case 'CLEAR_CART':
      return { ...state, items: [], isOpen: false };
    
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

// Context Type
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider Component
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Calculate derived values
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'SET_ITEMS', payload: items });
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue) {
        try {
          dispatch({ type: 'SET_ITEMS', payload: JSON.parse(e.newValue) });
        } catch (err) {
          console.error('Failed to sync cart across tabs', err);
        }
      } else if (e.key === 'cart' && !e.newValue) {
        dispatch({ type: 'CLEAR_CART' });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Actions
  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.productId}-${item.variantId || 'default'}-${Date.now()}`;
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        isLoading: state.isLoading,
        isHydrated,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
