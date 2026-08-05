import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCartItem,
  clearCart as clearCartApi,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cartApi.js";

const CartContext = createContext(null);

const EMPTY_CART = {
  items: [],
  summary: {},
};

const getCachedCart = () => {
  try {
    const cached = JSON.parse(localStorage.getItem("cartCache") || "null");
    return cached?.items ? cached : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

const normalizeCartResponse = (response) => {
  const possibleCart =
    response?.cart || response?.data?.cart || response?.data || response || {};

  const items = Array.isArray(possibleCart?.items)
    ? possibleCart.items
    : Array.isArray(response?.items)
      ? response.items
      : [];

  const summary =
    possibleCart?.summary || response?.summary || response?.data?.summary || {};

  return {
    ...possibleCart,
    items,
    summary,
  };
};

const getUnitPrice = (item) =>
  Number(
    item?.unitPrice ??
    item?.price ??
    item?.selectedPrice ??
    item?.product?.salePrice ??
    item?.product?.price ??
    0
  );

export function CartProvider({ children }) {
  const [cart, setCart] = useState(getCachedCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const applyCart = useCallback((response) => {
    const normalized = normalizeCartResponse(response);
    setCart(normalized);
    localStorage.setItem("cartCache", JSON.stringify(normalized));
    return normalized;
  }, []);

  const resetCart = useCallback(() => {
    setCart(EMPTY_CART);
    setIsCartOpen(false);
    setError("");
    localStorage.removeItem("cartCache");
    localStorage.removeItem("cartItems");
  }, []);

  const refreshCart = useCallback(async ({ silent = false } = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      resetCart();
      return EMPTY_CART;
    }

    if (!silent) setLoading(true);
    setError("");

    try {
      const response = await getCart();
      return applyCart(response);
    } catch (err) {
      setError(err.message || "Unable to load the cart.");
      throw err;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyCart, resetCart]);

  const openCart = useCallback(async () => {
    setIsCartOpen(true);

    if (localStorage.getItem("token")) {
      try {
        await refreshCart({ silent: true });
      } catch {
        // Keep the drawer open and display the cached cart/error state.
      }
    }
  }, [refreshCart]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const addItem = useCallback(
    async ({ productId, selectedSize, quantity = 1 }, options = {}) => {
      const { openDrawer = true } = options;

      if (!localStorage.getItem("token")) {
        const authError = new Error("Please sign in before adding items to the cart.");
        authError.status = 401;
        throw authError;
      }

      setLoading(true);
      setError("");

      try {
        const response = await addCartItem({
          productId,
          selectedSize,
          quantity,
        });

        const responseCart = normalizeCartResponse(response);
        const hasCartItems = Array.isArray(responseCart.items) && responseCart.items.length > 0;

        if (hasCartItems || response?.cart || response?.data?.cart) {
          applyCart(response);
        } else {
          await refreshCart({ silent: true });
        }

        if (openDrawer) setIsCartOpen(true);
        return response;
      } catch (err) {
        setError(err.message || "Unable to add this item to the cart.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyCart, refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!itemId || quantity < 1) return;

      setLoading(true);
      setError("");

      try {
        const response = await updateCartItem(itemId, quantity);

        if (response?.cart || response?.data?.cart) {
          applyCart(response);
        } else {
          await refreshCart({ silent: true });
        }
      } catch (err) {
        setError(err.message || "Unable to update the item quantity.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyCart, refreshCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!itemId) return;

      setLoading(true);
      setError("");

      try {
        const response = await removeCartItem(itemId);

        if (response?.cart || response?.data?.cart) {
          applyCart(response);
        } else {
          await refreshCart({ silent: true });
        }
      } catch (err) {
        setError(err.message || "Unable to remove the cart item.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyCart, refreshCart]
  );

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await clearCartApi();

      if (response?.cart || response?.data?.cart) {
        applyCart(response);
      } else {
        applyCart(EMPTY_CART);
      }
    } catch (err) {
      setError(err.message || "Unable to clear the cart.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refreshCart({ silent: true }).catch(() => { });
    }
  }, [refreshCart]);

  const subtotal = useMemo(() => {
    const backendSubtotal = Number(
      cart?.summary?.subtotal ?? cart?.subtotal ?? cart?.totalPrice
    );

    if (Number.isFinite(backendSubtotal)) return backendSubtotal;

    return cart.items.reduce(
      (sum, item) => sum + getUnitPrice(item) * Number(item?.quantity || 0),
      0
    );
  }, [cart]);

  const itemCount = useMemo(
    () =>
      cart.items.reduce(
        (count, item) => count + Number(item?.quantity || 0),
        0
      ),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      subtotal,
      itemCount,
      loading,
      error,
      isCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      openCart,
      closeCart,
      resetCart,
    }),
    [
      cart,
      subtotal,
      itemCount,
      loading,
      error,
      isCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      openCart,
      closeCart,
      resetCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
