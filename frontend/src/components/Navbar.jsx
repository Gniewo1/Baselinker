import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { CheckAuthentication } from '../functions/CheckAuthentication';
import { LogOut } from '../functions/LogOut';
import { useState, useEffect } from 'react'




const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = async () => {
    const success = await LogOut();

    if (success) {
      // Redirect to homepage after successful logout
      window.location.reload();
    } else {
      // Handle logout failure (e.g., show an error message)
      console.error('Logout failed');
    }
  };

  useEffect(() => {
    const verifyAuthentication = async () => {
      const authenticated = await CheckAuthentication();
      setIsAuthenticated(authenticated);
    };

    verifyAuthentication();
  }, []);

  




  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MyApp</Link>
      </div>
      
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        {/* <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li> */}

        {isAuthenticated ? (
          <>
            <li>
              <Link to="/data">Baselinker</Link>
            </li>
            <li>
              <Link to="/faktura">Faktura</Link>
            </li>
            <li>
              <button className="btn" onClick={handleLogout}>Wyloguj</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;