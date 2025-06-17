import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
<<<<<<< HEAD
import {BrowserRouter} from 'react-router-dom'
import StoreContextProvider, { StoreContext } from './Context/StoreContext.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreContextProvider>
      <App/>
    </StoreContextProvider>
   </BrowserRouter> 
 ,
=======

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
>>>>>>> 1d19cf2e4aef50b5c2a15b8dd9f272058e10459b
)
