# Personal Website

A modern, responsive personal website built with HTML, CSS, and JavaScript. Features a clean design with smooth animations, mobile-first approach, and professional sections for showcasing your skills and projects.

## 🚀 Features

- **Responsive Design**: Works perfectly on all devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Smooth Scrolling**: Seamless navigation between sections
- **Interactive Elements**: Hover effects and animations
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Semantic HTML structure
- **Accessibility**: Keyboard navigation and screen reader support

## 📁 File Structure

```
web/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🛠️ Setup Instructions

1. **Clone or Download**: Get the project files to your local machine
2. **Open in Browser**: Simply open `index.html` in your web browser
3. **Local Development**: Use a local server for development (recommended)

### Using Local Server (Recommended)

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎨 Customization Guide

### Personal Information

1. **Update Personal Details** in `index.html`:
   - Replace "Your Name" with your actual name
   - Update email, phone, and location in the contact section
   - Modify the hero section description
   - Update about me content

2. **Profile Images**:
   - Replace the placeholder icons with your actual images
   - Update the `src` attributes in the HTML
   - Recommended image sizes:
     - Profile: 300x300px (circular)
     - About: 250x250px
     - Projects: 350x200px

### Content Customization

#### Hero Section
```html
<h1 class="hero-title">Hi, I'm <span class="highlight">Your Name</span></h1>
<p class="hero-subtitle">Your Professional Title</p>
<p class="hero-description">Your personal description</p>
```

#### About Section
- Update the description paragraphs
- Modify the statistics (years of experience, projects completed, etc.)
- Change the about image

#### Skills Section
- Add/remove skill categories
- Update skill names and icons
- Modify the grid layout if needed

#### Projects Section
- Replace project descriptions
- Update project technologies
- Add your actual project links
- Modify project images

#### Contact Section
- Update contact information
- Modify social media links
- Customize the contact form fields

### Styling Customization

#### Colors
The main color scheme is defined in `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #fbbf24;
    --text-color: #1f2937;
    --background-color: #f8fafc;
}
```

#### Typography
- Font family: Inter (Google Fonts)
- Font weights: 300, 400, 500, 600, 700
- Update in the CSS `@import` section

#### Layout
- Container max-width: 1200px
- Section padding: 80px
- Responsive breakpoints: 768px, 480px

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🌟 Advanced Customization

### Adding New Sections

1. Create a new section in `index.html`:
```html
<section id="new-section" class="new-section">
    <div class="container">
        <h2 class="section-title">New Section</h2>
        <!-- Your content here -->
    </div>
</section>
```

2. Add corresponding styles in `styles.css`
3. Add navigation link in the navbar

### Custom Animations

The website uses CSS animations and JavaScript for interactivity:
- Fade-in animations on scroll
- Hover effects on cards and buttons
- Smooth transitions throughout

### Form Handling

The contact form currently shows a success message. To make it functional:
1. Add a backend service (Node.js, PHP, etc.)
2. Update the form submission handler in `script.js`
3. Add proper error handling and validation

## 🔧 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📈 Performance Optimization

- Optimize images (WebP format recommended)
- Minify CSS and JavaScript for production
- Use a CDN for external resources
- Enable gzip compression on your server

## 🚀 Deployment

### GitHub Pages
1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your site will be available at `https://username.github.io/repository-name`

### Netlify
1. Drag and drop your project folder to Netlify
2. Your site will be deployed automatically
3. Custom domain can be added in settings

### Vercel
1. Connect your GitHub repository to Vercel
2. Automatic deployments on every push
3. Custom domain support included

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

If you need help customizing your website:
1. Check the customization guide above
2. Review the code comments
3. Open an issue in the repository

---

**Happy coding! 🎉** 