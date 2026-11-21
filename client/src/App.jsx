import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientForm from './components/ClientForm';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderLayout from './components/OrderLayout';
import OrderDetail from './components/OrderDetail';
import OrderHistory from './components/OrderHistory';
import NotFound from './components/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes/nuevo" element={<ClientForm />} />
          <Route path="ordenes/nueva" element={<OrderForm />} />
          <Route path="ordenes" element={<OrderList />} />
          <Route path="ordenes/:id" element={<OrderLayout />}>
            <Route index element={<OrderDetail />} />
            <Route path="historial" element={<OrderHistory />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
