// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

// Debug: Verificar que JWT_SECRET se cargó
console.log('🔐 JWT_SECRET cargado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET no está definido en las variables de entorno');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Configurar Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Verificar conexión a base de datos al iniciar
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
}

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de API

// ============= AUTENTICACIÓN =============
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Intento de login para: ${email}`);
    
    const users = await sequelize.query(`
      SELECT u.*, ARRAY_AGG(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = :email AND u.is_active = true
      GROUP BY u.id
    `, {
      replacements: { email },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`👤 Usuarios encontrados: ${users.length}`);
    if (users.length > 0) {
      console.log(`✅ Usuario encontrado: ${users[0].username} (${users[0].email})`);
    }

    if (!users.length) {
      console.log(`❌ No se encontró usuario con email: ${email}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    console.log(`🔑 Verificando contraseña para usuario: ${user.username}`);
    
    // Verificar contraseña (usando pgcrypto)
    const passwordCheck = await sequelize.query(`
      SELECT (password_hash = crypt(:password, password_hash)) as valid
      FROM users WHERE id = :userId
    `, {
      replacements: { password, userId: user.id },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log(`🔐 Resultado verificación contraseña: ${passwordCheck[0].valid ? 'VÁLIDA' : 'INVÁLIDA'}`);

    if (!passwordCheck[0].valid) {
      console.log(`❌ Contraseña incorrecta para usuario: ${user.username}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log(`✅ Login exitoso para: ${user.username}`);

    // Registrar login exitoso
    await sequelize.query(`
      INSERT INTO login_history (user_id, ip_address, user_agent, success)
      VALUES (:userId, :ip, :userAgent, true)
    `, {
      replacements: {
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Actualizar última actividad
    await sequelize.query(`
      UPDATE users SET last_active = NOW() WHERE id = :userId
    `, { replacements: { userId: user.id } });

    const token = jwt.sign({
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatar: user.avatar_url,
        roles: user.roles || []
      },
      token
    };

    console.log(`🎉 Enviando respuesta exitosa para: ${user.username}`);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay token, devolver sin autorización
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const mockUser = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        displayName: 'Usuario de Prueba',
        avatar: null,
        roles: decoded.roles
      };
      
      res.json(mockUser);
    } catch (jwtError) {
      // Manejar específicamente errores de JWT
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
      } else {
        // Para otros errores JWT, también devolver 401
        console.error('Error JWT:', jwtError);
        return res.status(401).json({ error: 'Token inválido' });
      }
    }
    
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= USUARIOS =============
app.get('/api/users/preferences/models', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1]; // Extraer de JWT
    
    const [preferences] = await sequelize.query(`
      SELECT * FROM user_model_preferences WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    res.json(preferences || {
      minAge: 18,
      maxAge: 35,
      gender: 'all',
      location: '',
      interests: []
    });
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/users/preferences/models', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    const { minAge, maxAge, gender, location, interests } = req.body;

    await sequelize.query(`
      INSERT INTO user_model_preferences (user_id, min_age, max_age, gender, location, interests)
      VALUES (:userId, :minAge, :maxAge, :gender, :location, :interests)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        min_age = :minAge,
        max_age = :maxAge,
        gender = :gender,
        location = :location,
        interests = :interests,
        updated_at = NOW()
    `, {
      replacements: {
        userId,
        minAge,
        maxAge,
        gender,
        location,
        interests: JSON.stringify(interests)
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= MODELOS ACTIVOS =============
app.get('/api/models/active', async (req, res) => {
  try {
    // First, check if required tables exist
    try {
      await sequelize.query('SELECT 1 FROM users LIMIT 1');
      await sequelize.query('SELECT 1 FROM user_roles LIMIT 1');
      await sequelize.query('SELECT 1 FROM roles LIMIT 1');
    } catch (tableError) {
      console.error('Database table check failed:', tableError);
      return res.status(500).json({ 
        error: 'Database configuration error',
        details: tableError.message 
      });
    }

    // Simplified query to get basic model information first
    const [models] = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.display_name as displayName,
        u.avatar_url as avatar,
        u.cover_image_url as coverImage,
        EXTRACT(YEAR FROM AGE(u.birth_date)) as age,
        u.gender,
        u.location,
        u.bio,
        u.is_verified as isVerified,
        false as isLive,  // Default value
        0 as viewerCount, // Default value
        4.5 as rating,    // Default value
        0 as followers    // Default value
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'Model' 
        AND u.is_active = true
      ORDER BY RANDOM()
      LIMIT 50
    `, { type: Sequelize.QueryTypes.SELECT });

    // Add placeholder data
    const formattedModels = models.map(model => ({
      ...model,
      interests: ['Música', 'Arte', 'Fitness'],
      lastActive: new Date().toISOString(),
      liveStreamUrl: null,
      isVerified: Boolean(model.isVerified)
    }));

    res.json(formattedModels);
  } catch (error) {
    console.error('Error getting active models:', error);
    // Return a valid response with sample data if there's an error
    res.json([
      {
        id: 'sample-1',
        username: 'sample_model',
        displayName: 'Sample Model',
        avatar: 'https://i.pravatar.cc/150?img=1',
        coverImage: 'https://picsum.photos/1200/400?random=1',
        age: 25,
        gender: 'Female',
        location: 'Mexico City',
        bio: 'Professional model',
        isVerified: true,
        isLive: false,
        viewerCount: 0,
        rating: 4.5,
        followers: 100,
        interests: ['Música', 'Arte', 'Fitness'],
        lastActive: new Date().toISOString()
      }
    ]);
  }
});

// ============= SWIPE ACTIONS =============
app.post('/api/users/swipe', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    const { modelId, action } = req.body;

    await sequelize.query(`
      INSERT INTO swipe_actions (user_id, target_user_id, action)
      VALUES (:userId, :modelId, :action)
      ON CONFLICT (user_id, target_user_id)
      DO UPDATE SET action = :action, created_at = NOW()
    `, {
      replacements: { userId, modelId, action }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error registrando swipe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= VIDEOLLAMADAS =============
app.post('/api/video-calls/start', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    const { modelId, type } = req.body;

    const [result] = await sequelize.query(`
      INSERT INTO video_calls (caller_id, callee_id, type, status, created_at)
      VALUES (:userId, :modelId, :type, 'pending', NOW())
      RETURNING id
    `, {
      replacements: { userId, modelId, type },
      type: Sequelize.QueryTypes.INSERT
    });

    const callId = result[0].id;

    res.json({
      callId,
      status: 'pending',
      participant: {
        id: modelId,
        // Obtener datos del modelo...
      }
    });
  } catch (error) {
    console.error('Error iniciando videollamada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/video-calls/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    const [call] = await sequelize.query(`
      SELECT vc.*, 
             u.username, u.display_name, u.avatar_url, u.is_verified
      FROM video_calls vc
      JOIN users u ON vc.callee_id = u.id
      WHERE vc.id = :callId
    `, {
      replacements: { callId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!call) {
      return res.status(404).json({ error: 'Llamada no encontrada' });
    }

    res.json({
      id: call.id,
      status: call.status,
      participant: {
        id: call.callee_id,
        username: call.username,
        displayName: call.display_name,
        avatar: call.avatar_url,
        isModel: true,
        isVerified: call.is_verified
      }
    });
  } catch (error) {
    console.error('Error obteniendo videollamada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/video-calls/:callId/end', async (req, res) => {
  try {
    const { callId } = req.params;
    const { duration, cost } = req.body;

    await sequelize.query(`
      UPDATE video_calls 
      SET status = 'ended', ended_at = NOW(), duration = :duration, cost = :cost
      WHERE id = :callId
    `, {
      replacements: { callId, duration, cost }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error finalizando videollamada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============= PROPINAS =============
app.post('/api/tips/send', async (req, res) => {
  try {
    const userId = req.headers.authorization?.split(' ')[1];
    const { recipientId, amount, callId } = req.body;

    // Verificar balance
    const [balance] = await sequelize.query(`
      SELECT balance FROM user_balances WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!balance || balance.balance < amount) {
      return res.status(400).json({ error: 'Balance insuficiente' });
    }

    // Procesar transacción
    await sequelize.transaction(async (t) => {
      // Registrar propina
      await sequelize.query(`
        INSERT INTO tips (sender_id, recipient_id, amount, reference_id, reference_type)
        VALUES (:userId, :recipientId, :amount, :callId, 'video_call')
      `, {
        replacements: { userId, recipientId, amount, callId },
        transaction: t
      });

      // Actualizar balances
      await sequelize.query(`
        UPDATE user_balances SET balance = balance - :amount, total_spent = total_spent + :amount
        WHERE user_id = :userId
      `, {
        replacements: { userId, amount },
        transaction: t
      });

      await sequelize.query(`
        UPDATE user_balances SET balance = balance + :amount, total_earned = total_earned + :amount
        WHERE user_id = :recipientId
      `, {
        replacements: { recipientId, amount },
        transaction: t
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando propina:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== DASHBOARD ENDPOINTS ====================

// User Dashboard Endpoints
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user balance and stats
    const balanceQuery = await sequelize.query(`
      SELECT COALESCE(balance, 0) as balance FROM user_balances WHERE user_id = :userId
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    const statsQuery = await sequelize.query(`
      SELECT 
        COUNT(CASE WHEN vc.status = 'ended' THEN 1 END) as total_sessions,
        COUNT(DISTINCT sa.target_user_id) as favorite_models,
        0 as pending_requests
      FROM users u
      LEFT JOIN video_calls vc ON u.id = vc.caller_id
      LEFT JOIN swipe_actions sa ON u.id = sa.user_id AND sa.action = 'like'
      WHERE u.id = :userId
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    // Get recent transactions
    const transactionsQuery = await sequelize.query(`
      SELECT 
        id, type, amount, description, created_at as date, 'completed' as status
      FROM coin_transactions 
      WHERE user_id = :userId 
      ORDER BY created_at DESC 
      LIMIT 10
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    // Get upcoming video calls
    const sessionsQuery = await sequelize.query(`
      SELECT 
        vc.id,
        u.display_name as model_name,
        u.avatar_url as model_avatar,
        vc.started_at as scheduled_time,
        vc.duration,
        vc.status
      FROM video_calls vc
      JOIN users u ON vc.callee_id = u.id
      WHERE vc.caller_id = :userId AND vc.status = 'pending'
      ORDER BY vc.created_at DESC
      LIMIT 5
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({
      balance: balanceQuery[0]?.balance || 0,
      totalSessions: parseInt(statsQuery[0]?.total_sessions || 0),
      favoriteModels: parseInt(statsQuery[0]?.favorite_models || 0),
      pendingRequests: parseInt(statsQuery[0]?.pending_requests || 0),
      recentTransactions: transactionsQuery || [],
      upcomingSessions: sessionsQuery || []
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/user/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const favorites = await sequelize.query(`
      SELECT 
        u.id,
        u.display_name as name,
        u.avatar_url as avatar,
        4.5 as rating,
        false as is_online,
        'Hace 2 días' as last_session,
        0 as total_sessions
      FROM swipe_actions sa
      JOIN users u ON sa.target_user_id = u.id
      WHERE sa.user_id = :userId AND sa.action = 'like'
      ORDER BY sa.created_at DESC
      LIMIT 10
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    res.json({ favorites: favorites || [] });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/user/session-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock data for session requests
    const sessionRequests = [
      {
        id: 1,
        modelId: 1,
        modelName: 'Ana García',
        modelAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        requestedAt: new Date().toISOString(),
        status: 'pending',
        sessionType: 'video_call',
        duration: 30,
        cost: 150
      }
    ];

    res.json({
      success: true,
      data: sessionRequests
    });
  } catch (error) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.post('/api/user/session-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { modelId, sessionType = 'video_call', duration = 30, message } = req.body;

    if (!modelId) {
      return res.status(400).json({
        success: false,
        error: 'Model ID es requerido'
      });
    }

    // Mock session request creation
    const newSessionRequest = {
      id: Date.now(), // Simple ID generation for mock
      userId,
      modelId,
      sessionType,
      duration,
      message,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      cost: duration * 5 // Mock cost calculation
    };

    console.log(`📝 Nueva solicitud de sesión creada:`, newSessionRequest);

    res.json({
      success: true,
      data: newSessionRequest,
      message: 'Solicitud de sesión enviada exitosamente'
    });
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.post('/api/user/add-funds', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }

    // Add funds to wallet
    await sequelize.query(`
      INSERT INTO user_balances (user_id, balance) 
      VALUES (:userId, :amount)
      ON CONFLICT (user_id) 
      DO UPDATE SET balance = user_balances.balance + :amount, updated_at = NOW()
    `, {
      replacements: { userId, amount }
    });

    // Record transaction
    await sequelize.query(`
      INSERT INTO coin_transactions (user_id, type, amount, description)
      VALUES (:userId, 'purchase', :amount, 'Depósito de fondos')
    `, {
      replacements: { userId, amount }
    });

    res.json({ success: true, message: 'Fondos agregados exitosamente' });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/user/favorites/:modelId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { modelId } = req.params;

    await sequelize.query(`
      DELETE FROM swipe_actions WHERE user_id = :userId AND target_user_id = :modelId AND action = 'like'
    `, {
      replacements: { userId, modelId }
    });

    res.json({ success: true, message: 'Favorito eliminado' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== COIN ENDPOINTS ====================

app.get('/api/coin/transactions/my-balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock balance - in real app this would come from database
    const balance = 1500; // Default balance for testing
    
    console.log(`💰 Consultando balance - Usuario: ${userId}, Balance: ${balance}`);

    res.json({
      success: true,
      balance: balance
    });
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.get('/api/coin/packages', authenticateToken, async (req, res) => {
  try {
    // Mock coin packages
    const packages = [
      {
        id: 1,
        name: 'Paquete Básico',
        coins: 100,
        price: 9.99,
        currency: 'USD',
        description: 'Perfecto para empezar'
      },
      {
        id: 2,
        name: 'Paquete Premium',
        coins: 500,
        price: 39.99,
        currency: 'USD',
        description: 'Mejor valor'
      },
      {
        id: 3,
        name: 'Paquete VIP',
        coins: 1000,
        price: 69.99,
        currency: 'USD',
        description: 'Máximo ahorro'
      }
    ];

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching coin packages:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

app.get('/api/coin/transactions/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, type, status, search } = req.query;

    // Mock transactions
    const transactions = [
      {
        id: 1,
        type: 'credit',
        amount: 100,
        description: 'Compra de paquete básico',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'debit',
        amount: -50,
        description: 'Videollamada con modelo',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        transactions,
        totalCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ==================== LOVEROSE SOCIAL MEDIA ENDPOINTS ====================

// ============= POSTS =============
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get posts from followed users and own posts
    const posts = await sequelize.query(`
      SELECT 
        p.id,
        u.username,
        u.display_name,
        u.avatar_url as avatar,
        p.image_url as image,
        p.caption,
        p.location,
        p.created_at,
        COUNT(DISTINCT pl.id) as likes,
        COUNT(DISTINCT pc.id) as comments,
        CASE WHEN upl.user_id IS NOT NULL THEN true ELSE false END as is_liked,
        CASE WHEN upb.user_id IS NOT NULL THEN true ELSE false END as is_bookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN post_comments pc ON p.id = pc.post_id
      LEFT JOIN post_likes upl ON p.id = upl.post_id AND upl.user_id = :userId
      LEFT JOIN post_bookmarks upb ON p.id = upb.post_id AND upb.user_id = :userId
      LEFT JOIN user_follows uf ON p.user_id = uf.followed_id AND uf.follower_id = :userId
      WHERE p.user_id = :userId OR uf.follower_id = :userId OR u.role = 'model'
      GROUP BY p.id, u.username, u.display_name, u.avatar_url, p.image_url, p.caption, p.location, p.created_at, upl.user_id, upb.user_id
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { userId, limit, offset },
      type: Sequelize.QueryTypes.SELECT
    });

    // Add time ago calculation
    const postsWithTimeAgo = posts.map(post => ({
      ...post,
      timeAgo: getTimeAgo(post.created_at)
    }));

    res.json(postsWithTimeAgo);
  } catch (error) {
    console.error('Error fetching posts:', error);
    // Return mock data as fallback
    res.json([
      {
        id: '1',
        username: 'sofia_model',
        avatar: '/avatars/sofia.jpg',
        image: '/posts/post1.jpg',
        caption: '¡Nueva sesión disponible! ¿Quién quiere pasar un rato conmigo? #LoveRose #Live',
        likes: 73,
        comments: 12,
        is_liked: false,
        is_bookmarked: false,
        timeAgo: '2 horas',
        location: 'Madrid, España'
      },
      {
        id: '2',
        username: 'maria_rose',
        avatar: '/avatars/maria.jpg',
        image: '/posts/post2.jpg',
        caption: 'Preparándome para la sesión de esta noche ¡Los espero!',
        likes: 156,
        comments: 28,
        is_liked: true,
        is_bookmarked: true,
        timeAgo: '4 horas',
        location: 'Barcelona, España'
      }
    ]);
  }
});

// Stories endpoint
app.get('/api/stories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stories = await sequelize.query(`
      SELECT DISTINCT
        u.id,
        u.username,
        u.avatar_url as avatar,
        CASE WHEN sv.user_id IS NOT NULL THEN true ELSE false END as is_viewed,
        CASE WHEN u.id = :userId THEN true ELSE false END as is_own
      FROM users u
      LEFT JOIN stories s ON u.id = s.user_id AND s.created_at > NOW() - INTERVAL '24 hours'
      LEFT JOIN story_views sv ON s.id = sv.story_id AND sv.user_id = :userId
      LEFT JOIN user_follows uf ON u.id = uf.followed_id AND uf.follower_id = :userId
      WHERE (u.id = :userId OR uf.follower_id = :userId OR u.role = 'model') AND s.id IS NOT NULL
      ORDER BY is_own DESC, u.username
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    res.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    // Return mock data as fallback
    res.json([
      { id: '1', username: 'Tu historia', avatar: '/default-avatar.jpg', is_viewed: false, is_own: true },
      { id: '2', username: 'sofia_model', avatar: '/avatars/sofia.jpg', is_viewed: false, is_own: false },
      { id: '3', username: 'maria_rose', avatar: '/avatars/maria.jpg', is_viewed: true, is_own: false },
      { id: '4', username: 'ana_bella', avatar: '/avatars/ana.jpg', is_viewed: false, is_own: false },
      { id: '5', username: 'lucia_star', avatar: '/avatars/lucia.jpg', is_viewed: true, is_own: false }
    ]);
  }
});

// User suggestions endpoint
app.get('/api/users/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const suggestions = await sequelize.query(`
      SELECT 
        u.id,
        u.username,
        u.display_name as full_name,
        u.avatar_url as avatar,
        CASE WHEN uf.follower_id IS NOT NULL THEN true ELSE false END as is_following,
        COUNT(DISTINCT mutual.follower_id) as mutual_friends
      FROM users u
      LEFT JOIN user_follows uf ON u.id = uf.followed_id AND uf.follower_id = :userId
      LEFT JOIN user_follows mutual ON u.id = mutual.followed_id 
        AND mutual.follower_id IN (
          SELECT followed_id FROM user_follows WHERE follower_id = :userId
        )
      WHERE u.id != :userId 
        AND u.role = 'model'
        AND uf.follower_id IS NULL
      GROUP BY u.id, u.username, u.display_name, u.avatar_url, uf.follower_id
      ORDER BY mutual_friends DESC, RANDOM()
      LIMIT 5
    `, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    // Return mock data as fallback
    res.json([
      { id: '1', username: 'elena_vip', avatar: '/avatars/elena.jpg', full_name: 'Elena Martínez', is_following: false, mutual_friends: 3 },
      { id: '2', username: 'carla_premium', avatar: '/avatars/carla.jpg', full_name: 'Carla López', is_following: false, mutual_friends: 7 },
      { id: '3', username: 'natalia_exclusive', avatar: '/avatars/natalia.jpg', full_name: 'Natalia García', is_following: false, mutual_friends: 2 }
    ]);
  }
});

// Post interactions
app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    await sequelize.query(`
      INSERT INTO post_likes (user_id, post_id) 
      VALUES (:userId, :postId)
      ON CONFLICT (user_id, post_id) DO NOTHING
    `, {
      replacements: { userId, postId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking post:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

app.delete('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    await sequelize.query(`
      DELETE FROM post_likes WHERE user_id = :userId AND post_id = :postId
    `, {
      replacements: { userId, postId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

app.post('/api/posts/:postId/bookmark', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    await sequelize.query(`
      INSERT INTO post_bookmarks (user_id, post_id) 
      VALUES (:userId, :postId)
      ON CONFLICT (user_id, post_id) DO NOTHING
    `, {
      replacements: { userId, postId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

app.delete('/api/posts/:postId/bookmark', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    await sequelize.query(`
      DELETE FROM post_bookmarks WHERE user_id = :userId AND post_id = :postId
    `, {
      replacements: { userId, postId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

// Create new post endpoint
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { caption, location, mediaUrls } = req.body;

    // For now, create a mock post since we don't have file upload setup
    const mockPost = {
      id: Date.now().toString(),
      user_id: userId,
      caption: caption || '',
      location: location || null,
      image_url: mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : '/posts/default.jpg',
      created_at: new Date().toISOString()
    };

    // In a real implementation, you would:
    // 1. Handle file uploads with multer
    // 2. Store files in cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Insert into database with real data
    
    try {
      await sequelize.query(`
        INSERT INTO posts (user_id, caption, location, image_url, created_at)
        VALUES (:userId, :caption, :location, :imageUrl, NOW())
      `, {
        replacements: {
          userId,
          caption: caption || '',
          location: location || null,
          imageUrl: mockPost.image_url
        }
      });
    } catch (dbError) {
      console.log('Database insert failed, using mock response:', dbError.message);
    }

    res.json({ 
      success: true, 
      post: {
        id: mockPost.id,
        username: 'current_user', // Would get from user data
        avatar: '/default-avatar.jpg',
        image: mockPost.image_url,
        caption: mockPost.caption,
        likes: 0,
        comments: 0,
        isLiked: false,
        isBookmarked: false,
        timeAgo: 'ahora',
        location: mockPost.location
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Add comment to post endpoint
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    try {
      await sequelize.query(`
        INSERT INTO post_comments (post_id, user_id, comment, created_at)
        VALUES (:postId, :userId, :comment, NOW())
      `, {
        replacements: { postId, userId, comment: comment.trim() }
      });
    } catch (dbError) {
      console.log('Database insert failed for comment:', dbError.message);
    }

    res.json({ 
      success: true,
      comment: {
        id: Date.now().toString(),
        username: 'current_user', // Would get from user data
        avatar: '/default-avatar.jpg',
        comment: comment.trim(),
        timeAgo: 'ahora'
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Follow/unfollow users
app.post('/api/users/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;

    await sequelize.query(`
      INSERT INTO user_follows (follower_id, followed_id) 
      VALUES (:followerId, :userId)
      ON CONFLICT (follower_id, followed_id) DO NOTHING
    `, {
      replacements: { followerId, userId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

app.delete('/api/users/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { userId } = req.params;

    await sequelize.query(`
      DELETE FROM user_follows WHERE follower_id = :followerId AND followed_id = :userId
    `, {
      replacements: { followerId, userId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.json({ success: true }); // Return success for mock behavior
  }
});

// Helper function for time ago calculation
function getTimeAgo(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} h`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)} d`;
  }
}

// ==================== ADMIN DASHBOARD ENDPOINTS ====================

// Admin Dashboard Stats
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    // Verify admin role
    if (!req.user.roles || !req.user.roles.includes('Admin') && !req.user.roles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de administrador' });
    }

    // Get total users
    const totalUsersQuery = await sequelize.query(`
      SELECT COUNT(*) as total FROM users WHERE is_active = true
    `, { type: Sequelize.QueryTypes.SELECT });

    // Get total models (users with Model role)
    const totalModelsQuery = await sequelize.query(`
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Model' AND u.is_active = true
    `, { type: Sequelize.QueryTypes.SELECT });

    // Get total studies (users with Study role)
    const totalStudiesQuery = await sequelize.query(`
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Study' AND u.is_active = true
    `, { type: Sequelize.QueryTypes.SELECT });

    // Get active connections (mock data)
    const activeConnections = Math.floor(Math.random() * 50) + 10;

    // Get monthly revenue (mock calculation)
    const monthlyRevenue = Math.floor(Math.random() * 50000) + 10000;

    // Get recent transactions
    const recentTransactions = [
      {
        id: '1',
        amount: 150,
        type: 'Video Call',
        user: 'Usuario123',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        amount: 75,
        type: 'Tip',
        user: 'Usuario456',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        amount: 200,
        type: 'Premium Session',
        user: 'Usuario789',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    // System health (mock)
    const systemHealth = Math.floor(Math.random() * 20) + 80;

    res.json({
      totalUsers: parseInt(totalUsersQuery[0]?.total || 0),
      totalModels: parseInt(totalModelsQuery[0]?.total || 0),
      totalStudies: parseInt(totalStudiesQuery[0]?.total || 0),
      activeConnections,
      monthlyRevenue,
      recentTransactions,
      pendingReports: Math.floor(Math.random() * 10),
      systemHealth,
      contentModerationQueue: Math.floor(Math.random() * 5)
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Admin Users Management
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Admin users request from user:', req.user);
    
    // Verify admin role - check if user has Admin or SuperAdmin role
    const userRoles = req.user.roles || [];
    const hasAdminAccess = userRoles.includes('Admin') || userRoles.includes('SuperAdmin');
    
    if (!hasAdminAccess) {
      console.log('❌ Access denied - User roles:', userRoles);
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de administrador' });
    }

    console.log('✅ Admin access granted, fetching users...');

    const users = await sequelize.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.created_at,
        u.avatar_url as avatar,
        COALESCE(
          ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL), 
          ARRAY['User']
        ) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at, u.avatar_url
      ORDER BY u.created_at DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log(`📊 Found ${users.length} users`);

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name || 'Usuario',
      lastName: user.last_name || 'Sin Apellido',
      roles: Array.isArray(user.roles) ? user.roles : ['User'],
      isActive: user.is_active,
      createdAt: user.created_at,
      avatar: user.avatar
    }));

    res.json(formattedUsers);

  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Admin Assign Role
app.post('/api/admin/assign-role', authenticateToken, async (req, res) => {
  try {
    // Verify admin role
    if (!req.user.roles || !req.user.roles.includes('Admin') && !req.user.roles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de administrador' });
    }

    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId y role son requeridos' });
    }

    // Get role ID
    const roleQuery = await sequelize.query(`
      SELECT id FROM roles WHERE name = :role
    `, {
      replacements: { role },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!roleQuery.length) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const roleId = roleQuery[0].id;

    // Remove existing roles for this user
    await sequelize.query(`
      DELETE FROM user_roles WHERE user_id = :userId
    `, { replacements: { userId } });

    // Add new role
    await sequelize.query(`
      INSERT INTO user_roles (user_id, role_id) VALUES (:userId, :roleId)
    `, { replacements: { userId, roleId } });

    res.json({ success: true, message: 'Rol asignado exitosamente' });

  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Admin Toggle User Status
app.put('/api/admin/users/:userId/status', authenticateToken, async (req, res) => {
  try {
    // Verify admin role
    if (!req.user.roles || !req.user.roles.includes('Admin') && !req.user.roles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de administrador' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    await sequelize.query(`
      UPDATE users SET is_active = :isActive WHERE id = :userId
    `, { replacements: { userId, isActive } });

    res.json({ success: true, message: 'Estado de usuario actualizado' });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== SUPER ADMIN ENDPOINTS ====================

// SuperAdmin Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Verify SuperAdmin role
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de SuperAdmin' });
    }

    // Mock system stats
    res.json({
      totalUsers: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 200) + 100,
      totalRevenue: Math.floor(Math.random() * 100000) + 50000,
      systemHealth: Math.floor(Math.random() * 20) + 80,
      serverUptime: '15 días, 3 horas',
      databaseSize: '2.3 GB'
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SuperAdmin Models
app.get('/api/admin/models', authenticateToken, async (req, res) => {
  try {
    // Verify SuperAdmin role
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de SuperAdmin' });
    }

    const models = await sequelize.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        u.created_at,
        u.avatar_url as avatar
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'Model' AND u.is_active = true
      ORDER BY u.created_at DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    const formattedModels = models.map(model => ({
      id: model.id,
      email: model.email,
      name: `${model.first_name || 'Modelo'} ${model.last_name || ''}`.trim(),
      avatar: model.avatar,
      isActive: model.is_active,
      createdAt: model.created_at,
      rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating 3-5
      totalSessions: Math.floor(Math.random() * 100) + 10
    }));

    res.json(formattedModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SuperAdmin Create User
app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Verify SuperAdmin role
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de SuperAdmin' });
    }

    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Check if user already exists
    const existingUser = await sequelize.query(`
      SELECT id FROM users WHERE email = :email OR username = :username
    `, {
      replacements: { email, username },
      type: Sequelize.QueryTypes.SELECT
    });

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }

    // Create user with encrypted password
    const userId = require('crypto').randomUUID();
    await sequelize.query(`
      INSERT INTO users (id, username, email, password_hash, first_name, is_active, created_at)
      VALUES (:userId, :username, :email, crypt(:password, gen_salt('bf')), :firstName, true, NOW())
    `, {
      replacements: {
        userId,
        username,
        email,
        password,
        firstName: username
      }
    });

    // Assign role
    const roleQuery = await sequelize.query(`
      SELECT id FROM roles WHERE name = :role
    `, {
      replacements: { role },
      type: Sequelize.QueryTypes.SELECT
    });

    if (roleQuery.length > 0) {
      await sequelize.query(`
        INSERT INTO user_roles (user_id, role_id) VALUES (:userId, :roleId)
      `, {
        replacements: { userId, roleId: roleQuery[0].id }
      });
    }

    res.json({ success: true, message: 'Usuario creado exitosamente', userId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SuperAdmin Toggle User Status
app.patch('/api/admin/users/:userId/toggle-status', authenticateToken, async (req, res) => {
  try {
    // Verify SuperAdmin role
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('SuperAdmin')) {
      return res.status(403).json({ error: 'Acceso denegado - Se requiere rol de SuperAdmin' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    await sequelize.query(`
      UPDATE users SET is_active = :isActive WHERE id = :userId
    `, { replacements: { userId, isActive } });

    res.json({ success: true, message: 'Estado de usuario actualizado' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== MODEL DASHBOARD ENDPOINTS ====================

// Model Dashboard Stats
app.get('/api/model/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock model stats
    res.json({
      totalEarnings: Math.floor(Math.random() * 5000) + 1000,
      thisMonth: Math.floor(Math.random() * 1000) + 200,
      activeConnections: Math.floor(Math.random() * 10) + 1,
      scheduledSessions: [
        {
          id: '1',
          clientName: 'Cliente123',
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          duration: 30,
          amount: 150
        }
      ],
      rating: (Math.random() * 2 + 3).toFixed(1),
      totalSessions: Math.floor(Math.random() * 200) + 50
    });
  } catch (error) {
    console.error('Error fetching model dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==================== STUDY DASHBOARD ENDPOINTS ====================

// Study Dashboard Stats
app.get('/api/study/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock study stats
    res.json({
      activeStudies: Math.floor(Math.random() * 10) + 2,
      completedStudies: Math.floor(Math.random() * 20) + 5,
      totalParticipants: Math.floor(Math.random() * 500) + 100,
      dataCollection: {
        totalDataPoints: Math.floor(Math.random() * 10000) + 1000,
        lastUpdated: new Date().toISOString()
      },
      recentStudies: [
        {
          id: '1',
          title: 'Estudio de Comportamiento Usuario',
          participants: 45,
          status: 'active',
          progress: 75,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching study dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message
    });
  }
});

// Inicializar servidor
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
    console.log(`📊 Entorno: ${env}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
