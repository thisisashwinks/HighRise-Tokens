#!/usr/bin/env python3
"""
Script to remove the top-level "tokens" wrapper from JSON files.
This promotes all children of "tokens" to the root level.
"""

import json
import os
import sys

def remove_tokens_wrapper(file_path):
    """
    Remove the top-level "tokens" wrapper from a JSON file.
    
    Args:
        file_path (str): Path to the JSON file to process
    """
    try:
        # Read the original file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if "tokens" key exists
        if "tokens" not in data:
            print(f"No 'tokens' key found in {file_path}")
            return False
        
        # Create new structure
        new_data = {}
        
        # Add all children of "tokens" to the root level
        tokens_content = data["tokens"]
        new_data.update(tokens_content)
        
        # Preserve other top-level keys (like $metadata)
        for key, value in data.items():
            if key != "tokens":
                new_data[key] = value
        
        # Write the modified data back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully removed 'tokens' wrapper from {file_path}")
        return True
        
    except FileNotFoundError:
        print(f"Error: File {file_path} not found")
        return False
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {e}")
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process files."""
    # Default file to process
    default_file = "tokens/Semantic.json"
    
    # Check if file path is provided as argument
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = default_file
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist")
        sys.exit(1)
    
    # Process the file
    success = remove_tokens_wrapper(file_path)
    
    if success:
        print("Script completed successfully!")
    else:
        print("Script failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 