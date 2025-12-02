export const bn = {
  // Common
  home: 'হোম',
  shop: 'শপ',
  categories: 'ক্যাটাগরি',
  cart: 'কার্ট',
  checkout: 'চেকআউট',
  login: 'লগইন',
  logout: 'লগআউট',
  register: 'রেজিস্টার',
  search: 'খুঁজুন',
  searchProducts: 'পণ্য খুঁজুন',
  account: 'অ্যাকাউন্ট',

  // Product
  products: 'পণ্যসমূহ',
  product: 'পণ্য',
  addToCart: 'কার্টে যোগ করুন',
  buyNow: 'এখনই কিনুন',
  price: 'মূল্য',
  stock: 'স্টক',
  inStock: 'স্টকে আছে',
  outOfStock: 'স্টক শেষ',
  description: 'বিবরণ',

  // Cart
  yourCart: 'আপনার কার্ট',
  emptyCart: 'কার্ট খালি',
  quantity: 'পরিমাণ',
  total: 'মোট',
  subtotal: 'সাবটোটাল',
  discount: 'ছাড়',
  proceedToCheckout: 'চেকআউটে যান',

  // Checkout
  shippingDetails: 'ডেলিভারি তথ্য',
  name: 'নাম',
  phone: 'ফোন',
  address: 'ঠিকানা',
  paymentMethod: 'পেমেন্ট পদ্ধতি',
  cod: 'ক্যাশ অন ডেলিভারি',
  bkash: 'বিকাশ',
  bkashNumber: 'বিকাশ নম্বর',
  transactionId: 'ট্রানজেকশন আইডি',
  placeOrder: 'অর্ডার করুন',
  couponCode: 'কুপন কোড',
  applyCoupon: 'কুপন প্রয়োগ করুন',

  // Orders
  orders: 'অর্ডার',
  orderNumber: 'অর্ডার নম্বর',
  orderDate: 'অর্ডার তারিখ',
  orderStatus: 'অর্ডার স্ট্যাটাস',
  pending: 'পেন্ডিং',
  confirmed: 'নিশ্চিত',
  processing: 'প্রসেসিং',
  shipped: 'শিপড',
  delivered: 'ডেলিভারড',
  cancelled: 'বাতিল',

  // Admin
  admin: 'অ্যাডমিন',
  dashboard: 'ড্যাশবোর্ড',
  manageCategories: 'ক্যাটাগরি ম্যানেজ',
  manageProducts: 'পণ্য ম্যানেজ',
  manageOrders: 'অর্ডার ম্যানেজ',
  manageCoupons: 'কুপন ম্যানেজ',
  addNew: 'নতুন যোগ করুন',
  edit: 'সম্পাদনা',
  delete: 'মুছুন',
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',

  // Form
  required: 'আবশ্যক',
  nameRequired: 'নাম আবশ্যক',
  phoneRequired: 'ফোন নম্বর আবশ্যক',
  addressRequired: 'ঠিকানা আবশ্যক',
  invalidPhone: 'সঠিক ফোন নম্বর দিন',
  bkashRequired: 'বিকাশ নম্বর আবশ্যক',
  transactionRequired: 'ট্রানজেকশন আইডি আবশ্যক',
  guestCheckout: 'অতিথি চেকআউট',
  trackOrder: 'অর্ডার ট্র্যাক করুন',
  trackOrderByPhone: 'ফোন নম্বর দিয়ে অর্ডার খুঁজুন',
  enterPhone: 'ফোন নম্বর লিখুন',
  findOrder: 'অর্ডার খুঁজুন',

  // Messages
  addedToCart: 'কার্টে যোগ হয়েছে',
  orderPlaced: 'অর্ডার সফল হয়েছে',
  error: 'সমস্যা হয়েছে',
}

export type BnKeys = keyof typeof bn
