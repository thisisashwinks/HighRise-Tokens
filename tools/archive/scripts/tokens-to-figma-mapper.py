#!/usr/bin/env python3
"""
Tokens to Figma Mapper

This script reads component token JSON files and generates a mapping file that can be used
to apply token values to Figma designs. The mapping file includes:
- Resolved token values (extracted from descriptions or resolved references)
- Instructions for which Figma properties to apply each token to
- Node identification patterns for automated application

HOW IT WORKS:
============

1. INPUT: Component token JSON file (e.g., content-switcher-item.json)
   - Contains token references like {color.background.neutral.base}
   - Contains descriptions with actual values like "#ffffff"

2. PROCESSING:
   - Extracts token paths and values from component tokens
   - Resolves token references by extracting values from descriptions
   - Maps tokens to Figma properties (fills, strokes, cornerRadius, etc.)
   - Generates instructions for applying tokens to specific node types

3. OUTPUT: Mapping JSON file with:
   - Resolved token values
   - Application instructions
   - Node matching patterns
   - Can be used by Figma plugins or manual application

USAGE:
======
python scripts/tokens-to-figma-mapper.py \
    --component tokens/mobile-components/content-switcher-item.json \
    --output figma-mappings/content-switcher-item-mapping.json
"""

import json
import os
import sys
import re
import argparse
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path


