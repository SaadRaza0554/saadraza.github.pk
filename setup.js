#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Skill = require('./models/Skill');
const Project = require('./models/Project');

// Sample data
const sampleSkills = [
  {
    name: 'HTML5',
    category: 'frontend',
    proficiency: 9,
    yearsOfExperience: 3,
    description: 'Semantic HTML markup and accessibility',
    icon: 'fab fa-html5',
    color: '#e34f26',
    isFeatured: true,
    order: 1
  },
  {
    name: 'CSS3',
    category: 'frontend',
    proficiency: 8,
    yearsOfExperience: 3,
    description: 'Modern CSS with Flexbox, Grid, and animations',
    icon: 'fab fa-css3-alt',
    color: '#1572b6',
    isFeatured: true,
    order: 2
  },
  {
    name: 'JavaScript',
    category: 'frontend',
    proficiency: 8,
    yearsOfExperience: 3,
    description: 'ES6+, async programming, and modern frameworks',
    icon: 'fab fa-js',
    color: '#f7df1e',
    isFeatured: true,
    order: 3
  },
  {
    name: 'React',
    category: 'frontend',
    proficiency: 7,
    yearsOfExperience: 2,
    description: 'Component-based UI development with hooks',
    icon: 'fab fa-react',
    color: '#61dafb',
    isFeatured: true,
    order: 4
  },
  {
    name: 'Node.js',
    category: 'backend',
    proficiency: 7,
    yearsOfExperience: 2,
    description: 'Server-side JavaScript and API development',
    icon: 'fab fa-node-js',
    color: '#339933',
    isFeatured: true,
    order: 5
  },
  {
    name: 'MongoDB',
    category: 'database',
    proficiency: 6,
    yearsOfExperience: 2,
    description: 'NoSQL database design and optimization',
    icon: 'fas fa-database',
    color: '#47a248',
    isFeatured: true,
    order: 6
  },
  {
    name: 'Express.js',
    category: 'backend',
    proficiency: 7,
    yearsOfExperience: 2,
    description: 'Web application framework for Node.js',
    icon: 'fas fa-server',
    color: '#000000',
    isFeatured: true,
    order: 7
  },
  {
    name: 'Git',
    category: 'devops',
    proficiency: 8,
    yearsOfExperience: 3,
    description: 'Version control and collaboration',
    icon: 'fab fa-git-alt',
    color: '#f05032',
    isFeatured: true,
    order: 8
  }
];

