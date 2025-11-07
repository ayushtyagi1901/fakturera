import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Terms from './pages/Terms'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login/" replace />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/terms/" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
