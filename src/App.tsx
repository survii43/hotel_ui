import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { MuiThemeProviderWrapper } from './theme/MuiThemeProvider';
import { AppProvider } from './contexts/AppContext';
import DeviceFrame from './components/DeviceFrame';
import OrderStatusPopup from './components/OrderStatusPopup';
import Scan from './pages/Scan';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import History from './pages/History';
import OrderEntry from './pages/OrderEntry';
import OrderTracking from './pages/OrderTracking';

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProviderWrapper>
        <AppProvider>
          <BrowserRouter>
            <div className="app-layout">
            <DeviceFrame>
            <Routes>
            <Route path="/" element={<Scan />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/history" element={<History />} />
            <Route path="/order/:orderId" element={<OrderTracking />} />
            <Route path="/order" element={<OrderEntry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <OrderStatusPopup />
          </DeviceFrame>
            </div>
        </BrowserRouter>
      </AppProvider>
      </MuiThemeProviderWrapper>
    </ThemeProvider>
  );
}

export default App;
