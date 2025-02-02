import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import Navbar from './components/Navbar'
import OrderForm from './components/OrderForm'
import FetchData from './components/FetchData'
import Faktura from './components/Faktura'
import SalaryCalculator from './components/SalaryCalculator'
import {Routes, Route, useLocation, Navigate} from 'react-router-dom'
import axios from 'axios'

function App() {

  //Check authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Check if the token is valid by calling a protected route
          const config = {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          };

          const res = await axios.get('http://localhost:8000/api/auth/user/', config);

          if (res.status === 200) {
            setIsAuthenticated(true);
          }
        } catch (err) {
          // If token is invalid, remove it from localStorage and set auth to false
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      }
    };

    checkIfLoggedIn();
  }, []);
  // Authentication ends

  return (
    <>

    
    <Routes>
     <Route path="/" element={<Home/>} />
     <Route path="/navbar" element={<Navbar/>} />
     <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register/>} />
     <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
     <Route path="/order" element={<OrderForm/>} />
     <Route path="/data" element={<FetchData/>} />
     <Route path="/faktura" element={<Faktura/>} />
     <Route path="/pensja" element={<SalaryCalculator/>} />
    </Routes>
    </>
  )

}

export default App
