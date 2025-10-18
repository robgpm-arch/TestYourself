# Google Play Store Graphics Specifications

## Required Graphics for TestYourself Quiz App

### 1. App Icon (High-Resolution)
- **Size**: 512 x 512 pixels
- **Format**: PNG (32-bit with alpha)
- **File Size**: Max 1MB
- **Design**: Clean, recognizable, works at small sizes
- **Source**: Use generated adaptive icon from `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

### 2. Feature Graphic (Required)
- **Size**: 1024 x 500 pixels
- **Format**: JPEG or PNG (24-bit RGB, no alpha)
- **File Size**: Max 1MB
- **Design**: Showcases app's main value proposition
- **Content**: App screenshot + branding + key features

### 3. Screenshots (Required)
- **Phone Screenshots**: 2-8 images
  - **Portrait**: 9:16 aspect ratio (e.g., 1080 x 1920)
  - **Landscape**: 16:9 aspect ratio (e.g., 1920 x 1080)
- **Tablet Screenshots**: 1-8 images
  - **7" Tablet**: 16:10 aspect ratio (e.g., 1200 x 1920)
  - **10" Tablet**: 16:10 aspect ratio (e.g., 1600 x 2560)

### 4. Optional Graphics

#### Promotional Video
- **Format**: YouTube video link
- **Duration**: 30 seconds to 2 minutes
- **Content**: App demonstration, key features

#### TV Banner (for Android TV)
- **Size**: 1280 x 720 pixels
- **Format**: PNG or JPEG
- **Design**: Landscape orientation, readable from distance

## Design Guidelines for TestYourself

### Brand Identity
- **Primary Colors**: Blue (#3b82f6), White, Gray tones
- **Logo**: TestYourself wordmark + quiz/education icon
- **Style**: Clean, modern, educational, trustworthy

### Feature Graphic Design Elements
1. **Hero Section**: App mockup showing main quiz interface
2. **Value Proposition**: "Master Any Subject with Smart Quizzes"
3. **Key Features**: 
   - "Cross-Platform Learning"
   - "Progress Tracking"
   - "Offline Capable"
   - "Personalized Experience"
4. **Call to Action**: "Download Free" or "Start Learning Today"

### Screenshot Composition
1. **Screenshot 1**: Home/Dashboard - Show main navigation and features
2. **Screenshot 2**: Quiz Interface - Active quiz question with options
3. **Screenshot 3**: Progress Tracking - User stats and achievements
4. **Screenshot 4**: Results Screen - Celebration and detailed feedback
5. **Screenshot 5**: Settings/Profile - Customization options

### Text Overlay Guidelines
- **Font**: Clean, readable sans-serif (Roboto, Inter, or similar)
- **Size**: Large enough to read on small devices
- **Contrast**: High contrast between text and background
- **Language**: Primary English, consider localization

### Device Mockups
- Use realistic device frames (iPhone, Samsung Galaxy, iPad)
- Show actual app interface, not placeholder content
- Maintain consistent lighting and shadows
- Use current device models for relevance

## File Organization
```
graphics/
├── app-icon-512.png          # High-res app icon
├── feature-graphic.png       # Main store feature graphic
├── screenshots/
│   ├── phone/
│   │   ├── 01-home.png       # Dashboard screenshot
│   │   ├── 02-quiz.png       # Quiz interface
│   │   ├── 03-progress.png   # Progress tracking
│   │   └── 04-results.png    # Results celebration
│   └── tablet/
│       ├── 01-home-tablet.png
│       └── 02-quiz-tablet.png
└── promotional/
    ├── banner-tv.png         # Android TV banner
    └── video-thumbnail.png   # YouTube video thumbnail
```

## Quality Checklist
- [ ] All graphics are high resolution and crisp
- [ ] Brand colors and fonts are consistent
- [ ] Screenshots show actual app functionality
- [ ] Text is readable on mobile devices
- [ ] No copyrighted content or placeholder text
- [ ] Graphics reflect current app version
- [ ] All required sizes and formats provided