
UI:
```bash
npm create vite@latest lifeOs --template react-ts
cd lifeOs
npm install

npm install react-router-dom axios chart.js react-chartjs-2 tailwindcss postcss autoprefixer zustand react-hook-form @heroicons/react date-fns
npm install -D @types/react-router-dom


server:```bash
# Setup Instructions
npm init -y
npm install express typescript ts-node @types/node @types/express


npm install cors dotenv jsonwebtoken bcrypt prisma pg
npm install -D typescript ts-node nodemon @types/cors @types/jsonwebtoken @types/bcrypt @types/pg

# Initialize TypeScript configuration
npx tsc --init

# Initialize Prisma
npx prisma init

npx prisma migrate dev --name init

npx prisma studio
npx prisma generate