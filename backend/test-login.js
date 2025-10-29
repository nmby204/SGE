const axios = require('axios');

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'luisfernandoma94@gmail.com.com',
      password: '123456789'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login exitoso:');
    console.log('Token:', response.data.token);
    console.log('Usuario:', response.data.user);
  } catch (error) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensaje:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();