class TokenToFigmaMapper:
    def __init__(self, semantic_tokens_path: str = None, primitive_tokens_path: str = None):
        """Initialize the mapper with token reference files"""
        self.semantic_tokens = {}
        self.primitive_tokens = {}
        
        if semantic_tokens_path and os.path.exists(semantic_tokens_path):
            self.semantic_tokens = self.load_json_file(semantic_tokens_path)
        
        if primitive_tokens_path and os.path.exists(primitive_tokens_path):
            self.primitive_tokens = self.load_json_file(primitive_tokens_path)
    
    def load_json_file(self, filepath: str) -> Dict:
        """Load JSON file with error handling"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Warning: Could not load {filepath}: {e}")
            return {}
    
    def extract_value_from_description(self, description: str, token_type: str) -> Optional[str]:
        """
        Extract actual value from token description.
        Descriptions typically contain the actual value at the end.
        Examples:
        - "Mobile content switcher item selected background - gray/0 - #ffffff"
        - "Mobile content switcher item horizontal padding - 16px"
        """
        if not description:
            return None
        
        # For colors: look for hex codes (#ffffff, #FFFFFF00, etc.)
        if token_type == 'color':
            # First check for 8-digit hex (with alpha)
            hex_pattern_8 = r'#([0-9A-Fa-f]{8})'
            match_8 = re.search(hex_pattern_8, description)
            if match_8:
                return f"#{match_8.group(1)}"
            
            # Then check for 6-digit hex
            hex_pattern_6 = r'#([0-9A-Fa-f]{6})'
            match_6 = re.search(hex_pattern_6, description)
            if match_6:
                return f"#{match_6.group(1)}"
            
            # Check for "transparent" keyword
            if 'transparent' in description.lower():
                return "#FFFFFF00"
        
        # For dimensions: look for pixel values (16px, 8px, etc.)
        elif token_type in ['dimension', 'spacing']:
            px_pattern = r'(\d+(?:\.\d+)?)px'
            match = re.search(px_pattern, description)
            if match:
                return f"{match.group(1)}px"
            
            # Also check for just numbers
            num_pattern = r'(\d+(?:\.\d+)?)(?:\s|$)'
            match = re.search(num_pattern, description)
            if match:
                return f"{match.group(1)}px"
        
        # For typography: extract font info
        elif token_type == 'typography':
            # Look for patterns like "14px semibold", "12px regular"
            typo_pattern = r'(\d+)px\s+(\w+)'
            match = re.search(typo_pattern, description)
            if match:
                return {
                    'size': f"{match.group(1)}px",
                    'weight': match.group(2)
                }
        
        # For shadows: return the reference (shadows are complex)
        elif token_type == 'shadow':
            return description  # Shadows need special handling
        
        return None
    
    def resolve_token_value(self, token_ref: str, component_token: Dict) -> Tuple[Optional[str], Optional[str]]:
        """
        Resolve a token reference to its actual value.
        Returns: (resolved_value, token_type)
        
        Strategy:
        1. Extract value from description (most reliable)
        2. Try to resolve reference through semantic/primitive tokens
        3. Return None if can't resolve
        """
        # Extract token type from component token
        token_type = component_token.get('type', 'string')
        
        # First, try to extract from description
        description = component_token.get('description', '')
        extracted_value = self.extract_value_from_description(description, token_type)
        
        if extracted_value:
            return extracted_value, token_type
        
        # If description extraction failed, try to resolve the reference
        # Remove { } and split path
        ref_path = token_ref.strip('{}').split('.')
        
        # Try semantic tokens first
        current = self.semantic_tokens
        for key in ref_path:
            if isinstance(current, dict) and key in current:
                current = current[key]
                if isinstance(current, dict) and 'value' in current:
                    value = current['value']
                    token_type = current.get('type', token_type)
                    
                    # If it's another reference, try to resolve recursively
                    if isinstance(value, str) and value.startswith('{'):
                        # Try description from current token
                        desc = current.get('description', '')
                        extracted = self.extract_value_from_description(desc, token_type)
                        if extracted:
                            return extracted, token_type
                    
                    # If it's a direct value, return it
                    if not isinstance(value, str) or not value.startswith('{'):
                        return str(value), token_type
        
        # Try primitive tokens
        current = self.primitive_tokens
        for key in ref_path:
            if isinstance(current, dict) and key in current:
                current = current[key]
                if isinstance(current, dict) and 'value' in current:
                    value = current['value']
                    token_type = current.get('type', token_type)
                    
                    # Try description
                    desc = current.get('description', '')
                    extracted = self.extract_value_from_description(desc, token_type)
                    if extracted:
                        return extracted, token_type
                    
                    # If it's a direct value, return it
                    if not isinstance(value, str) or not value.startswith('{'):
                        return str(value), token_type
        
        # Last resort: return the reference itself
        return token_ref, token_type
    
    def traverse_tokens(self, obj: Dict, path: str = "", component_name: str = "") -> Dict:
        """
        Traverse component tokens and extract all token values with their paths.
        Returns a flat dictionary of token paths to resolved values.
        """
        tokens = {}
        
        if isinstance(obj, dict):
            if 'value' in obj and 'type' in obj:
                # This is a token definition
                token_value = obj['value']
                token_type = obj['type']
                
                # Resolve the token value
                if isinstance(token_value, str) and token_value.startswith('{'):
                    resolved_value, resolved_type = self.resolve_token_value(token_value, obj)
                    tokens[path] = {
                        'value': resolved_value,
                        'type': resolved_type,
                        'reference': token_value,
                        'description': obj.get('description', ''),
                        'figma_property': self.map_to_figma_property(path, resolved_type)
                    }
                else:
                    # Direct value
                    tokens[path] = {
                        'value': token_value,
                        'type': token_type,
                        'reference': None,
                        'description': obj.get('description', ''),
                        'figma_property': self.map_to_figma_property(path, token_type)
                    }
            else:
                # Continue traversing
                for key, value in obj.items():
                    new_path = f"{path}.{key}" if path else key
                    tokens.update(self.traverse_tokens(value, new_path, component_name))
        
        return tokens
    
    def map_to_figma_property(self, token_path: str, token_type: str) -> Dict:
        """
        Map token path to Figma property names.
        Returns a dictionary with Figma property mappings.
        """
        path_lower = token_path.lower()
        
        # Color mappings
        if token_type == 'color':
            if 'background' in path_lower:
                return {
                    'property': 'fills',
                    'type': 'SOLID',
                    'target': 'container'
                }
            elif 'border' in path_lower or 'stroke' in path_lower:
                return {
                    'property': 'strokes',
                    'type': 'SOLID',
                    'target': 'container'
                }
            elif 'text' in path_lower:
                return {
                    'property': 'fills',
                    'type': 'SOLID',
                    'target': 'text'
                }
            elif 'icon' in path_lower:
                return {
                    'property': 'fills',
                    'type': 'SOLID',
                    'target': 'icon'
                }
            elif 'subtext' in path_lower:
                return {
                    'property': 'fills',
                    'type': 'SOLID',
                    'target': 'subtext'
                }
        
        # Dimension mappings
        elif token_type == 'dimension':
            if 'radius' in path_lower or 'corner' in path_lower:
                return {
                    'property': 'cornerRadius',
                    'target': 'container'
                }
            elif 'padding' in path_lower:
                if 'horizontal' in path_lower:
                    return {
                        'property': 'paddingLeft',
                        'target': 'container'
                    }
                elif 'vertical' in path_lower:
                    return {
                        'property': 'paddingTop',
                        'target': 'container'
                    }
            elif 'gap' in path_lower:
                return {
                    'property': 'itemSpacing',
                    'target': 'container'
                }
            elif 'size' in path_lower or 'width' in path_lower or 'height' in path_lower:
                if 'icon' in path_lower:
                    return {
                        'property': 'width',
                        'target': 'icon',
                        'also': 'height'  # Icons are usually square
                    }
                elif 'badge' in path_lower:
                    return {
                        'property': 'width',
                        'target': 'badge',
                        'also': 'height'  # Badges are usually square
                    }
                else:
                    return {
                        'property': 'width',
                        'target': 'container'
                    }
        
        # Typography mappings
        elif token_type == 'typography':
            return {
                'property': 'fontName',
                'target': 'text'
            }
        
        # Shadow mappings
        elif token_type == 'shadow':
            return {
                'property': 'effects',
                'target': 'container'
            }
        
        return {
            'property': 'unknown',
            'target': 'unknown'
        }
    
    def generate_mapping_file(self, component_tokens: Dict, component_name: str) -> Dict:
        """
        Generate the complete mapping file structure.
        """
        # Extract all tokens
        all_tokens = {}
        for key, value in component_tokens.items():
            if isinstance(value, dict):
                tokens = self.traverse_tokens(value, key, component_name)
                all_tokens.update(tokens)
        
        # Generate application instructions based on component structure
        instructions = self.generate_application_instructions(component_tokens, component_name)
        
        # Create the mapping structure
        mapping = {
            "component": component_name,
            "version": "1.0.0",
            "description": f"Figma mapping for {component_name} component tokens",
            "tokens": all_tokens,
            "instructions": instructions,
            "node_matching": {
                "selected": {
                    "patterns": [
                        "State=Selected",
                        "state=selected",
                        "Selected",
                        "selected=true"
                    ],
                    "data_attribute": "data-name"
                },
                "default": {
                    "patterns": [
                        "State=Unselected",
                        "State=Default",
                        "state=unselected",
                        "state=default",
                        "Unselected",
                        "Default"
                    ],
                    "data_attribute": "data-name"
                }
            },
            "application_guide": {
                "container": {
                    "background": "Apply to frame.fills[0]",
                    "border": "Apply to frame.strokes[0]",
                    "borderRadius": "Apply to frame.cornerRadius",
                    "padding": "Apply to frame.paddingLeft/Right/Top/Bottom",
                    "shadow": "Apply to frame.effects"
                },
                "text": {
                    "color": "Apply to textNode.fills[0]",
                    "typography": "Apply to textNode.fontName, fontSize, fontWeight"
                },
                "icon": {
                    "color": "Apply to iconNode.fills[0]",
                    "size": "Apply to iconNode.width/height"
                }
            }
        }
        
        return mapping
    
    def generate_application_instructions(self, component_tokens: Dict, component_name: str) -> Dict:
        """
        Generate structured instructions for applying tokens to Figma nodes.
        """
        instructions = {}
        
        # Extract state-based instructions
        if 'color' in component_tokens.get(component_name, {}):
            color_tokens = component_tokens[component_name]['color']
            
            for state in ['selected', 'default']:
                if state in color_tokens:
                    state_tokens = color_tokens[state]
                    instructions[state] = {
                        "container": {
                            "background": self.get_token_path(state_tokens, 'background'),
                            "border": self.get_token_path(state_tokens, 'border')
                        },
                        "text": {
                            "color": self.get_token_path(state_tokens, 'text')
                        },
                        "icon": {
                            "color": self.get_token_path(state_tokens, 'icon')
                        },
                        "subtext": {
                            "color": self.get_token_path(state_tokens, 'subtext')
                        }
                    }
        
        # Add typography instructions
        if 'typography' in component_tokens.get(component_name, {}):
            typo_tokens = component_tokens[component_name]['typography']
            if 'label' in typo_tokens:
                if 'selected' in typo_tokens['label']:
                    instructions.setdefault('selected', {})['text'] = instructions.get('selected', {}).get('text', {})
                    instructions['selected']['text']['typography'] = f"{component_name}.typography.label.selected"
                if 'default' in typo_tokens['label']:
                    instructions.setdefault('default', {})['text'] = instructions.get('default', {}).get('text', {})
                    instructions['default']['text']['typography'] = f"{component_name}.typography.label.default"
            
            if 'subtext' in typo_tokens:
                for state in ['selected', 'default']:
                    if state in instructions:
                        instructions[state]['subtext'] = instructions[state].get('subtext', {})
                        instructions[state]['subtext']['typography'] = f"{component_name}.typography.subtext"
        
        # Add spacing instructions
        if 'padding' in component_tokens.get(component_name, {}):
            padding_tokens = component_tokens[component_name]['padding']
            for state in ['selected', 'default']:
                if state in instructions:
                    instructions[state]['container'] = instructions[state].get('container', {})
                    instructions[state]['container']['padding'] = {
                        "horizontal": f"{component_name}.padding.horizontal",
                        "vertical": f"{component_name}.padding.vertical"
                    }
        
        # Add border radius
        if 'border' in component_tokens.get(component_name, {}):
            border_tokens = component_tokens[component_name]['border']
            if 'radius' in border_tokens:
                for state in ['selected', 'default']:
                    if state in instructions:
                        instructions[state]['container'] = instructions[state].get('container', {})
                        instructions[state]['container']['borderRadius'] = f"{component_name}.border.radius"
        
        # Add shadow
        if 'shadow' in component_tokens.get(component_name, {}):
            for state in ['selected', 'default']:
                if state in instructions:
                    instructions[state]['container'] = instructions[state].get('container', {})
                    instructions[state]['container']['shadow'] = f"{component_name}.shadow"
        
        # Add sizing
        if 'sizing' in component_tokens.get(component_name, {}):
            sizing_tokens = component_tokens[component_name]['sizing']
            for state in ['selected', 'default']:
                if state in instructions:
                    if 'icon' in sizing_tokens:
                        instructions[state]['icon'] = instructions[state].get('icon', {})
                        instructions[state]['icon']['size'] = f"{component_name}.sizing.icon"
        
        return instructions
    
    def get_token_path(self, tokens: Dict, key: str) -> Optional[str]:
        """Get the token path for a given key"""
        if key in tokens and 'value' in tokens[key]:
            return tokens[key].get('reference', tokens[key]['value'])
        return None
    
    def process_component_file(self, component_file_path: str, output_path: str = None) -> bool:
        """
        Process a component token file and generate the mapping file.
        """
        print(f"📖 Reading component tokens from: {component_file_path}")
        
        # Load component tokens
        component_tokens = self.load_json_file(component_file_path)
        if not component_tokens:
            print(f"❌ Error: Could not load component tokens from {component_file_path}")
            return False
        
        # Extract component name (first key in the JSON, skip metadata keys)
        component_keys = [k for k in component_tokens.keys() if not k.startswith('$')]
        if not component_keys:
            print(f"❌ Error: No valid component found (only metadata keys)")
            return False
        
        component_name = component_keys[0]
        print(f"✅ Found component: {component_name}")
        
        # Generate mapping
        print("🔄 Generating mapping file...")
        mapping = self.generate_mapping_file(component_tokens, component_name)
        
        # Determine output path
        if not output_path:
            component_dir = os.path.dirname(component_file_path)
            output_dir = os.path.join(component_dir, '..', 'figma-mappings')
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f"{component_name}-mapping.json")
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save mapping file
        print(f"💾 Saving mapping to: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully generated mapping file!")
        print(f"\n📊 Summary:")
        print(f"   - Component: {component_name}")
        print(f"   - Total tokens: {len(mapping['tokens'])}")
        print(f"   - States: {list(mapping['instructions'].keys())}")
        
        return True


def main():
    parser = argparse.ArgumentParser(
        description='Generate Figma mapping file from component tokens',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  python scripts/tokens-to-figma-mapper.py \\
      --component tokens/mobile-components/content-switcher-item.json

  # With custom output
  python scripts/tokens-to-figma-mapper.py \\
      --component tokens/mobile-components/content-switcher-item.json \\
      --output figma-mappings/my-mapping.json

  # With semantic/primitive token references
  python scripts/tokens-to-figma-mapper.py \\
      --component tokens/mobile-components/content-switcher-item.json \\
      --semantic tokens/Semantics/Semantic.json \\
      --primitive tokens/Primitive.json
        """
    )
    
    parser.add_argument(
        '--component',
        required=True,
        help='Path to component token JSON file'
    )
    parser.add_argument(
        '--output',
        help='Output path for mapping file (default: figma-mappings/{component-name}-mapping.json)'
    )
    parser.add_argument(
        '--semantic',
        default='tokens/Semantics/Semantic.json',
        help='Path to semantic tokens JSON file (for reference resolution)'
    )
    parser.add_argument(
        '--primitive',
        default='tokens/Primitive.json',
        help='Path to primitive tokens JSON file (for reference resolution)'
    )
    
    args = parser.parse_args()
    
    # Check if component file exists
    if not os.path.exists(args.component):
        print(f"❌ Error: Component file not found: {args.component}")
        sys.exit(1)
    
    # Initialize mapper
    mapper = TokenToFigmaMapper(
        semantic_tokens_path=args.semantic,
        primitive_tokens_path=args.primitive
    )
    
    # Process component file
    success = mapper.process_component_file(args.component, args.output)
    
    if success:
        print("\n💡 Next steps:")
        print("   1. Review the generated mapping file")
        print("   2. Use a Figma plugin (like 'Design Tokens' or custom plugin) to apply tokens")
        print("   3. Or manually apply tokens using the instructions in the mapping file")
        sys.exit(0)
    else:
        print("\n❌ Failed to generate mapping file")
        sys.exit(1)


if __name__ == "__main__":
    main()

