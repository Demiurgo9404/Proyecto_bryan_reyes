#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('🚨 EMERGENCY DATABASE FIX - CREATING TABLES NOW');
console.log('================================================');

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

async function emergencyFix() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully');

    // Read SQL schema
    const schemaPath = path.join(__dirname, 'scripts', 'create-database-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Clean and split SQL
    const cleanSql = schemaSql
      .replace(/--.*$/gm, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const commands = cleanSql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`📝 Found ${commands.length} SQL commands`);

    // Execute all commands
    let created = 0;
    for (const cmd of commands) {
      try {
        await sequelize.query(cmd + ';');
        created++;
        if (cmd.includes('CREATE TABLE')) {
          const tableName = cmd.match(/CREATE TABLE.*?(\w+)/i)?.[1];
          console.log(`✅ Table: ${tableName}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes('already exists') && !error.message.includes('ya existe')) {
          console.log(`⚠️  ${error.message.split('\n')[0]}`);
        }
      }
    }

    console.log(`\n🎉 Created/verified ${created} database objects`);

    // Verify tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n📋 Database tables (${tables.length}):`);
    tables.forEach((table, i) => {
      console.log(`${i + 1}. ${table.table_name}`);
    });

    // Check if users table exists
    const hasUsers = tables.some(t => t.table_name === 'users');
    if (hasUsers) {
      console.log('\n✅ USERS TABLE EXISTS - Login should work now!');
      console.log('\n🔑 Test credentials:');
      console.log('   admin@loverose.com / password123');
      console.log('   super@loverose.com / password123');
      console.log('\n🚀 Restart backend: npm start');
    } else {
      console.log('\n❌ USERS TABLE MISSING - Check SQL file');
    }

  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

emergencyFix();
