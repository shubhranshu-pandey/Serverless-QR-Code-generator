# Use the official nginx image to serve static files
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy static site into nginx html folder
COPY . /usr/share/nginx/html/

# Ensure nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]
