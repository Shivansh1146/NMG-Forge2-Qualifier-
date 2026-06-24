FROM php:8.2-cli

# Install system dependencies and SQLite extensions
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy all application files
COPY . .

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Create the SQLite database file
RUN touch database/database.sqlite

# Run database migrations and seeders
RUN php artisan migrate:refresh --seed --force

# Expose the port Render assigns
EXPOSE 8000

# Start the Laravel development server on the assigned port
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
