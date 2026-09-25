import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FloatingWhatsApp, Footer, LegalPage, Navbar, NotFoundPage, Seo } from './components/layout/Shell'
import { IntentProvider } from './context/IntentContext'
import { HomePage } from './pages/HomePage'

export default function App() {
  const { t } = useTranslation()
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <IntentProvider>
        <a href="#hero" className="skip-link">
          {t('common.skip')}
        </a>
        <Seo />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <HomePage />
                <Footer />
                <FloatingWhatsApp />
              </>
            }
          />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </IntentProvider>
    </BrowserRouter>
  )
}
