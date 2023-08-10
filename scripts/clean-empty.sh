#!/bin/bash

# Function to check if a directory only contains node_modules
function contains_only_node_modules {
    # Check if the directory contains only one subdirectory
    if [ $(find "$1" -mindepth 1 -maxdepth 1 -type d | wc -l) -eq 1 ]; then
        # Check if the subdirectory is named "node_modules"
        if [ -d "$1/node_modules" ]; then
            return 0
        fi
    fi

    return 1
}

# Prompt for the parent folder path
read -p "Enter the parent folder path: " parent_folder_path

# Check if the parent folder exists
if [ ! -d "$parent_folder_path" ]; then
    echo "Parent folder does not exist."
    exit 1
fi

# Loop through the child folders
for child_folder in "$parent_folder_path"/*; do
    if [ -d "$child_folder" ]; then
        # Check if the child folder only contains node_modules
        if contains_only_node_modules "$child_folder"; then
            # Delete the child folder
            rm -rf "$child_folder"
            echo "Deleted folder: $child_folder"
        fi
    fi
done