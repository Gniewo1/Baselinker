import axios from 'axios';

 export const LogOut = async () => {
    try {
      // Make API call to logout
      await axios.post('http://localhost:8000/api/logout/', {}, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`, // or 'Bearer <token>' if using JWT
        },
      });

      // Clear token from local storage
      localStorage.removeItem('token');
      return true;




    } catch (error) {
      console.error('Logout failed:', error);
      return false;
      // Handle logout error (e.g., show an error message)
    }
  };