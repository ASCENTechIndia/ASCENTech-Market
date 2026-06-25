import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './Context/LanguageProvider.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { LoaderProvider } from './Context/LoaderContext.jsx'
import Spinner from './Components/Spinner/Spinner.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoaderProvider>
    <AuthProvider>
          <LanguageProvider> 
              <Spinner />
    <App />
    </LanguageProvider>
    </AuthProvider>
    </LoaderProvider>
  </StrictMode>,
)
