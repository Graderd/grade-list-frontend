#!/bin/sh
set -e

API_URL="${API_URL:-http://api.home}"
export API_URL

envsubst '${API_URL}' \
  < /usr/share/nginx/html/js/config.template.js \
  > /usr/share/nginx/html/js/config.js

echo "Frontend configurado con API_URL=$API_URL"