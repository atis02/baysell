module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#be2617",
          100: "#ffe4e1",
          200: "#ffcdc8",
          300: "#ffaaa2",
          400: "#fc7a6d",
          500: "#f44f3f",
          600: "#e23120",
          700: "#be2617",
          800: "#9d2317",
        },
        grey: {
          DEFAULT: "#f7f7f7",
          100: "#efefef",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#a9a9a9",
          500: "#5a5a5a",
          600: "#383838",
          700: "#2c2c2c",
        },
        black: "#070417",
        dark: "#212125",
        fullred: "#ff0000",
      },
      fontFamily: {
        bregular: ["Rubik-Regular", "sans-serif"],
        bsemibold: ["Rubik-SemiBold", "sans-serif"],
        bbold: ["Rubik-Bold", "sans-serif"],
        bitalic: ["Rubik-Italic", "sans-serif"],
        bbitalic: ["Rubik-BoldItalic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
