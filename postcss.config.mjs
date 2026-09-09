// O plugin do Tailwind só processa arquivos CSS que usam `@import "tailwindcss"`
// (hoje só src/app/admin/admin-tailwind.css). O CSS global
// do site público (src/app/globals.css) não usa essa diretiva e passa por
// este pipeline sem receber nenhuma classe utilitária do Tailwind — o
// isolamento do Tailwind ao painel administrativo é por isso, não por um
// pipeline de build separado.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
