#!/bin/bash
# Remove invalid wait commands from Maestro files

echo "Removing invalid 'wait' commands from Maestro user behavior files..."

# Find all YAML files in user-behaviors directory
for file in .maestro/user-behaviors/*.yml; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        # Remove lines that contain '- wait:' followed by a number
        sed -i '' '/^[[:space:]]*- wait:[[:space:]]*[0-9]/d' "$file"
        # Also remove any comment lines that were associated with wait commands
        sed -i '' '/^[[:space:]]*# .* wait/d' "$file"
    fi
done

echo "Done! All wait commands have been removed."
