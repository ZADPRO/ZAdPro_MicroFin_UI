import './assets/main.css'

// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./main.css"

import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(

    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
    
)
