#!/usr/bin/env python3
"""
HighRise Component Token Generator

This script helps generate component-specific design tokens for the HighRise design system.
It analyzes existing tokens, creates new component token files, and identifies semantic token patterns.
"""

import json
import os
import argparse
from typing import Dict, List, Set, Any
from collections import defaultdict, Counter
import re

class HighRiseTokenGenerator:
    def __init__(self, tokens_dir: str = "tokens"):
        self.tokens_dir = tokens_dir
        self.primitive_tokens = {}
        self.semantic_tokens = {}
        self.component_tokens = {}
        self.usage_patterns = defaultdict(list)
        
        # Load existing tokens
        self.load_existing_tokens()
    
    def load_existing_tokens(self):
        """Load existing primitive, semantic, and component tokens"""
        try:
            # Load primitive tokens
            with open(f"{self.tokens_dir}/primitive/Default.json", 'r') as f:
                self.primitive_tokens = json.load(f)
            
            # Load semantic tokens
            with open(f"{self.tokens_dir}/Semantic.json", 'r') as f:
                self.semantic_tokens = json.load(f)
            
            # Load existing component tokens
            component_dir = f"{self.tokens_dir}/Component Specific"
            if os.path.exists(component_dir):
                for file in os.listdir(component_dir):
                    if file.endswith('.json'):
                        with open(f"{component_dir}/{file}", 'r') as f:
                            self.component_tokens[file.replace('.json', '')] = json.load(f)
            
            print("✅ Loaded existing tokens successfully")
            
        except Exception as e:
            print(f"❌ Error loading tokens: {e}")
    
    def analyze_token_usage(self, tokens: Dict, prefix: str = "") -> Dict[str, int]:
        """Analyze token usage patterns recursively"""
        usage_count = Counter()
        
        def extract_references(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    current_path = f"{path}.{key}" if path else key
                    if isinstance(value, dict) and "value" in value:
                        # Extract token reference from value
                        token_value = value["value"]
                        if isinstance(token_value, str) and token_value.startswith("{") and token_value.endswith("}"):
                            ref_token = token_value[1:-1]  # Remove braces
                            usage_count[ref_token] += 1
                    else:
                        extract_references(value, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    extract_references(item, f"{path}[{i}]")
        
        extract_references(tokens)
        return dict(usage_count)
    
    def identify_semantic_candidates(self, min_usage: int = 3) -> List[str]:
        """Identify primitive tokens that should become semantic tokens"""
        # Analyze usage in component tokens
        all_usage = Counter()
        
        for component_name, component_tokens in self.component_tokens.items():
            usage = self.analyze_token_usage(component_tokens)
            for token, count in usage.items():
                all_usage[token] += count
        
        # Find tokens used 3+ times
        candidates = [token for token, count in all_usage.items() if count >= min_usage]
        
        print(f"🔍 Found {len(candidates)} semantic token candidates (used {min_usage}+ times)")
        return candidates
    
    def create_component_template(self, component_name: str, elements: List[str], 
                                properties: List[str], variants: List[str], 
                                states: List[str]) -> Dict:
        """Create a component token template"""
        
        template = {
            "component": {
                "name": component_name,
                "version": "1.0.0",
                "description": f"Design tokens for {component_name} component",
                "theme": {
                    "light": {},
                    "dark": {}
                },
                "responsive": {
                    "mobile": {},
                    "tablet": {},
                    "large": {}
                }
            }
        }
        
        # Generate structure for each theme
        for theme in ["light", "dark"]:
            theme_tokens = {}
            
            for element in elements:
                element_tokens = {}
                
                for prop in properties:
                    prop_tokens = {}
                    
                    for variant in variants:
                        variant_tokens = {}
                        
                        for state in states:
                            variant_tokens[state] = {
                                "value": f"{{semantic.{component_name}.{element}.{prop}.{variant}.{state}}}",
                                "type": self.get_token_type(prop),
                                "description": f"{component_name} {element} {prop} for {variant} variant in {state} state"
                            }
                        
                        prop_tokens[variant] = variant_tokens
                    
                    element_tokens[prop] = prop_tokens
                
                theme_tokens[element] = element_tokens
            
            template["component"]["theme"][theme] = theme_tokens
        
        # Generate responsive tokens (mainly for dimensions and typography)
        responsive_properties = ["padding", "margin", "fontSize", "lineHeight", "size"]
        
        for breakpoint in ["mobile", "tablet", "large"]:
            responsive_tokens = {}
            
            for element in elements:
                element_tokens = {}
                
                for prop in responsive_properties:
                    if prop in properties:  # Only include if it's a defined property
                        prop_tokens = {}
                        
                        for variant in variants:
                            prop_tokens[variant] = {
                                "value": f"{{semantic.{component_name}.{element}.{prop}.{variant}.{breakpoint}}}",
                                "type": "dimension" if prop in ["padding", "margin", "size"] else "typography",
                                "description": f"{component_name} {element} {prop} for {variant} variant on {breakpoint} screens"
                            }
                        
                        element_tokens[prop] = prop_tokens
                
                responsive_tokens[element] = element_tokens
            
            template["component"]["responsive"][breakpoint] = responsive_tokens
        
        return template
    
    def get_token_type(self, property_name: str) -> str:
        """Determine token type based on property name"""
        type_mapping = {
            "background": "color",
            "color": "color",
            "border": "border",
            "shadow": "shadow",
            "padding": "dimension",
            "margin": "dimension",
            "size": "dimension",
            "width": "dimension",
            "height": "dimension",
            "fontSize": "typography",
            "lineHeight": "typography",
            "fontWeight": "typography",
            "fontFamily": "typography"
        }
        
        for key, token_type in type_mapping.items():
            if key in property_name.lower():
                return token_type
        
        return "other"
    
    def generate_component_tokens(self, component_name: str, config: Dict) -> Dict:
        """Generate component tokens based on configuration"""
        
        elements = config.get("elements", ["container"])
        properties = config.get("properties", ["background", "color", "border"])
        variants = config.get("variants", ["primary", "secondary"])
        states = config.get("states", ["default", "hover", "active", "focused"])
        
        return self.create_component_template(component_name, elements, properties, variants, states)
    
    def save_component_tokens(self, component_name: str, tokens: Dict):
        """Save component tokens to file"""
        
        # Ensure components directory exists
        components_dir = f"{self.tokens_dir}/components"
        os.makedirs(components_dir, exist_ok=True)
        
        # Save to file
        filename = f"{components_dir}/{component_name.lower()}.json"
        with open(filename, 'w') as f:
            json.dump(tokens, f, indent=2)
        
        print(f"✅ Generated component tokens: {filename}")
    
    def generate_semantic_tokens(self, candidates: List[str]) -> Dict:
        """Generate semantic tokens for high-usage primitive tokens"""
        
        semantic_suggestions = {}
        
        for token in candidates:
            # Analyze token structure to suggest semantic naming
            parts = token.split('.')
            
            if len(parts) >= 3:
                category = parts[0]
                subcategory = parts[1] if len(parts) > 1 else ""
                property_name = parts[2] if len(parts) > 2 else ""
                
                # Create semantic token suggestion
                semantic_name = f"semantic.{category}.{subcategory}.{property_name}"
                
                semantic_suggestions[semantic_name] = {
                    "value": f"{{{token}}}",
                    "type": category,
                    "description": f"Semantic token for {token}",
                    "usage_count": "3+"
                }
        
        return semantic_suggestions
    
    def print_usage_report(self):
        """Print token usage analysis report"""
        print("\n" + "="*60)
        print("📊 TOKEN USAGE ANALYSIS REPORT")
        print("="*60)
        
        # Analyze current usage
        usage = self.analyze_token_usage(self.component_tokens)
        
        print(f"\n🔍 Total unique tokens referenced: {len(usage)}")
        print(f"📁 Component token files analyzed: {len(self.component_tokens)}")
        
        # Top used tokens
        sorted_usage = sorted(usage.items(), key=lambda x: x[1], reverse=True)
        
        print("\n🏆 TOP 10 MOST USED TOKENS:")
        for i, (token, count) in enumerate(sorted_usage[:10], 1):
            print(f"{i:2d}. {token} (used {count} times)")
        
        # Semantic candidates
        candidates = self.identify_semantic_candidates(3)
        print(f"\n🎯 SEMANTIC TOKEN CANDIDATES (3+ usage):")
        for candidate in candidates[:10]:
            usage_count = usage.get(candidate, 0)
            print(f"  • {candidate} (used {usage_count} times)")

def main():
    parser = argparse.ArgumentParser(description='HighRise Component Token Generator')
    parser.add_argument('--component', '-c', help='Component name to generate tokens for')
    parser.add_argument('--analyze', '-a', action='store_true', help='Analyze token usage patterns')
    parser.add_argument('--config', help='JSON config file for component generation')
    
    args = parser.parse_args()
    
    generator = HighRiseTokenGenerator()
    
    if args.analyze:
        generator.print_usage_report()
    
    if args.component:
        # Default configuration for component
        default_config = {
            "elements": ["container", "content", "header", "footer"],
            "properties": ["background", "color", "border", "padding", "margin"],
            "variants": ["primary", "secondary", "tertiary"],
            "states": ["default", "hover", "active", "focused", "disabled"]
        }
        
        # Load custom config if provided
        if args.config and os.path.exists(args.config):
            with open(args.config, 'r') as f:
                config = json.load(f)
        else:
            config = default_config
        
        # Generate tokens
        tokens = generator.generate_component_tokens(args.component, config)
        generator.save_component_tokens(args.component, tokens)
        
        print(f"\n✅ Generated tokens for {args.component} component")
        print(f"📁 File: tokens/components/{args.component.lower()}.json")

if __name__ == "__main__":
    main() 