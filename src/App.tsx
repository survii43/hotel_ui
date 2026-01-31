import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import DeviceFrame from './components/DeviceFrame';
import OrderStatusPopup from './components/OrderStatusPopup';
import Scan from './pages/Scan';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import History from './pages/History';
import OrderTracking from './pages/OrderTracking';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <DeviceFrame>
            <Routes>
            <Route path="/" element={<Scan />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/history" element={<History />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <OrderStatusPopup />
          </DeviceFrame>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
