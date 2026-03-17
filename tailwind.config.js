/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        black:    '#060504',
        deep:     '#0a0806',
        panel:    '#110f0b',
        panel2:   '#161210',
        copper:   '#b87040',
        'copper-l':  '#d4956a',
        'copper-ll': '#e8b090',
        gold:     '#c8900a',
        'gold-b': '#f0b020',
        cream:    '#e8e0c8',
        grey:     '#5a5040',
        'grey-l': '#8a8070',
        olive:    '#4a6030',
        'olive-l':'#8a9e50',
        red:      '#cc2200',
        'red-b':  '#ff3311',
        green:    '#3a9948',
        cyan:     '#1ab8b0',
      },
      fontFamily: {
        display: ['"Black Ops One"', 'cursive'],
        ui:      ['Oswald', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
        body:    ['"Barlow Condensed"', 'sans-serif'],
      },
      cursor: {
        crosshair: 'crosshair',
      },
    },
  },
  plugins: [],
}
