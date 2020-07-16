import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/Writer.js',
  output: [
    {
      file: "dist/Writer.js",
      format: "esm"
    },
    {
      file: "dist/Writer.min.js",
      format: "esm",
      plugins: [terser()]
    },
  ]
};
