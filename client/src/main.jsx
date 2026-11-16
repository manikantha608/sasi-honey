import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import store from './store/index.js';

// Break the circular dependency: inject the store into the api client
// AFTER the store is fully initialized. This must happen before any
// component mounts and fires requests.
import { injectStore } from './services/api.js';
injectStore(store);

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
