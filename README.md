# Death Clock - New Tab Extension

A Chrome extension that replaces your new tab page with a personalized death clock, motivational quotes, and productivity tools to help you make the most of your time.

## Features

- **Death Clock**: Visual countdown of your estimated remaining time
- **Lifespan Configuration**: Customize your birth date and life expectancy
- **Motivational Quotes**: Daily inspiration to keep you motivated
- **Quick Links**: Easy access to your favorite websites
- **Search Bar**: Integrated search functionality
- **Balance Tracker**: Monitor your financial goals
- **Goal Setting**: Set and track personal objectives
- **Sound Toggle**: Optional audio notifications

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Chrome browser

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Subhankar-Patra1/death-clock.git
   cd death-clock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development Mode

Run the development server:
```bash
npm run dev
```

## Project Structure

```
├── components/          # React components
│   ├── Balance.tsx     # Financial balance tracker
│   ├── DeathClock.tsx  # Main death clock component
│   ├── Goal.tsx        # Goal setting component
│   ├── Greeting.tsx    # Personalized greeting
│   ├── LifespanConfig.tsx # Lifespan configuration
│   ├── QuickLinks.tsx  # Quick access links
│   ├── Quote.tsx       # Motivational quotes
│   ├── SearchBar.tsx   # Search functionality
│   └── SoundToggle.tsx # Audio controls
├── hooks/              # Custom React hooks
├── icons/              # Extension icons
├── dist/               # Built extension files
└── manifest.json       # Chrome extension manifest
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **D3.js** - Data visualization
- **Chrome Extension API** - Browser integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Subhankar Patra** - [GitHub Profile](https://github.com/Subhankar-Patra1)
