# Saad Raza - Personal Profile Website

A modern, responsive personal portfolio website with a comprehensive backend API for content management.

## 🌟 Features

### Frontend
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Interactive Elements**: Smooth animations, hover effects, and transitions
- **Portfolio Showcase**: Dynamic project display with filtering and search
- **Skills Visualization**: Interactive skills section with proficiency indicators
- **Contact Form**: Professional contact form with validation
- **SEO Optimized**: Meta tags, semantic HTML, and performance optimized

### Backend API
- **Node.js/Express**: Fast, scalable server framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure user authentication and authorization
- **File Uploads**: Image upload system with organized storage
- **Email Notifications**: Automated email system for contact form submissions
- **Rate Limiting**: Protection against spam and abuse
- **Input Validation**: Comprehensive data validation and sanitization
- **Admin Panel**: Content management system for portfolio updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-profile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/personal-profile
   JWT_SECRET=your-super-secret-jwt-key-here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

## 📁 Project Structure

```
personal-profile/
├── frontend/                 # Frontend files
│   ├── index.html           # Main HTML file
│   ├── styles.css           # CSS styles
│   └── script.js            # Frontend JavaScript
├── backend/                  # Backend API
│   ├── config/              # Configuration files
│   │   └── database.js      # MongoDB connection
│   ├── middleware/          # Custom middleware
│   │   └── auth.js          # Authentication middleware
│   ├── models/              # Database models
│   │   ├── Contact.js       # Contact form model
│   │   ├── Project.js       # Project model
│   │   ├── Skill.js         # Skill model
│   │   └── User.js          # User model
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── contact.js       # Contact form routes
│   │   ├── projects.js      # Project management routes
│   │   ├── skills.js        # Skill management routes
│   │   └── upload.js        # File upload routes
│   ├── utils/               # Utility functions
│   │   └── email.js         # Email service
│   ├── uploads/             # File uploads directory
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
├── env.example              # Environment variables template
└── README.md                # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Contact Form
- `POST /api/contact/submit` - Submit contact form (public)
- `GET /api/contact` - Get all contacts (admin)
- `GET /api/contact/stats` - Get contact statistics (admin)
- `GET /api/contact/:id` - Get single contact (admin)
- `PATCH /api/contact/:id/status` - Update contact status (admin)

### Projects
- `GET /api/projects` - Get all public projects
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/category/:category` - Get projects by category
- `GET /api/projects/search` - Search projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Skills
- `GET /api/skills` - Get all active skills
- `GET /api/skills/featured` - Get featured skills
- `GET /api/skills/top` - Get top skills
- `GET /api/skills/search` - Search skills
- `GET /api/skills/:id` - Get single skill
- `POST /api/skills` - Create new skill (admin)
- `PUT /api/skills/:id` - Update skill (admin)
- `DELETE /api/skills/:id` - Delete skill (admin)

### File Uploads
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `POST /api/upload/project` - Upload project images
- `POST /api/upload/profile` - Upload profile image
- `DELETE /api/upload/:filename` - Delete uploaded file
- `GET /api/upload/list` - List uploaded files

## 🗄️ Database Models

### Contact
- Name, email, subject, message
- Status tracking (new, read, replied, archived)
- Spam detection
- IP address and user agent logging
- Admin notes and timestamps

### Project
- Title, description, technologies
- Category, difficulty, status
- Images with main image designation
- Links (GitHub, live, demo)
- Features, challenges, solutions
- View count and likes
- Tags and metadata

### Skill
- Name, category, proficiency level
- Years of experience
- Certifications and learning resources
- Related skills and projects
- Featured status and ordering
- Color coding and icons

### User
- Username, email, password
- Role-based access control
- Profile information and preferences
- Login attempt tracking
- Account locking for security

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Account Locking**: Temporary account suspension after failed attempts

## 📧 Email System

- **Contact Notifications**: Admin alerts for new submissions
- **User Confirmations**: Automated responses to contact form submissions
- **Password Reset**: Secure password recovery emails
- **Welcome Emails**: New user onboarding
- **Template System**: Professional HTML email templates
- **SMTP Support**: Gmail, Outlook, and other providers

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Production Commands
```bash
# Install production dependencies
npm install --production

# Start production server
npm start

# Or use PM2 for process management
pm2 start server.js --name "personal-profile"
```

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests (when implemented)
```

### Code Quality
- ESLint configuration for code standards
- Prettier for code formatting
- Consistent error handling patterns
- Comprehensive logging and monitoring

## 📱 Frontend Integration

Update your frontend JavaScript to use the new API endpoints:

```javascript
// Example: Submit contact form
async function submitContactForm(formData) {
  try {
    const response = await fetch('/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    showNotification('Failed to submit form. Please try again.', 'error');
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: your.email@example.com
- Documentation: Check the API endpoints above

## 🔮 Future Enhancements

- [ ] Blog system
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Advanced search and filtering
- [ ] Social media integration
- [ ] Newsletter subscription
- [ ] Portfolio analytics
- [ ] Client testimonials
- [ ] Project collaboration features

---

**Built with ❤️ by Saad Raza** 