# Lost & Found - Sticky Notes Board

A modern Lost & Found application built with React, TypeScript, and Tailwind CSS. Items are displayed as colorful sticky notes on a bulletin board.

## Features

- 📌 **Sticky Notes Display**: Lost and found items displayed as colorful sticky notes
- 🔍 **Search & Filter**: Search by title, description, or location; filter by status (Lost/Found)
- ➕ **Add Items**: Easy-to-use form to add new lost or found items
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 💾 **Local Storage**: Items are saved in browser's local storage
- 🎨 **Customizable**: Choose from 6 different sticky note colors
- 🖼️ **Image Support**: Add images to items via URL

## Getting Started
666
### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "new project"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## Usage

### Adding Items

1. Click the "+" button in the bottom right corner
2. Fill in the required fields (marked with *)
3. Choose a color for your sticky note
4. Optionally add an image URL
5. Click "Add Item"

### Viewing Details

Click on any sticky note to view full details about the item.

### Deleting Items

1. Open an item's details by clicking on it
2. Click the trash icon in the top right corner
3. Confirm the deletion

### Filtering

Use the header to:
- View all items, only lost items, or only found items
- Search for specific items by title, description, or location

## Project Structure

```
new project/
├── src/
│   ├── components/
│   │   ├── AddNoteForm.tsx      # Form for adding new items
│   │   ├── Header.tsx           # Navigation header with search/filter
│   │   ├── ItemDetailModal.tsx  # Modal for viewing item details
│   │   ├── StickyBoard.tsx      # Grid layout for sticky notes
│   │   └── StickyNote.tsx       # Individual sticky note component
│   ├── pages/
│   │   ├── Home.tsx             # Main page
│   │   └── NotFound.tsx         # 404 page
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── App.tsx                      # Main app component with routing
├── main.tsx                     # React entry point
├── styles.css                   # Global styles
└── package.json                 # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Router** - Routing

## Customization

### Adding More Colors

Edit `tailwind.config.js` to add new color options:

```javascript
colors: {
  'sticky-yellow': '#fef08a',
  'sticky-pink': '#fbcfe8',
  // Add your custom colors here
}
```

Then update the `colorOptions` array in `AddNoteForm.tsx` and `colorClasses` in `StickyNote.tsx`.

### Changing the Layout

Modify the `masonry-grid` classes in `styles.css` to adjust the number of columns at different breakpoints.

## License

MIT
