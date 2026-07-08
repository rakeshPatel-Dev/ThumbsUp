import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TooltipProvider } from './components/ui/tooltip.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthInitializer } from './components/auth/AuthInitializer.tsx';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthInitializer />
        <Toaster position="top-right"/>
        <App />
      </TooltipProvider>
    </BrowserRouter>
  </Provider>
)
