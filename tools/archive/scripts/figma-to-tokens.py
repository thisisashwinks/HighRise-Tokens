#!/usr/bin/env python3
"""
Figma to HighRise Tokens Generator

This script fetches all components from a Figma file and converts them into
HighRise design token JSON files following the established token hierarchy.
"""

import json
import os
import sys
import requests
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import argparse

class FigmaToTokensGenerator:
    def __init__(self, figma_token: str, tokens_dir: str = "tokens"):
        self.figma_token = figma_token
        self.tokens_dir = tokens_dir
        self.headers = {
            'X-Figma-Token': figma_token,
            'Content-Type': 'application/json'
        }
        
        # Load existing tokens for reference
        self.primitive_tokens = self.load_json_file(f"{tokens_dir}/primitive/Default.json")
        self.semantic_tokens = self.load_json_file(f"{tokens_dir}/Semantic.json")
        
        # Component mapping for variants and states
        self.component_variants = {
            'button': ['primary', 'secondary', 'tertiary', 'destructive', 'ghost', 'link'],
            'tag': ['primary', 'secondary', 'tertiary', 'error', 'warning', 'success', 'info'],
            'badge': ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
            'alert': ['info', 'success', 'warning', 'error'],
            'input': ['default', 'error', 'success', 'warning'],
            'card': ['default', 'elevated', 'outlined']
        }
        
        self.component_states = {
            'default': ['default', 'hover', 'active', 'focused', 'disabled'],
            'interactive': ['default', 'hover', 'active', 'focused', 'disabled', 'loading'],
            'form': ['default', 'hover', 'focused', 'disabled', 'error', 'success']
        }
        
    def load_json_file(self, filepath: str) -> Dict:
        """Load JSON file with error handling"""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load {filepath}: {e}")
            return {}
    
    def fetch_figma_file(self, file_key: str) -> Optional[Dict]:
        """Fetch the complete Figma file data"""
        url = f"https://api.figma.com/v1/files/{file_key}"
        
        try:
            print(f"📡 Fetching Figma file: {file_key}")
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Successfully fetched file: {data.get('name', 'Unknown')}")
            return data
            
        except requests.RequestException as e:
            print(f"❌ Error fetching Figma file: {e}")
            if hasattr(e, 'response') and e.response is not None:
                if e.response.status_code == 400:
                    print("💡 Tip: Check if your file key is correct and the file is accessible")
                elif e.response.status_code == 403:
                    print("💡 Tip: Check if your Figma API token has access to this file")
            return None
    
    def fetch_figma_nodes(self, file_key: str, node_ids: List[str]) -> Optional[Dict]:
        """Fetch specific nodes from a Figma file"""
        node_ids_str = ','.join(node_ids)
        url = f"https://api.figma.com/v1/files/{file_key}/nodes?ids={node_ids_str}"
        
        try:
            print(f"📡 Fetching specific nodes: {node_ids_str}")
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Successfully fetched {len(data.get('nodes', {}))} nodes")
            return data
            
        except requests.RequestException as e:
            print(f"❌ Error fetching Figma nodes: {e}")
            if hasattr(e, 'response') and e.response is not None:
                if e.response.status_code == 400:
                    print("💡 Tip: Check if your node IDs are correct")
                elif e.response.status_code == 403:
                    print("💡 Tip: Check if your Figma API token has access to this file")
            return None
    
    def fetch_component_sets(self, file_key: str) -> Optional[Dict]:
        """Fetch component sets from Figma file"""
        url = f"https://api.figma.com/v1/files/{file_key}/component_sets"
        
        try:
            print(f"📡 Fetching component sets from: {file_key}")
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Found {len(data.get('component_sets', {}))} component sets")
            return data
            
        except requests.RequestException as e:
            print(f"❌ Error fetching component sets: {e}")
            return None
    
    def extract_components_from_node(self, node: Dict, components: Optional[List[Dict]] = None) -> List[Dict]:
        """Recursively extract components from Figma node tree"""
        if components is None:
            components = []
        
        # Check if current node is a component
        if node.get('type') == 'COMPONENT':
            components.append({
                'id': node['id'],
                'name': node['name'],
                'type': node['type'],
                'properties': node.get('componentPropertyDefinitions', {}),
                'styles': self.extract_styles(node),
                'children': node.get('children', [])
            })
        
        # Check if current node is a component set
        elif node.get('type') == 'COMPONENT_SET':
            components.append({
                'id': node['id'],
                'name': node['name'],
                'type': node['type'],
                'properties': node.get('componentPropertyDefinitions', {}),
                'variants': self.extract_variants(node),
                'children': node.get('children', [])
            })
        
        # Recursively process children
        for child in node.get('children', []):
            self.extract_components_from_node(child, components)
        
        return components
    
    def extract_styles(self, node: Dict) -> Dict:
        """Extract style information from a Figma node"""
        styles = {}
        
        # Extract fills (background colors)
        if 'fills' in node:
            styles['fills'] = node['fills']
        
        # Extract strokes (borders)
        if 'strokes' in node:
            styles['strokes'] = node['strokes']
        
        # Extract effects (shadows, blurs)
        if 'effects' in node:
            styles['effects'] = node['effects']
        
        # Extract layout properties
        if 'layoutAlign' in node:
            styles['layoutAlign'] = node['layoutAlign']
        
        if 'layoutGrow' in node:
            styles['layoutGrow'] = node['layoutGrow']
        
        # Extract constraints
        if 'constraints' in node:
            styles['constraints'] = node['constraints']
        
        # Extract absolute bounding box for sizing
        if 'absoluteBoundingBox' in node:
            bbox = node['absoluteBoundingBox']
            styles['size'] = {
                'width': bbox['width'],
                'height': bbox['height']
            }
        
        return styles
    
    def extract_variants(self, component_set: Dict) -> List[Dict]:
        """Extract variant information from component set"""
        variants = []
        
        for child in component_set.get('children', []):
            if child.get('type') == 'COMPONENT':
                variant_info = {
                    'id': child['id'],
                    'name': child['name'],
                    'properties': child.get('componentPropertyDefinitions', {}),
                    'styles': self.extract_styles(child)
                }
                variants.append(variant_info)
        
        return variants
    
    def convert_color_to_token(self, color: Dict) -> str:
        """Convert Figma color to token reference"""
        if color.get('type') == 'SOLID':
            r = int(color['color']['r'] * 255)
            g = int(color['color']['g'] * 255)
            b = int(color['color']['b'] * 255)
            
            # Try to match with existing primitive colors
            return self.match_color_to_primitive(r, g, b)
        
        return "{color.neutral.gray.500}"  # Default fallback
    
    def match_color_to_primitive(self, r: int, g: int, b: int) -> str:
        """Match RGB values to existing primitive color tokens"""
        # This is a simplified matcher - in reality you'd want more sophisticated matching
        # For now, return semantic color references based on common patterns
        
        # Check if it's a grayscale color
        if abs(r - g) < 10 and abs(g - b) < 10:
            if r < 50:
                return "{color.neutral.gray.900}"
            elif r < 100:
                return "{color.neutral.gray.700}"
            elif r < 150:
                return "{color.neutral.gray.500}"
            elif r < 200:
                return "{color.neutral.gray.300}"
            else:
                return "{color.neutral.gray.100}"
        
        # Check for primary colors (blue-ish)
        if b > r and b > g:
            return "{color.primary.blue.500}"
        
        # Check for error colors (red-ish)
        if r > g and r > b:
            return "{color.secondary.error.500}"
        
        # Check for success colors (green-ish)
        if g > r and g > b:
            return "{color.secondary.success.500}"
        
        # Default to neutral
        return "{color.neutral.gray.500}"
    
    def convert_size_to_token(self, size: float) -> str:
        """Convert pixel size to token reference"""
        # Round to nearest common size
        rounded_size = round(size)
        
        # Check if size exists in semantic tokens
        if str(rounded_size) in self.semantic_tokens.get('size', {}).get('width', {}):
            return f"{{size.{rounded_size}}}"
        
        # Find closest size
        common_sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96]
        closest_size = min(common_sizes, key=lambda x: abs(x - rounded_size))
        
        return f"{{size.{closest_size}}}"
    
    def generate_component_tokens(self, components: List[Dict]) -> Dict:
        """Generate consolidated token structure for all component variants"""
        if not components:
            return {}
        
        # Use the first component to determine the base name
        base_name = self.extract_base_component_name(components[0]['name'])
        
        # Initialize the consolidated structure
        consolidated_tokens = {
            base_name: {
                "container": {
                    "background": {},
                    "border": {},
                    "padding": {},
                    "size": {}
                },
                "text": {
                    "color": {},
                    "typography": {}
                }
            }
        }
        
        # Group components by their properties
        component_groups = self.group_components_by_properties(components)
        
        # Generate tokens for each property group
        for group_key, group_components in component_groups.items():
            self.add_component_group_tokens(consolidated_tokens[base_name], group_key, group_components)
        
        return consolidated_tokens
    
    def extract_base_component_name(self, component_name: str) -> str:
        """Extract base component name from Figma component name"""
        # Check if this is a tag component by looking for tag-specific properties
        if ('size=' in component_name.lower() and 'color=' in component_name.lower() and 
            'state=' in component_name.lower() and 'rounded=' in component_name.lower()):
            return 'tag'
        elif 'tag' in component_name.lower():
            return 'tag'
        elif 'button' in component_name.lower():
            return 'button'
        elif 'badge' in component_name.lower():
            return 'badge'
        elif 'icon' in component_name.lower():
            return 'icon'
        else:
            # Fallback: use the first word or clean up the name
            return component_name.split(',')[0].split('=')[0].lower().replace(' ', '-')
    
    def group_components_by_properties(self, components: List[Dict]) -> Dict[str, List[Dict]]:
        """Group components by their variant properties"""
        groups = {}
        
        for component in components:
            # Extract properties from component name
            properties = self.parse_component_properties(component['name'])
            group_key = self.create_group_key(properties)
            
            if group_key not in groups:
                groups[group_key] = []
            groups[group_key].append(component)
        
        return groups
    
    def parse_component_properties(self, component_name: str) -> Dict[str, str]:
        """Parse component properties from Figma component name"""
        properties = {}
        
        # Parse component name like "Size=md, Color=Primary, State=Default, Rounded=False, Outline=False"
        parts = component_name.split(', ')
        
        for part in parts:
            if '=' in part:
                key, value = part.split('=', 1)
                properties[key.lower().strip()] = value.lower().strip()
        
        return properties
    
    def create_group_key(self, properties: Dict[str, str]) -> str:
        """Create a group key from properties"""
        # Create a consistent key for grouping
        size = properties.get('size', 'md')
        color = properties.get('color', 'primary')
        rounded = properties.get('rounded', 'false')
        outline = properties.get('outline', 'false')
        
        return f"{size}_{color}_{rounded}_{outline}"
    
    def add_component_group_tokens(self, tokens: Dict, group_key: str, components: List[Dict]):
        """Add tokens for a group of components"""
        # Parse the group key to get the variant properties
        parts = group_key.split('_')
        size = parts[0] if len(parts) > 0 else 'md'
        color = parts[1] if len(parts) > 1 else 'primary'
        rounded = parts[2] if len(parts) > 2 else 'false'
        outline = parts[3] if len(parts) > 3 else 'false'
        
        # Map the color to standard variant names
        variant_name = self.map_color_to_variant(color)
        
        # Add tokens for each state in this group
        for component in components:
            properties = self.parse_component_properties(component['name'])
            state = properties.get('state', 'default')
            
            # Add background tokens
            if variant_name not in tokens['container']['background']:
                tokens['container']['background'][variant_name] = {}
            
            tokens['container']['background'][variant_name][state] = {
                "value": self.get_background_token_value(color, state, outline == 'true'),
                "type": "color",
                "description": f"Tag background for {variant_name} variant in {state} state"
            }
            
            # Add border tokens
            if variant_name not in tokens['container']['border']:
                tokens['container']['border'][variant_name] = {}
            
            tokens['container']['border'][variant_name][state] = {
                "value": self.get_border_token_value(color, state, outline == 'true'),
                "type": "color",
                "description": f"Tag border for {variant_name} variant in {state} state"
            }
            
            # Add padding tokens
            if variant_name not in tokens['container']['padding']:
                tokens['container']['padding'][variant_name] = {}
            
            tokens['container']['padding'][variant_name][state] = {
                "value": self.get_padding_token_value(size),
                "type": "dimension",
                "description": f"Tag padding for {variant_name} variant in {state} state"
            }
            
            # Add size tokens
            if variant_name not in tokens['container']['size']:
                tokens['container']['size'][variant_name] = {}
            
            tokens['container']['size'][variant_name][state] = {
                "value": self.get_size_token_value(size),
                "type": "dimension",
                "description": f"Tag size for {variant_name} variant in {state} state"
            }
            
            # Add text color tokens
            if variant_name not in tokens['text']['color']:
                tokens['text']['color'][variant_name] = {}
            
            tokens['text']['color'][variant_name][state] = {
                "value": self.get_text_color_token_value(color, state, outline == 'true'),
                "type": "color",
                "description": f"Tag text color for {variant_name} variant in {state} state"
            }
            
            # Add typography tokens
            if variant_name not in tokens['text']['typography']:
                tokens['text']['typography'][variant_name] = {}
            
            tokens['text']['typography'][variant_name][state] = {
                "value": self.get_typography_token_value(size),
                "type": "typography",
                "description": f"Tag typography for {variant_name} variant in {state} state"
            }
    
    def map_color_to_variant(self, color: str) -> str:
        """Map Figma color names to standard variant names"""
        color_mapping = {
            'primary': 'primary',
            'gray': 'secondary',
            'error': 'error',
            'warning': 'warning',
            'success': 'success',
            'blue': 'info',
            'blue-light': 'info',
            'blue-gray': 'secondary',
            'indigo': 'info',
            'purple': 'info',
            'pink': 'info',
            'rosé': 'info',
            'orange-dark': 'warning'
        }
        
        return color_mapping.get(color, 'primary')
    
    def get_background_token_value(self, color: str, state: str, is_outline: bool) -> str:
        """Get background token value based on color, state, and outline"""
        if is_outline:
            return "transparent"
        
        if color == 'primary':
            return "{color.primary.blue.500}" if state == "default" else "{color.primary.blue.600}"
        elif color == 'error':
            return "{color.secondary.error.500}" if state == "default" else "{color.secondary.error.600}"
        elif color == 'warning':
            return "{color.secondary.warning.500}" if state == "default" else "{color.secondary.warning.600}"
        elif color == 'success':
            return "{color.secondary.success.500}" if state == "default" else "{color.secondary.success.600}"
        else:
            return "{color.neutral.gray.100}" if state == "default" else "{color.neutral.gray.200}"
    
    def get_border_token_value(self, color: str, state: str, is_outline: bool) -> str:
        """Get border token value based on color, state, and outline"""
        if is_outline:
            if color == 'primary':
                return "{color.primary.blue.500}" if state == "default" else "{color.primary.blue.600}"
            elif color == 'error':
                return "{color.secondary.error.500}" if state == "default" else "{color.secondary.error.600}"
            elif color == 'warning':
                return "{color.secondary.warning.500}" if state == "default" else "{color.secondary.warning.600}"
            elif color == 'success':
                return "{color.secondary.success.500}" if state == "default" else "{color.secondary.success.600}"
            else:
                return "{color.neutral.gray.300}"
        else:
            return "transparent"
    
    def get_text_color_token_value(self, color: str, state: str, is_outline: bool) -> str:
        """Get text color token value based on color, state, and outline"""
        if is_outline:
            if color == 'primary':
                return "{color.primary.blue.700}" if state == "default" else "{color.primary.blue.800}"
            elif color == 'error':
                return "{color.secondary.error.700}" if state == "default" else "{color.secondary.error.800}"
            elif color == 'warning':
                return "{color.secondary.warning.700}" if state == "default" else "{color.secondary.warning.800}"
            elif color == 'success':
                return "{color.secondary.success.700}" if state == "default" else "{color.secondary.success.800}"
            else:
                return "{color.neutral.gray.700}"
        else:
            return "{color.neutral.gray.0}"
    
    def get_padding_token_value(self, size: str) -> str:
        """Get padding token value based on size"""
        size_mapping = {
            'xs': '{padding.1}',
            'sm': '{padding.1[5]}',
            'md': '{padding.2}',
            'lg': '{padding.2[5]}'
        }
        return size_mapping.get(size, '{padding.2}')
    
    def get_size_token_value(self, size: str) -> str:
        """Get size token value based on size"""
        size_mapping = {
            'xs': '{size.6}',
            'sm': '{size.7}',
            'md': '{size.8}',
            'lg': '{size.9}'
        }
        return size_mapping.get(size, '{size.8}')
    
    def get_typography_token_value(self, size: str) -> str:
        """Get typography token value based on size"""
        size_mapping = {
            'xs': '{typography.text.xs}',
            'sm': '{typography.text.sm}',
            'md': '{typography.text.sm}',
            'lg': '{typography.text.md}'
        }
        return size_mapping.get(size, '{typography.text.sm}')
    
    def get_component_variants(self, component_name: str) -> List[str]:
        """Get variants for a component type"""
        for key, variants in self.component_variants.items():
            if key in component_name:
                return variants
        return ['primary', 'secondary']
    
    def get_component_states(self, component_name: str) -> List[str]:
        """Get states for a component type"""
        if any(key in component_name for key in ['button', 'input', 'link']):
            return self.component_states['interactive']
        elif any(key in component_name for key in ['form', 'field']):
            return self.component_states['form']
        else:
            return self.component_states['default']
    
    def generate_variant_state_tokens(self, component: Dict, property_type: str, 
                                    variants: List[str], states: List[str], 
                                    token_type: str = "color") -> Dict:
        """Generate tokens for all variant/state combinations"""
        tokens = {}
        
        for variant in variants:
            variant_tokens = {}
            
            for state in states:
                token_value = self.get_token_value_for_property(
                    component, property_type, variant, state
                )
                
                variant_tokens[state] = {
                    "value": token_value,
                    "type": token_type,
                    "description": f"{component['name']} {property_type} for {variant} variant in {state} state"
                }
            
            tokens[variant] = variant_tokens
        
        return tokens
    
    def get_token_value_for_property(self, component: Dict, property_type: str, 
                                   variant: str, state: str) -> str:
        """Get the appropriate token value based on property type and context"""
        component_name = component['name'].lower().replace(' ', '-')
        
        # Generate semantic token references
        if property_type == "background":
            if variant == "primary":
                return "{color.primary.blue.500}" if state == "default" else "{color.primary.blue.600}"
            elif variant == "error":
                return "{color.secondary.error.500}" if state == "default" else "{color.secondary.error.600}"
            elif variant == "success":
                return "{color.secondary.success.500}" if state == "default" else "{color.secondary.success.600}"
            elif variant == "warning":
                return "{color.secondary.warning.500}" if state == "default" else "{color.secondary.warning.600}"
            else:
                return "{color.neutral.gray.100}" if state == "default" else "{color.neutral.gray.200}"
        
        elif property_type == "color":
            if variant == "primary":
                return "{color.neutral.gray.0}"
            else:
                return "{color.neutral.gray.900}"
        
        elif property_type == "border":
            return "{color.neutral.gray.300}"
        
        elif property_type == "padding":
            return "{padding.2}"
        
        elif property_type == "size":
            return "{size.8}"
        
        elif property_type == "typography":
            return "{typography.body.sm}"
        
        # Default fallback
        return f"{{semantic.{component_name}.{property_type}.{variant}.{state}}}"
    
    def save_component_tokens(self, component_name: str, tokens: Dict):
        """Save component tokens to JSON file"""
        components_dir = f"{self.tokens_dir}/components"
        os.makedirs(components_dir, exist_ok=True)
        
        filepath = f"{components_dir}/{component_name}.json"
        
        with open(filepath, 'w') as f:
            json.dump(tokens, f, indent=2)
        
        print(f"✅ Generated {filepath}")
    
    def process_figma_file(self, file_key: str, node_id: Optional[str] = None) -> bool:
        """Process Figma file and generate component tokens"""
        print(f"🚀 Starting Figma to Tokens conversion for file: {file_key}")
        
        all_components = []
        
        if node_id:
            # Fetch specific node/frame
            print(f"🎯 Targeting specific node: {node_id}")
            nodes_data = self.fetch_figma_nodes(file_key, [node_id])
            if not nodes_data:
                return False
            
            # Extract components from the specific node
            for node_key, node_data in nodes_data.get('nodes', {}).items():
                if node_data and 'document' in node_data:
                    components = self.extract_components_from_node(node_data['document'])
                    all_components.extend(components)
        else:
            # Fetch the complete file
            file_data = self.fetch_figma_file(file_key)
            if not file_data:
                return False
            
            # Extract all components
            for page in file_data.get('document', {}).get('children', []):
                components = self.extract_components_from_node(page)
                all_components.extend(components)
        
        print(f"📦 Found {len(all_components)} components to process")
        
        if len(all_components) == 0:
            print("⚠️  No components found in the specified location")
            print("💡 Tip: Make sure the node contains published components")
            return False
        
        # Group components by base component type
        component_groups = {}
        for component in all_components:
            base_name = self.extract_base_component_name(component['name'])
            if base_name not in component_groups:
                component_groups[base_name] = []
            component_groups[base_name].append(component)
        
        print(f"📋 Found {len(component_groups)} component types: {list(component_groups.keys())}")
        
        # Generate consolidated tokens for each component type
        successful_count = 0
        for base_name, components in component_groups.items():
            try:
                print(f"🔄 Processing {len(components)} variants of: {base_name}")
                
                # Generate consolidated tokens for all variants
                tokens = self.generate_component_tokens(components)
                self.save_component_tokens(base_name, tokens)
                successful_count += 1
                
            except Exception as e:
                print(f"❌ Error processing component group {base_name}: {e}")
                continue
        
        print(f"🎉 Completed! Generated tokens for {successful_count}/{len(component_groups)} component types")
        return successful_count > 0
    
    def generate_config_template(self, components: List[Dict]) -> Dict:
        """Generate a configuration template for fine-tuning"""
        config = {
            "file_info": {
                "generated_at": datetime.now().isoformat(),
                "components_count": len(components)
            },
            "components": {}
        }
        
        for component in components:
            component_name = component['name'].lower().replace(' ', '-')
            config["components"][component_name] = {
                "name": component['name'],
                "type": component['type'],
                "variants": self.get_component_variants(component_name),
                "states": self.get_component_states(component_name),
                "properties": list(component.get('properties', {}).keys()),
                "enabled": True
            }
        
        return config

def main():
    parser = argparse.ArgumentParser(description='Convert Figma components to HighRise design tokens')
    parser.add_argument('file_key', help='Figma file key (from URL)')
    parser.add_argument('--token', required=True, help='Figma API token')
    parser.add_argument('--node-id', help='Specific node/frame ID to fetch (optional)')
    parser.add_argument('--tokens-dir', default='tokens', help='Tokens directory (default: tokens)')
    parser.add_argument('--config', help='Generate configuration template')
    
    args = parser.parse_args()
    
    # Initialize generator
    generator = FigmaToTokensGenerator(args.token, args.tokens_dir)
    
    # Process the file
    success = generator.process_figma_file(args.file_key, args.node_id)
    
    if success:
        print("✅ Figma to Tokens conversion completed successfully!")
        sys.exit(0)
    else:
        print("❌ Figma to Tokens conversion failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 