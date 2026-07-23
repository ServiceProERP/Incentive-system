import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    "bg-yellow-100", "text-yellow-700",
    "bg-blue-100",   "text-blue-700",
    "bg-green-100",  "text-green-700",
    "bg-gray-100",   "text-gray-700",
    "bg-red-100",    "text-red-700",
    "bg-purple-100", "text-purple-700",
  ],
};
export default config;
