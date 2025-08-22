require('dotenv').config();
const { faker } = require('@faker-js/faker/locale/es');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/sequelize-config');
const User = require('../models/User.model');

// Configurar colores para la consola
const colors = require('colors');
colors.enable();

// Función para crear usuarios de prueba
const createTestUsers = async () => {
  try {
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    
    // Contraseña común para todos los usuarios de prueba
    const password = 'Test1234!'; // Contraseña segura para pruebas
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Usuarios de prueba
    const testUsers = [
      // Administrador
      {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'admin_loverose',
        email: 'admin@loverose.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        fullName: 'Administrador LoveRose',
        phone: faker.phone.number(),
        birthDate: faker.date.past({ years: 30 }),
        gender: 'masculino',
        country: faker.location.country(),
        city: faker.location.city(),
        bio: 'Administrador principal de la plataforma LoveRose',
        credits: 1000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Agencia
      {
        id: '22222222-2222-2222-2222-222222222222',
        username: 'agencia_rose',
        email: 'agencia@loverose.com',
        password: hashedPassword,
        role: 'agency',
        isVerified: true,
        isActive: true,
        fullName: 'Agencia Rose',
        phone: faker.phone.number(),
        birthDate: faker.date.past({ years: 10 }), // La agencia tiene 10 años
        gender: 'otro',
        country: faker.location.country(),
        city: faker.location.city(),
        bio: 'Agencia especializada en modelos profesionales para LoveRose',
        companyName: 'Agencia Rose',
        companyDescription: 'Especialistas en gestión de modelos para plataformas digitales',
        companyWebsite: 'https://agenciarose.example.com',
        credits: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Modelo
      {
        id: '33333333-3333-3333-3333-333333333333',
        username: 'modelo_rose',
        email: 'modelo@loverose.com',
        password: hashedPassword,
        role: 'model',
        isVerified: true,
        isActive: true,
        fullName: `${faker.person.firstName()} ${faker.person.lastName()}`,
        phone: faker.phone.number(),
        birthDate: faker.date.between('1990-01-01', '2000-12-31'),
        gender: faker.helpers.arrayElement(['masculino', 'femenino']),
        country: faker.location.country(),
        city: faker.location.city(),
        bio: faker.lorem.paragraphs(2),
        height: 160 + Math.floor(Math.random() * 30), // Entre 160 y 190 cm
        bodyType: faker.helpers.arrayElement(['Delgado', 'Atlético', 'Promedio', 'Corpulento']),
        languages: ['Español', 'Inglés'],
        socialMedia: {
          instagram: faker.internet.userName(),
          twitter: faker.internet.userName()
        },
        isProfileComplete: true,
        credits: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Usuario estándar
      {
        id: '44444444-4444-4444-4444-444444444444',
        username: 'usuario_rose',
        email: 'usuario@loverose.com',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        isActive: true,
        fullName: `${faker.person.firstName()} ${faker.person.lastName()}`,
        phone: faker.phone.number(),
        birthDate: faker.date.between('1980-01-01', '2002-12-31'),
        gender: faker.helpers.arrayElement(['masculino', 'femenino', 'otro', 'prefiero no decirlo']),
        country: faker.location.country(),
        city: faker.location.city(),
        bio: faker.lorem.paragraph(),
        credits: 50,
        preferences: {
          gender: faker.helpers.arrayElement(['masculino', 'femenino', 'ambos']),
          ageRange: [18, 50],
          distance: 50
        },
        lastLogin: faker.date.recent(),
        loginCount: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insertar usuarios en la base de datos
    for (const user of testUsers) {
      // Verificar si el usuario ya existe
      const existingUser = await User.findByPk(user.id);
      
      if (!existingUser) {
        await User.create(user);
        console.log(`Usuario creado: ${user.email} (${user.role})`);
      } else {
        console.log(`El usuario ${user.email} ya existe, omitiendo...`);
      }
    }

    console.log('\nUsuarios de prueba creados exitosamente!');
    console.log('Puedes iniciar sesión con cualquiera de estos correos y la contraseña: Test1234!\n');
    
    // Mostrar credenciales
    console.log('=== Credenciales de prueba ===');
    testUsers.forEach(user => {
      console.log(`\nRol: ${user.role.toUpperCase()}`);
      console.log(`Email: ${user.email}`);
      console.log(`Contraseña: Test1234!`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuarios de prueba:', error);
    process.exit(1);
  }
};

// Ejecutar la función
createTestUsers();
