import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import reactSvgPlugin from 'vite-plugin-react-svg';
import svgr from '@honkhonk/vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), svgr({ keepEmittedAssets: true })],
    build: {
      sourcemap: mode === 'development' ? 'inline' : false,
      minify: false,
      // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
      lib: {
        entry: path.resolve(__dirname, './src/memosIndex.ts'),
        formats: ['cjs'],
      },
      rollupOptions: {
        output: {
          // Overwrite default Vite output fileName
          entryFileNames: 'main.js',
          assetFileNames: 'styles.css',
        },
        external: ['obsidian'],
      },
      // Use root as the output dir
      emptyOutDir: false,
      outDir: '.',
    },
  };
});
