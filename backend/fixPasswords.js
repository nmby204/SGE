require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const fixPasswords = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'planeacion_didactica',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Obtener todos los usuarios
    const result = await client.query('SELECT id, email, password FROM users');
    
    console.log(`📊 Encontrados ${result.rows.length} usuarios`);

    for (const user of result.rows) {
      console.log(`\n🔧 Procesando usuario: ${user.email}`);
      console.log(`🔑 Contraseña actual: ${user.password}`);

      // Verificar si la contraseña ya está hasheada
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log('✅ Contraseña ya está hasheada, saltando...');
        continue;
      }

      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      console.log(`🔐 Nuevo hash: ${hashedPassword}`);

      // Actualizar en la base de datos
      await client.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, user.id]
      );

      console.log('✅ Contraseña actualizada');
    }

    console.log('\n🎉 Todas las contraseñas han sido actualizadas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
};

fixPasswords();