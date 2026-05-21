#!/bin/sh
set -e

# Run migrations if we are starting the main web server
if [ "$1" = "php-fpm" ]; then
    echo "Running database migrations..."
    php artisan migrate --force

    echo "Clearing caches..."
    php artisan optimize:clear
    
    # Optionally cache configs in production
    # php artisan config:cache
    # php artisan route:cache
    # php artisan view:cache
fi

exec "$@"
