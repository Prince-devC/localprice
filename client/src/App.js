import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
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
import AgriculturalPrices from './pages/AgriculturalPrices';
import PriceSubmissionForm from './components/PriceSubmissionForm';
import PriceMap from './components/PriceMap';
import CostComparator from './components/CostComparator';
import { AuthProvider } from './contexts/AuthContext';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-top: 80px; /* Pour compenser le header fixe */
`;

function App() {
  return (
    <AuthProvider>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/suppliers" element={<StoreList />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/store/:id" element={<StoreDetail />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Nouvelles routes agricoles */}
            <Route path="/agricultural-prices" element={<AgriculturalPrices />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/submit-price" element={<PriceSubmissionForm />} />
            <Route path="/price-map" element={<PriceMap />} />
            <Route path="/cost-comparator" element={<CostComparator />} />
          </Routes>
        </MainContent>
        <Footer />
      </AppContainer>
    </AuthProvider>
  );
}

export default App;
