FROM node:18-alpine

WORKDIR /app

# Copy all project files into the container
COPY . .

# Install all dependencies (backend and frontend)
RUN npm install

# Build the frontend for production
RUN npm run build

# Hugging Face Spaces requires port 7860 by default, but we allow environment variables
ENV PORT=7860
EXPOSE 7860
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
