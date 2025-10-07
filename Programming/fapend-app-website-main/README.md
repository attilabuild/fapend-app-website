# NoFap App Landing Page

A modern, responsive landing page for a NoFap app, built with Next.js and TailwindCSS.

## Features

- Modern, dark-themed design
- Fully responsive for all device sizes
- App Store and Google Play download CTAs
- Sections showcasing app features, statistics, testimonials, and pricing
- FAQ section
- Clean, maintainable code structure

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- ESLint

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn or pnpm

### Installation

1. Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app`: Contains the main page component
- `/src/components`: Contains reusable components like Navbar, Hero, Features, etc.
- `/public`: Contains static assets like images

## Customization

To customize the app for your specific needs:

1. Update the text content in the components
2. Replace placeholder app store links with your actual app links
3. Add your own branding colors in `tailwind.config.js`
4. Replace placeholder logos and images

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will create an optimized production build in the `.next` folder.

## License

This project is licensed under the MIT License. 