const sampleProjects = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution with React frontend, Node.js backend, and MongoDB database.',
    longDescription: 'Built a complete e-commerce platform featuring user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Implemented responsive design, search functionality, and order management system.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Stripe'],
    category: 'web',
    difficulty: 'advanced',
    status: 'completed',
    isFeatured: true,
    isPublic: true,
    features: [
      'User authentication and authorization',
      'Product catalog with search and filtering',
      'Shopping cart and checkout process',
      'Payment integration with Stripe',
      'Admin dashboard for product management',
      'Order tracking and history'
    ],
    challenges: [
      'Complex state management for shopping cart',
      'Payment security and PCI compliance',
      'Real-time inventory updates'
    ],
    solutions: [
      'Implemented Redux for centralized state management',
      'Used Stripe Elements for secure payment processing',
      'Created webhook system for inventory synchronization'
    ],
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-06-01'),
    estimatedHours: 400,
    teamSize: 3,
    budget: '25k-50k',
    tags: ['ecommerce', 'fullstack', 'react', 'nodejs', 'mongodb']
  },
  {
    title: 'Task Management App',
    description: 'A responsive task management application with drag-and-drop functionality and real-time updates.',
    longDescription: 'Developed a collaborative task management tool with real-time updates, drag-and-drop interface, and team collaboration features. Includes project organization, deadline tracking, and progress monitoring.',
    technologies: ['Vue.js', 'Firebase', 'CSS3', 'Vuex'],
    category: 'web',
    difficulty: 'intermediate',
    status: 'completed',
    isFeatured: true,
    isPublic: true,
    features: [
      'Drag and drop task management',
      'Real-time collaboration',
      'Project organization',
      'Deadline tracking',
      'Progress monitoring',
      'Team member assignments'
    ],
    challenges: [
      'Real-time synchronization across users',
      'Drag and drop performance optimization',
      'Offline functionality'
    ],
    solutions: [
      'Implemented Firebase Realtime Database',
      'Used CSS transforms for smooth animations',
      'Created service worker for offline support'
    ],
    startDate: new Date('2023-03-01'),
    endDate: new Date('2023-05-01'),
    estimatedHours: 200,
    teamSize: 2,
    budget: '10k-25k',
    tags: ['task-management', 'collaboration', 'vuejs', 'firebase']
  },
  {
    title: 'Data Visualization Dashboard',
    description: 'Interactive dashboard for data analysis with charts, graphs, and real-time data processing.',
    longDescription: 'Built a comprehensive data visualization dashboard for business analytics. Features interactive charts, real-time data updates, custom reporting, and export functionality. Used for tracking KPIs and business metrics.',
    technologies: ['D3.js', 'Python', 'Flask', 'PostgreSQL', 'Chart.js'],
    category: 'data',
    difficulty: 'advanced',
    status: 'completed',
    isFeatured: true,
    isPublic: true,
    features: [
      'Interactive charts and graphs',
      'Real-time data updates',
      'Custom report generation',
      'Data export functionality',
      'Responsive dashboard design',
      'Multiple chart types'
    ],
    challenges: [
      'Complex data visualization requirements',
      'Real-time data processing',
      'Performance optimization for large datasets'
    ],
    solutions: [
      'Used D3.js for custom chart implementations',
      'Implemented WebSocket connections for real-time updates',
      'Created data aggregation and caching layers'
    ],
    startDate: new Date('2023-07-01'),
    endDate: new Date('2023-10-01'),
    estimatedHours: 300,
    teamSize: 4,
    budget: '25k-50k',
    tags: ['data-visualization', 'analytics', 'd3js', 'python', 'flask']
  }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-profile');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'work.saadraza@gmail.com',
      password: 'Admin123!',
      firstName: 'Saad',
      lastName: 'Raza',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      permissions: [
        'manage_users',
        'manage_projects',
        'manage_skills',
        'manage_contacts',
        'view_analytics',
        'manage_content',
        'upload_files'
      ],
      profile: {
        bio: 'Full Stack Developer & Creative Problem Solver',
        location: 'Your City, Country',
        website: 'https://yourwebsite.com',
        social: {
          github: 'https://github.com/saadraza',
          linkedin: 'https://linkedin.com/in/saadraza',
          twitter: 'https://twitter.com/saadraza'
        }
      }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: work.saadraza@gmail.com');
    console.log('🔑 Password: Admin123!');
    console.log('⚠️ Please change the password after first login!');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    throw error;
  }
}

async function createSampleSkills() {
  try {
    // Check if skills already exist
    const existingSkills = await Skill.countDocuments();
    if (existingSkills > 0) {
      console.log('ℹ️ Skills already exist, skipping...');
      return;
    }

    // Create skills
    for (const skillData of sampleSkills) {
      const skill = new Skill(skillData);
      await skill.save();
    }

    console.log(`✅ Created ${sampleSkills.length} sample skills`);
  } catch (error) {
    console.error('❌ Failed to create sample skills:', error.message);
    throw error;
  }
}

async function createSampleProjects() {
  try {
    // Check if projects already exist
    const existingProjects = await Project.countDocuments();
    if (existingProjects > 0) {
      console.log('ℹ️ Projects already exist, skipping...');
      return;
    }

    // Create projects
    for (const projectData of sampleProjects) {
      const project = new Project(projectData);
      await project.save();
    }

    console.log(`✅ Created ${sampleProjects.length} sample projects`);
  } catch (error) {
    console.error('❌ Failed to create sample projects:', error.message);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    await connectDB();
    
    console.log('👤 Creating admin user...');
    await createAdminUser();
    
    console.log('\n🛠️ Creating sample skills...');
    await createSampleSkills();
    
    console.log('\n📁 Creating sample projects...');
    await createSampleProjects();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login to admin panel with: admin@example.com / Admin123!');
    console.log('3. Change the default admin password');
    console.log('4. Customize your portfolio content');
    console.log('5. Update contact information and social links');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
