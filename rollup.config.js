import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version } = require('./package.json');

export default {
  input: 'src/arr-media-carrd.ts',
  output: {
    file: 'dist/arr-media-carrd.js',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    replace({
      __VERSION__: version,
      preventAssignment: true,
      delimiters: ['', ''],
    }),
    resolve(),
    typescript(),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
