FROM node:lts
WORKDIR /app
COPY packages/server/package*.json ./packages/server/
RUN cd packages/server && npm install
COPY . .
EXPOSE 3001
CMD ["cd", "packages/server", "&&", "npm", "run", "dev"]