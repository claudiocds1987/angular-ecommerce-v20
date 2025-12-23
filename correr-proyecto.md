
1. nvm use 22.21.1
2. npm start

GUIA DE COMO SE INSTALÓ TAILWINDCSS FRAMEWORK VERSION 4.1:
https://tailwindcss.com/docs/installation/framework-guides/angular

Iconos descargados en: 
https://icon-sets.iconify.design/
https://icon-sets.iconify.design/heroicons/
https://svgl.app/ (para icono de Angular)


PARA ACTUALIZAR EN GITHUB PAGES:
# Paso A: Construir el proyecto indicando la subcarpeta de GitHub
ng build --configuration production --base-href /angular-ecommerce-v20/

# Paso B: Subir la carpeta construida
npx angular-cli-ghpages --dir=dist/e-commerce-v20/browser
