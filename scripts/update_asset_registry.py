import os
import glob
import re
import json

def parse_artreq_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract ID from filename
    basename = os.path.basename(filepath)
    asset_id = os.path.splitext(basename)[0]

    # Extract Title (Line 4 usually, or under ## 1. Asset Title)
    title_match = re.search(r'## 1\. Asset Title\s*\n\*\*(.*?)\*\*', content, re.DOTALL)
    title = title_match.group(1).strip() if title_match else "Unknown Title"

    # Extract Type
    type_match = re.search(r'## 2\. Asset Type\s*\n(.*?)\n', content, re.DOTALL)
    asset_type = type_match.group(1).strip() if type_match else "Unknown Type"

    # Extract Dimensions
    dim_match = re.search(r'Dimensions:\*\*\s*(.*?)\n', content)
    dimensions = dim_match.group(1).strip() if dim_match else "Unknown"

    # Extract Color (First hex code found in Color Palette section)
    color_match = re.search(r'Color Palette:.*?(#[A-Fa-f0-9]{6})', content, re.DOTALL)
    color = color_match.group(1) if color_match else "#ffffff"

    return {
        "id": asset_id,
        "title": title,
        "type": asset_type,
        "dimensions": dimensions,
        "color": color
    }

def generate_typescript_registry(assets):
    ts_content = """export interface ArtAsset {
    id: string;
    title: string;
    type: string;
    dimensions: string;
    color: string;
    dimensions3D?: [number, number, number];
}

export const ASSET_REGISTRY: Record<string, ArtAsset> = {
"""
    
    # Sort assets by ID
    sorted_assets = sorted(assets, key=lambda x: x['id'])

    for asset in sorted_assets:
        # Attempt to parse dimensions into 3D vector
        dim_str = asset['dimensions']
        dim_3d = "[1, 1, 1]" # Default
        
        # Simple heuristic for parsing dimensions like "10cm cube" or "4m x 4m"
        try:
            # Check for "cube"
            if 'cube' in dim_str.lower():
                val = float(re.search(r'(\d+(\.\d+)?)', dim_str).group(1))
                if 'cm' in dim_str: val /= 100
                dim_3d = f"[{val}, {val}, {val}]"
            
            # Check for "x" format (e.g. 1m x 2m)
            elif 'x' in dim_str:
                parts = dim_str.replace('m', '').split('x')
                vals = [float(p.strip()) for p in parts if p.strip().replace('.','').isdigit()]
                if len(vals) == 2: vals.append(0.1) # Flat
                if len(vals) == 3: pass
                if len(vals) >= 2:
                    dim_3d = f"[{vals[0]}, {vals[1]}, {vals[2] if len(vals)>2 else 0.1}]"
                    
        except:
             pass # Keep default

        ts_content += f"    '{asset['id']}': {{\n"
        ts_content += f"        id: '{asset['id']}',\n"
        ts_content += f"        title: \"{asset['title']}\",\n"
        ts_content += f"        type: \"{asset['type']}\",\n"
        ts_content += f"        dimensions: \"{asset['dimensions']}\",\n"
        ts_content += f"        color: '{asset['color']}'"
        
        if dim_3d != "[1, 1, 1]":
             ts_content += f",\n        dimensions3D: {dim_3d}"
             
        ts_content += "\n    },\n"

    ts_content += "};\n\n"
    ts_content += "export const ASSET_LIST = Object.values(ASSET_REGISTRY);\n"

    return ts_content

def main():
    # Adjust path to where the user's repo structure is
    search_path = os.path.join("Req", "ARTREQ", "ARTREQ_*.md")
    files = glob.glob(search_path)
    
    if not files:
        print(f"No files found in {search_path}")
        # Try alternate path logic if running from root vs src
        search_path = os.path.join("..", "Req", "ARTREQ", "ARTREQ_*.md")
        files = glob.glob(search_path)
    
    print(f"Found {len(files)} ARTREQ files.")
    
    assets = []
    for f in files:
        try:
            asset = parse_artreq_file(f)
            assets.append(asset)
        except Exception as e:
            print(f"Error parsing {f}: {e}")

    ts_output = generate_typescript_registry(assets)
    
    output_path = os.path.join("src", "data", "AssetRegistry.ts")
    with open(output_path, "w", encoding='utf-8') as f:
        f.write(ts_output)
    
    print(f"Successfully wrote registry to {output_path}")

if __name__ == "__main__":
    main()
