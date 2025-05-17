FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Set the working directory for backend
WORKDIR /app/backend

# Install backend dependencies
RUN npm install

# Expose the port
EXPOSE 8080

# Start the backend server
CMD ["node", "server.js"]
