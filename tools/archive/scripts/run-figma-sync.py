#!/usr/bin/env python3
"""
HighRise Figma Sync - Easy wrapper for converting Figma components to tokens

This script provides a simple way to sync all components from your Figma file
to HighRise token JSON files.
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🚀 HighRise Figma to Tokens Sync")
    print("=" * 50)
    
    # Get script directory
    script_dir = Path(__file__).parent
    figma_script = script_dir / "figma-to-tokens.py"
    
    # Check if script exists
    if not figma_script.exists():
        print("❌ Error: figma-to-tokens.py not found!")
        sys.exit(1)
    
    # Get Figma API token
    figma_token = os.getenv('FIGMA_TOKEN')
    if not figma_token:
        print("📝 Figma API token not found in environment variables.")
        print("💡 Get your token from: https://www.figma.com/developers/api#access-tokens")
        figma_token = input("Enter your Figma API token: ").strip()
        
        if not figma_token:
            print("❌ Error: Figma API token is required!")
            sys.exit(1)
    
    # Get file key from user
    print("\n📁 Enter your Figma file information:")
    print("💡 You can find the file key in your Figma URL:")
    print("   https://www.figma.com/design/[FILE_KEY]/...")
    
    file_key = input("Enter Figma file key: ").strip()
    
    if not file_key:
        print("❌ Error: Figma file key is required!")
        sys.exit(1)
    
    # Clean up file key if it contains extra characters
    if "/" in file_key:
        file_key = file_key.split("/")[0]
    
    # Get node ID (optional)
    print("\n🎯 Target specific frame/node (optional):")
    print("💡 You can find the node ID in your Figma URL:")
    print("   https://www.figma.com/design/[FILE_KEY]/...?node-id=[NODE_ID]")
    print("💡 Leave empty to process the entire file")
    
    node_id = input("Enter node ID (optional): ").strip()
    
    # Clean up node ID if it contains extra characters
    if node_id and "%" in node_id:
        node_id = node_id.replace("%3A", ":")
    if node_id and "&" in node_id:
        node_id = node_id.split("&")[0]
    
    # Run the conversion
    print(f"\n🔄 Starting conversion for file: {file_key}")
    print("=" * 50)
    
    try:
        cmd = [
            sys.executable,
            str(figma_script),
            file_key,
            "--token", figma_token,
            "--tokens-dir", "tokens"
        ]
        
        # Add node ID if specified
        if node_id:
            cmd.extend(["--node-id", node_id])
        
        result = subprocess.run(cmd, check=True, cwd=script_dir.parent)
        
        if result.returncode == 0:
            print("\n🎉 Success! All components have been converted to tokens.")
            print("📁 Check the tokens/components/ directory for generated files.")
        else:
            print(f"\n❌ Error: Conversion failed with exit code {result.returncode}")
            sys.exit(1)
            
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error running conversion: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n⏹️  Conversion cancelled by user")
        sys.exit(0)

if __name__ == "__main__":
    main() 