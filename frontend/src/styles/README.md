# Global Styles

Application-wide CSS and design tokens.

## Files

- **globals.css** - Global styles, Tailwind imports, CSS custom properties
- **variables.css** - Design tokens (colors, spacing, typography) (future)
- **components.css** - Component-specific CSS (future)

## Usage

`globals.css` is automatically imported in `app/layout.jsx`.

## Custom CSS Variables

The app uses CSS custom properties configured in `globals.css`:
- `--font-heading` - Heading font (Plus Jakarta Sans)
- `--font-body` - Body font (Manrope)

## Tailwind

Tailwind CSS is configured via `tailwind.config.js` in the project root. Global classes and utility-based styling are used throughout.
