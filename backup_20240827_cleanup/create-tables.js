const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/config.json').development;

async function createTables() {
  const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the database');

    // Create Notifications table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Notifications" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES "Users" (id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'message', 'match', 'system')),
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('✅ Created Notifications table');

    // Create Stories table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Stories" (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "Users" (id) ON DELETE CASCADE,
        content TEXT,
        media_url VARCHAR(255),
        media_type VARCHAR(50) CHECK (media_type IN ('image', 'video')),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    console.log('✅ Created Stories table');

    // Create indexes
    await sequelize.query('CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON "Notifications" (user_id);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON "Notifications" (is_read);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS stories_user_id_idx ON "Stories" (user_id);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS stories_expires_at_idx ON "Stories" (expires_at);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS stories_is_active_idx ON "Stories" (is_active);');
    
    console.log('✅ Created indexes');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await sequelize.close();
  }
}

createTables();
