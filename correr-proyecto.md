
PARA CORRER PROYECTO:
1. EJECUTAR STUDIO CODE EN MODO ADMINISTRADOR (clic derecho en el icono opcion EJECUTAR COMO ADMINISTRADOR)
2. nvm use 22.21.1
3. # para correr de local:
   npm start
  # o para correr en produccion (MonsterASP.NET https://apicomponents.runasp.net):
   npm run build

# Para correr nglint:
npm run lint

   
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

INTEGRACION DE GOOGLE  AI STUDIO (para la búsqueda de productos)

paso 1: Primero, instalé el SDK oficial para Google Generative AI: npm install @google/generative-ai
Paso 2: Entrar a Google AI Studio para obtener una API Key. (deberia logearse automaticamente con mi cuenta gmail)
Paso 3: Cree un servicio ia-search-service.ts para manejar la comunicación con la IA y le puse la API KEY.
