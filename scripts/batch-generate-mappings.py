#!/usr/bin/env python3
"""
Batch Generate Figma Mappings for All Components

This script processes ALL component token files and generates mapping files for each.
Use this to prepare all components for automatic token application in Figma.

Usage:
    python3 scripts/batch-generate-mappings.py
    python3 scripts/batch-generate-mappings.py --mobile-only
    python3 scripts/batch-generate-mappings.py --web-only
"""

import os
import sys
import argparse
import importlib.util
from pathlib import Path

# Import TokenToFigmaMapper from the tokens-to-figma-mapper script
script_dir = os.path.dirname(os.path.abspath(__file__))
mapper_path = os.path.join(script_dir, 'tokens-to-figma-mapper.py')
spec = importlib.util.spec_from_file_location("tokens_to_figma_mapper", mapper_path)
mapper_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mapper_module)
TokenToFigmaMapper = mapper_module.TokenToFigmaMapper


def find_component_files(base_dir: str) -> list:
    """Find all component token JSON files"""
    component_files = []
    base_path = Path(base_dir)
    
    if not base_path.exists():
        return []
    
    # Find all JSON files (excluding template files)
    for json_file in base_path.rglob("*.json"):
        # Skip template files
        if "template" in json_file.name.lower():
            continue
        
        # Skip mapping files
        if "mapping" in json_file.name.lower():
            continue
        
        component_files.append(str(json_file))
    
    return sorted(component_files)


def batch_generate_mappings(
    mobile_dir: str = "tokens/mobile-components",
    web_dir: str = "tokens/web-components",
    output_base: str = "figma-mappings",
    semantic_path: str = "tokens/Semantics/Semantic.json",
    primitive_path: str = "tokens/Primitive.json",
    mobile_only: bool = False,
    web_only: bool = False
):
    """Generate mapping files for all component tokens"""
    
    # Initialize mapper
    mapper = TokenToFigmaMapper(
        semantic_tokens_path=semantic_path if os.path.exists(semantic_path) else None,
        primitive_tokens_path=primitive_path if os.path.exists(primitive_path) else None
    )
    
    # Find component files
    all_files = []
    
    if not web_only:
        mobile_files = find_component_files(mobile_dir)
        # Filter out invalid component files (those starting with $comment or other metadata)
        mobile_files = [f for f in mobile_files if not os.path.basename(f).startswith('$')]
        all_files.extend([(f, "mobile") for f in mobile_files])
        print(f"📱 Found {len(mobile_files)} mobile component files")
    
    if not mobile_only:
        web_files = find_component_files(web_dir)
        # Filter out invalid component files
        web_files = [f for f in web_files if not os.path.basename(f).startswith('$')]
        all_files.extend([(f, "web") for f in web_files])
        print(f"🌐 Found {len(web_files)} web component files")
    
    total_files = len(all_files)
    print(f"\n🚀 Processing {total_files} component files...\n")
    
    # Process each file
    successful = 0
    failed = 0
    failed_files = []
    
    for idx, (component_file, platform) in enumerate(all_files, 1):
        print(f"[{idx}/{total_files}] Processing: {component_file}")
        
        try:
            # Determine output path
            component_name = Path(component_file).stem
            output_dir = os.path.join(output_base, platform)
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"{component_name}-mapping.json")
            
            # Generate mapping
            success = mapper.process_component_file(component_file, output_path)
            
            if success:
                successful += 1
                print(f"   ✅ Success\n")
            else:
                failed += 1
                failed_files.append(component_file)
                print(f"   ❌ Failed\n")
        
        except Exception as e:
            failed += 1
            failed_files.append(component_file)
            print(f"   ❌ Error: {e}\n")
    
    # Summary
    print("=" * 60)
    print("📊 Batch Processing Summary")
    print("=" * 60)
    print(f"✅ Successful: {successful}/{total_files}")
    print(f"❌ Failed: {failed}/{total_files}")
    
    if failed_files:
        print(f"\n⚠️  Failed files:")
        for file in failed_files:
            print(f"   - {file}")
    
    # Generate index file
    generate_index_file(output_base, successful)
    
    print(f"\n💡 Next steps:")
    print(f"   1. Review generated mappings in: {output_base}/")
    print(f"   2. Use the Figma plugin to apply tokens automatically")
    print(f"   3. See scripts/FIGMA_PLUGIN_SETUP.md for plugin setup")


def generate_index_file(output_base: str, count: int):
    """Generate an index file listing all mappings"""
    index = {
        "version": "1.0.0",
        "generated_at": __import__('datetime').datetime.now().isoformat(),
        "total_mappings": count,
        "mappings": {}
    }
    
    # Scan for mapping files
    base_path = Path(output_base)
    if base_path.exists():
        for mapping_file in base_path.rglob("*-mapping.json"):
            platform = mapping_file.parent.name
            component_name = mapping_file.stem.replace("-mapping", "")
            
            if platform not in index["mappings"]:
                index["mappings"][platform] = []
            
            index["mappings"][platform].append({
                "component": component_name,
                "file": str(mapping_file.relative_to(output_base))
            })
    
    # Save index
    index_path = os.path.join(output_base, "index.json")
    import json
    with open(index_path, 'w') as f:
        json.dump(index, f, indent=2)
    
    print(f"\n📑 Generated index file: {index_path}")


def main():
    parser = argparse.ArgumentParser(
        description='Batch generate Figma mapping files for all components',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--mobile-dir',
        default='tokens/mobile-components',
        help='Directory containing mobile component tokens'
    )
    parser.add_argument(
        '--web-dir',
        default='tokens/web-components',
        help='Directory containing web component tokens'
    )
    parser.add_argument(
        '--output',
        default='figma-mappings',
        help='Output directory for mapping files'
    )
    parser.add_argument(
        '--semantic',
        default='tokens/Semantics/Semantic.json',
        help='Path to semantic tokens file'
    )
    parser.add_argument(
        '--primitive',
        default='tokens/Primitive.json',
        help='Path to primitive tokens file'
    )
    parser.add_argument(
        '--mobile-only',
        action='store_true',
        help='Process only mobile components'
    )
    parser.add_argument(
        '--web-only',
        action='store_true',
        help='Process only web components'
    )
    
    args = parser.parse_args()
    
    if args.mobile_only and args.web_only:
        print("❌ Error: Cannot use --mobile-only and --web-only together")
        sys.exit(1)
    
    batch_generate_mappings(
        mobile_dir=args.mobile_dir,
        web_dir=args.web_dir,
        output_base=args.output,
        semantic_path=args.semantic,
        primitive_path=args.primitive,
        mobile_only=args.mobile_only,
        web_only=args.web_only
    )


if __name__ == "__main__":
    # Import the mapper class
    sys.path.insert(0, os.path.dirname(__file__))
    main()

