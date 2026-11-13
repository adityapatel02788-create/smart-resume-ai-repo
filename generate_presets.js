const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'assets', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. 50+ Templates with taxonomies
const categories = ['Tech/Engineering', 'Creative/Portfolio', 'Academic', 'C-Suite/Executive', 'Legal', 'Finance', 'Startup', 'Healthcare', 'Minimalist'];
const templates = [];
const adjectives = ['Dynamic', 'Compact', 'Spacious', 'Sleek', 'Vibrant', 'Muted', 'Sharp', 'Rounded', 'Classic', 'Neo', 'Retro', 'Pro', 'Elite', 'Prime', 'Ultra', 'Core', 'Aura', 'Nova', 'Zen', 'Pulse', 'Impact', 'Focus', 'Base', 'Flow', 'Grid', 'Edge', 'Wave'];
const nouns = ['Grid', 'Flow', 'Block', 'Line', 'Wave', 'Shift', 'Edge', 'Space', 'Focus', 'Base', 'Standard', 'Plus', 'Max', 'Pro', 'Lite'];

let idCounter = 1;
for (let i = 0; i < categories.length; i++) {
    for(let j = 0; j < 6; j++) {
        let name = `${adjectives[(i*6 + j) % adjectives.length]} ${nouns[(i*6 + j + 3) % nouns.length]}`;
        templates.push({
            id: `tpl_${idCounter}`,
            name: name,
            category: categories[i],
            tag: categories[i],
            badgeColor: ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'][i % 6],
            desc: `A highly optimized ${categories[i].toLowerCase()} resume template featuring ${name.toLowerCase()} design elements.`,
            pills: ['Clean', 'ATS Optimized', 'Responsive']
        });
        idCounter++;
    }
}
// Ensure we have at least 50
fs.writeFileSync(path.join(dataDir, 'templates.json'), JSON.stringify(templates, null, 2));


