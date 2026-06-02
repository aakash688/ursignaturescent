import { Routes, Route } from 'react-router-dom'
import StorefrontLayout from './layouts/StorefrontLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/storefront/Home'
import Products from './pages/storefront/Products'
import ProductDetail from './pages/storefront/ProductDetail'
import TrackOrder from './pages/storefront/TrackOrder'
import Contact from './pages/storefront/Contact'
import Checkout from './pages/storefront/Checkout'
import Placeholder from './pages/storefront/Placeholder'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import ProductNew from './pages/admin/ProductNew'
import ProductEdit from './pages/admin/ProductEdit'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'
import OrderDetail from './pages/admin/OrderDetail'
import Inventory from './pages/admin/Inventory'
import Coupons from './pages/admin/Coupons'
import Settings from './pages/admin/Settings'
import AdminPlaceholder from './pages/admin/AdminPlaceholder'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="collections" element={<Placeholder title="Collections" />} />
        <Route path="collections/:slug" element={<Placeholder title="Collection" />} />
        <Route path="fragrance-finder" element={<Placeholder title="Fragrance Finder" />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="track-order" element={<TrackOrder />} />
        <Route path="order-success" element={<Placeholder title="Order Success" />} />
        <Route path="contact" element={<Contact />} />
        <Route path="about" element={<Placeholder title="About" />} />
        <Route path="faq" element={<Placeholder title="FAQ" />} />
        <Route path="shipping" element={<Placeholder title="Shipping" />} />
        <Route path="returns" element={<Placeholder title="Returns" />} />
        <Route path="login" element={<Placeholder title="Login" />} />
        <Route path="signup" element={<Placeholder title="Signup" />} />
        <Route path="account" element={<Placeholder title="Account" />} />
        <Route path="account/orders" element={<Placeholder title="Orders" />} />
        <Route path="account/profile" element={<Placeholder title="Profile" />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductNew />} />
        <Route path="products/:id" element={<ProductEdit />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="customers" element={<AdminPlaceholder title="Customers" />} />
        <Route path="pos" element={<AdminPlaceholder title="POS" />} />
        <Route path="analytics" element={<AdminPlaceholder title="Analytics" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="contacts" element={<AdminPlaceholder title="Contacts" />} />
        <Route path="reviews" element={<AdminPlaceholder title="Reviews" />} />
        <Route path="newsletter" element={<AdminPlaceholder title="Newsletter" />} />
      </Route>
    </Routes>
  )
}
