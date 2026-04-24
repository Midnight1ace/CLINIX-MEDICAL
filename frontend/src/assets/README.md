# Assets

Static assets including images, icons, fonts, and other media.

## Directory Structure

- **images/** - PNG, JPG, SVG images
- **icons/** - SVG icons and icon fonts
- **fonts/** - Custom font files (if not using Google Fonts)

## Usage

```jsx
import Image from 'next/image';
import logo from '@/assets/images/logo.svg';

<img src={logo} alt="Logo" />
```

## Notes

- Fonts are currently loaded via `next/font/google` in `app/layout.jsx`
- Icons are typically inline SVG or from a library
- Place images in `images/` with descriptive names