// 2. 50+ Typography Styles
const fontCategories = ['Serif', 'Sans-Serif', 'Monospace', 'Display'];
const fonts = [
    // Serif (Editorial, Literary, Classic, Didone, Academic)
    { id: 'Merriweather', name: 'Merriweather', category: 'Serif', tags: ['Classic'] },
    { id: 'Playfair Display', name: 'Playfair Display', category: 'Serif', tags: ['Editorial'] },
    { id: 'Lora', name: 'Lora', category: 'Serif', tags: ['Literary'] },
    { id: 'PT Serif', name: 'PT Serif', category: 'Serif', tags: ['Academic'] },
    { id: 'Noto Serif', name: 'Noto Serif', category: 'Serif', tags: ['Classic'] },
    { id: 'Crimson Text', name: 'Crimson Text', category: 'Serif', tags: ['Academic'] },
    { id: 'EB Garamond', name: 'EB Garamond', category: 'Serif', tags: ['Classic'] },
    { id: 'Libre Baskerville', name: 'Libre Baskerville', category: 'Serif', tags: ['Editorial'] },
    { id: 'Cormorant Garamond', name: 'Cormorant Garamond', category: 'Serif', tags: ['Didone'] },
    { id: 'Bitter', name: 'Bitter', category: 'Serif', tags: ['Contemporary'] },
    { id: 'Tinos', name: 'Tinos', category: 'Serif', tags: ['Academic'] },
    { id: 'Domine', name: 'Domine', category: 'Serif', tags: ['Bold'] },
    { id: 'Vollkorn', name: 'Vollkorn', category: 'Serif', tags: ['Literary'] },
    
    // Sans-Serif (Modern Neo-Grotesque, Geometric, Humanist, Tech)
    { id: 'Inter', name: 'Inter', category: 'Sans-Serif', tags: ['Tech', 'Neo-Grotesque'] },
    { id: 'Roboto', name: 'Roboto', category: 'Sans-Serif', tags: ['Tech', 'Neo-Grotesque'] },
    { id: 'Open Sans', name: 'Open Sans', category: 'Sans-Serif', tags: ['Humanist'] },
    { id: 'Lato', name: 'Lato', category: 'Sans-Serif', tags: ['Modern'] },
    { id: 'Montserrat', name: 'Montserrat', category: 'Sans-Serif', tags: ['Geometric'] },
    { id: 'Oswald', name: 'Oswald', category: 'Sans-Serif', tags: ['Display', 'Geometric'] },
    { id: 'Source Sans Pro', name: 'Source Sans Pro', category: 'Sans-Serif', tags: ['Humanist'] },
    { id: 'Raleway', name: 'Raleway', category: 'Sans-Serif', tags: ['Geometric'] },
    { id: 'PT Sans', name: 'PT Sans', category: 'Sans-Serif', tags: ['Humanist'] },
    { id: 'Noto Sans', name: 'Noto Sans', category: 'Sans-Serif', tags: ['Modern'] },
    { id: 'Nunito', name: 'Nunito', category: 'Sans-Serif', tags: ['Rounded'] },
    { id: 'Work Sans', name: 'Work Sans', category: 'Sans-Serif', tags: ['Grotesque'] },
    { id: 'Fira Sans', name: 'Fira Sans', category: 'Sans-Serif', tags: ['Tech'] },
    { id: 'Quicksand', name: 'Quicksand', category: 'Sans-Serif', tags: ['Geometric'] },
    { id: 'Barlow', name: 'Barlow', category: 'Sans-Serif', tags: ['Tech'] },
    { id: 'Mulish', name: 'Mulish', category: 'Sans-Serif', tags: ['Minimalist'] },
    { id: 'DM Sans', name: 'DM Sans', category: 'Sans-Serif', tags: ['Geometric'] },
    { id: 'Manrope', name: 'Manrope', category: 'Sans-Serif', tags: ['Modern'] },
    { id: 'Outfit', name: 'Outfit', category: 'Sans-Serif', tags: ['Geometric'] },
    { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Sans-Serif', tags: ['Tech'] },
    
    // Monospace (Tech)
    { id: 'Inconsolata', name: 'Inconsolata', category: 'Monospace', tags: ['Tech'] },
    { id: 'Fira Code', name: 'Fira Code', category: 'Monospace', tags: ['Tech'] },
    { id: 'Source Code Pro', name: 'Source Code Pro', category: 'Monospace', tags: ['Tech'] },
    { id: 'IBM Plex Mono', name: 'IBM Plex Mono', category: 'Monospace', tags: ['Tech'] },
    { id: 'Ubuntu Mono', name: 'Ubuntu Mono', category: 'Monospace', tags: ['Tech'] },
    { id: 'Space Mono', name: 'Space Mono', category: 'Monospace', tags: ['Tech'] },
    
    // Display
    { id: 'Concert One', name: 'Concert One', category: 'Display', tags: ['Bold'] },
    { id: 'Rubik', name: 'Rubik', category: 'Display', tags: ['Rounded'] },
    { id: 'Teko', name: 'Teko', category: 'Display', tags: ['Compact'] },
    { id: 'Bebas Neue', name: 'Bebas Neue', category: 'Display', tags: ['Tall'] },
    { id: 'Righteous', name: 'Righteous', category: 'Display', tags: ['Modern'] },
    { id: 'Cinzel', name: 'Cinzel', category: 'Display', tags: ['Classic'] },
    { id: 'Syne', name: 'Syne', category: 'Display', tags: ['Avant Garde'] }
];
// Duplicate some to reach 50+ if needed (currently 46, let's add a few more)
const additionalFonts = ['Heebo', 'Josefin Sans', 'Anton', 'Varela Round', 'Cabin'];
additionalFonts.forEach(f => fonts.push({ id: f, name: f, category: 'Sans-Serif', tags: ['Modern'] }));

fs.writeFileSync(path.join(dataDir, 'fonts.json'), JSON.stringify(fonts, null, 2));


// 3. 50+ Writing Styles
const writingStylesArray = [
    "professional", "persuasive", "analytical", "concise", "narrative",
    "conversational", "technical", "formal", "visionary", "assertive",
    "empathetic", "academic", "results_driven", "strategic", "authoritative",
    "humorous", "direct", "creative", "enthusiastic", "confident",
    "objective", "subjective", "instructive", "inspirational", "provocative",
    "philosophical", "pragmatic", "diplomatic", "candid", "respectful",
    "thoughtful", "urgent", "casual", "quirky", "bold",
    "data_driven", "storytelling", "minimalist", "comprehensive", "poetic",
    "journalistic", "consultative", "coaching", "mentoring", "pioneering",
    "rebellious", "unconventional", "traditional", "futuristic", "nostalgic",
    "friendly", "warm", "crisp", "punchy", "eloquent"
];
const writingStyles = writingStylesArray.map(s => {
    return {
        id: s,
        name: s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        desc: `A ${s.replace('_', ' ')} tone.`
    };
});
fs.writeFileSync(path.join(dataDir, 'writingStyles.json'), JSON.stringify(writingStyles, null, 2));

console.log('Presets generated successfully!');
