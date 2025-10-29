import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL não está definida');
  process.exit(1);
}

async function createAdmin() {
  const sql = postgres(DATABASE_URL);

  try {
    const hashedPassword = await bcrypt.hash('XGl@55#7458', 10);
    
    // Verificar se já existe
    const existing = await sql`
      SELECT id FROM users WHERE username = 'admin'
    `;

    if (existing.length > 0) {
      console.log('❌ Utilizador admin já existe!');
      await sql.end();
      return;
    }

    // Criar admin
    const result = await sql`
      INSERT INTO users (
        "openId",
        username,
        password,
        name,
        email,
        role,
        active,
        "createdAt",
        "updatedAt",
        "lastSignedIn"
      ) VALUES (
        ${'local_admin_' + Date.now()},
        ${'admin'},
        ${hashedPassword},
        ${'Administrador'},
        ${'admin@volanteminho.pt'},
        ${'admin'},
        ${true},
        ${new Date()},
        ${new Date()},
        ${new Date()}
      )
      RETURNING id, username, name, role
    `;

    console.log('✅ Utilizador admin criado com sucesso!');
    console.log('');
    console.log('📋 Credenciais:');
    console.log('   Username: admin');
    console.log('   Password: XGl@55#7458');
    console.log('');
    console.log('🌐 Aceder ao portal: https://volanteminho.netlify.app');
    console.log('');

    await sql.end();
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    await sql.end();
    process.exit(1);
  }
}

createAdmin();
