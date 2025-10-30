import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Components
import Header from './components/layout/Header';
import InternalHeader from './components/layout/InternalHeader';
import Footer from './components/layout/Footer';
// import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import NewInquiry from './pages/inquiry/NewInquiry';
import InquiryList from './pages/inquiry/InquiryList';
import InquiryDetail from './pages/inquiry/InquiryDetail';
import OrderList from './pages/order/OrderList';
import OrderDetail from './pages/order/OrderDetail';
import OrderTracking from './pages/order/OrderTracking';
import PaymentPage from './pages/order/PaymentPage';
import BackOfficeDashboard from './pages/BackOfficeDashboard';
import BackOfficeMaterialManagement from './pages/BackOfficeMaterialManagement';
import ComponentManagerPage from './pages/ComponentManagerPage';
import ComponentManagerDetail from './pages/ComponentManagerDetail';
// import ComponentManagerLanding from './pages/ComponentManagerLanding';
import QuotationResponse from './pages/inquiry/QuotationResponse';
import QuotationPayment from './pages/payment/QuotationPayment';
import OrderManagement from './pages/order/OrderManagement';
import ServiceContact from './pages/ServiceContact';
import About from './pages/About';
import Services from './pages/Services';
import Profile from './pages/Profile';
import Parts from './pages/Parts';
import Tools from './pages/Tools';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

// Layout Component
const Layout = ({ children, isInternal = false }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && (isInternal ? <InternalHeader /> : <Header />)}
      <main className={isAuthPage ? '' : 'pt-2'}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/about" element={
              <Layout>
                <About />
              </Layout>
            } />
            <Route path="/services" element={
              <Layout>
                <Services />
              </Layout>
            } />
            <Route path="/parts" element={
              <Layout>
                <Parts />
              </Layout>
            } />
            <Route path="/tools" element={
              <Layout>
                <Tools />
              </Layout>
            } />
            <Route path="/contact" element={
              <Layout>
                <ServiceContact />
              </Layout>
            } />
            
            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Layout>
                  <Login />
                </Layout>
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Layout>
                  <SignUp />
                </Layout>
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Inquiry Routes */}
            <Route path="/inquiry/new" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <NewInquiry />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inquiries" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <InquiryList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inquiry/:id" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <InquiryDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotation/:id" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <QuotationResponse />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotation/:id/response" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <QuotationResponse />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/quotation/:id/payment" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <QuotationPayment />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Order Routes */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <OrderList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/order/:id" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <OrderDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/order/:id/tracking" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <OrderTracking />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/order/:id/payment" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <PaymentPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <BackOfficeDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <OrderManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/material-management" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <BackOfficeMaterialManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Component Manager Routes */}
            <Route path="/component-manager" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <ComponentManagerPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/component-manager/:id" element={
              <ProtectedRoute>
                <Layout isInternal>
                  <ComponentManagerDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
          <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;