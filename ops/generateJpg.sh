#!/bin/bash
set -x # Print all executed commands to the terminal
set -e  # Exit immediately if a command exits with a non-zero status

# Directory containing PNG files to convert
IMAGE_DIR="$HOME/Coding/adaptive-email-generator-images"

# Convert each PNG file to JPG with specified ImageMagick options
for png_file in "$IMAGE_DIR"/*.png; do
    # Generate output JPG filename by replacing .png with .jpg
    jpg_file="${png_file%.png}.jpg"

    # Perform the conversion
    magick "$png_file" -interlace Plane -strip -sampling-factor 4:2:0 -quality 90 "$jpg_file"
done
