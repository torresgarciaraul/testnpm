import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    base: '/testnpm/', // Asegura que esto coincida con el nombre de tu repositorio
    server: {
        open: true
    }
});
