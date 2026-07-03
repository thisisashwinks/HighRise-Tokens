# Figma to HighRise Tokens Scripts

This directory contains automated scripts for converting Figma components into HighRise design token JSON files.

## Scripts Overview

### 1. `figma-to-tokens.py`
The main conversion script that:
- Fetches all components from a Figma file using the Figma API
- Extracts component styles, variants, and states
- Converts them to HighRise token format
- Generates JSON files following the established token hierarchy

### 2. `run-figma-sync.py`
A user-friendly wrapper that:
- Guides you through the setup process
- Handles API token management
- Provides clear progress feedback
- Simplifies the conversion process

## Quick Start

### Prerequisites
1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Get your Figma API token:**
   - Go to https://www.figma.com/developers/api#access-tokens
   - Generate a personal access token
   - Either set it as an environment variable: `export FIGMA_TOKEN="your-token"`
   - Or enter it when prompted by the script

### Usage

#### Option 1: Easy Mode (Recommended)
```bash
python scripts/run-figma-sync.py
```
This will guide you through the entire process with prompts.

#### Option 2: Direct Script
```bash
python scripts/figma-to-tokens.py [FILE_KEY] --token [YOUR_TOKEN]
```

**Example:**
```bash
python scripts/figma-to-tokens.py mohCP9FnpX2oXANLvwrWGn --token your-figma-token-here
```

## Finding Your Figma File Key

Your Figma file key is found in the URL:
```
https://www.figma.com/design/[FILE_KEY]/Project-Name?node-id=...
```

For example, from this URL:
```
https://www.figma.com/design/mohCP9FnpX2oXANLvwrWGn/HighRise--Experimental/?node-id=26957-99489
```
The file key is: `mohCP9FnpX2oXANLvwrWGn`

## Output

The script generates:
- Individual component JSON files in `tokens/components/`
- Each file follows the HighRise token structure
- Includes all variants (primary, secondary, error, etc.)
- Includes all states (default, hover, active, disabled, etc.)
- References existing primitive and semantic tokens

## Configuration

The script automatically detects component types and applies appropriate:
- **Variants:** Based on component naming (button, tag, badge, etc.)
- **States:** Based on component interaction patterns
- **Token References:** Maps to existing primitive/semantic tokens

## Supported Components

The script recognizes and generates appropriate tokens for:
- **Buttons:** primary, secondary, tertiary, destructive, ghost, link
- **Tags:** primary, secondary, tertiary, error, warning, success, info
- **Badges:** primary, secondary, success, error, warning, info
- **Alerts:** info, success, warning, error
- **Inputs:** default, error, success, warning
- **Cards:** default, elevated, outlined

## Customization

To modify component mappings or add new component types:
1. Edit the `component_variants` and `component_states` dictionaries in `figma-to-tokens.py`
2. Add new component type detection logic in `get_component_variants()`
3. Adjust token value generation in `get_token_value_for_property()`

## Troubleshooting

### Common Issues:
1. **"Error fetching Figma file"**: Check your API token and file key
2. **"Component not found"**: Ensure the file contains published components
3. **"Token reference not found"**: Verify your primitive/semantic token files exist

### Debug Mode:
Add `--verbose` flag for detailed logging:
```bash
python scripts/figma-to-tokens.py [FILE_KEY] --token [TOKEN] --verbose
```

## Integration with Existing Workflow

This script integrates with your existing token system:
- Reads from `tokens/primitive/Default.json`
- Reads from `tokens/Semantic.json`
- Outputs to `tokens/components/`
- Follows the established token hierarchy and naming conventions

## Next Steps

After running the script:
1. Review generated component tokens in `tokens/components/`
2. Adjust any token references if needed
3. Test the tokens in your design system
4. Consider adding the script to your CI/CD pipeline for automated updates 