import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';   // ✅ Redux Provider import
import store from './app/store';          // ✅ apna store import
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <Provider store={store}>   {/* ✅ Redux wrap */}
      <ThemeProvider>
        <BrowserRouter>
          <>
            <App />
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="light" />
          </>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  
);
