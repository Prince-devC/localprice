import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import Seo from './components/Seo';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import StoreList from './pages/StoreList';
import StoreDetail from './pages/StoreDetail';
import Comparison from './pages/Comparison';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
// import AgriculturalPrices from './pages/AgriculturalPrices';
import AllPrices from './pages/AllPrices';
import PriceSubmissionForm from './components/PriceSubmissionForm';
import PriceMapPage from './pages/PriceMapPage';
import SuppliersPage from './pages/SuppliersPage';
import SupplierContact from './pages/SupplierContact';
import PriceDetail from './pages/PriceDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SeoProvider } from './contexts/SeoContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContributionTerms from './pages/ContributionTerms';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; /* Pour compenser le header fixe */
`;

function AppInner() {
  const { user } = useAuth();
  return (
    <AppContainer>
      <Seo />
      <Header />
      <MainContent key={user?.id || 'anon'}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/price/:id" element={<PriceDetail />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/store/:id" element={<StoreDetail />} />
            <Route path="/supplier/:id/contact" element={<SupplierContact />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contribution-terms" element={<ContributionTerms />} />
            
            {/* Nouvelles routes agricoles */}
             <Route path="/all-prices" element={<AllPrices />} />
             <Route path="/admin" element={<AdminDashboard />} />
             <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit-price" element={<PriceSubmissionForm />} />
            <Route path="/price-map" element={<PriceMapPage />} />

        </Routes>
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <SeoProvider>
        <AppInner />
      </SeoProvider>
    </AuthProvider>
  );
}

export default App;
