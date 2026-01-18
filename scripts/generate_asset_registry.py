import os
import re
import json

ARTREQ_DIR = r"c:\Users\suman\OneDrive\Documents\GitHub\PFISO\Req\ARTREQ"
OUTPUT_FILE = r"c:\Users\suman\OneDrive\Documents\GitHub\PFISO\src\data\AssetRegistry.ts"

def parse_markdown_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = os.path.basename(filepath)
    asset_id = os.path.splitext(filename)[0]

    # Extract Title
    title_match = re.search(r'## 1\. Asset Title\s*\n\*\*(.*?)\*\*', content)
    title = title_match.group(1).strip() if title_match else "Unknown Asset"

    # Extract Type
    type_match = re.search(r'## 2\. Asset Type\s*\n(.*?)\n', content)
    asset_type = type_match.group(1).strip() if type_match else "Prop"

    # Extract Dimensions (Simplified)
    dimensions_match = re.search(r'## 5\. Technical Specifications.*?Dimensions:\*\*\s*(.*?)\n', content, re.DOTALL)
    dimensions = dimensions_match.group(1).strip() if dimensions_match else "1m x 1m x 1m"

    # Extract Color Palette (First Hex Code found)
    color_match = re.search(r'#[0-9a-fA-F]{6}', content)
    color = color_match.group(0) if color_match else "#ffffff"

    return {
        "id": asset_id,
        "title": title,
        "type": asset_type,
        "dimensions": dimensions,
        "color": color
    }

def generate_typescript_file(assets):
    ts_content = "export interface ArtAsset {\n"
    ts_content += "    id: string;\n"
    ts_content += "    title: string;\n"
    ts_content += "    type: string;\n"
    ts_content += "    dimensions: string;\n"
    ts_content += "    color: string;\n"
    ts_content += "}\n\n"
    
    ts_content += "export const ASSET_REGISTRY: Record<string, ArtAsset> = {\n"
    
    for asset in assets:
        ts_content += f"    '{asset['id']}': {{\n"
        ts_content += f"        id: '{asset['id']}',\n"
        ts_content += f"        title: '{asset['title']}',\n"
        ts_content += f"        type: '{asset['type']}',\n"
        ts_content += f"        dimensions: '{asset['dimensions']}',\n"
        ts_content += f"        color: '{asset['color']}'\n"
        ts_content += "    },\n"
    
    ts_content += "};\n\n"
    ts_content += "export const ASSET_LIST = Object.values(ASSET_REGISTRY);\n"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(ts_content)

def main():
    if not os.path.exists(ARTREQ_DIR):
        print(f"Directory not found: {ARTREQ_DIR}")
        return

    assets = []
    files = sorted([f for f in os.listdir(ARTREQ_DIR) if f.endswith('.md')])
    
    print(f"Found {len(files)} requirement files.")

    for filename in files:
        filepath = os.path.join(ARTREQ_DIR, filename)
        asset_data = parse_markdown_file(filepath)
        assets.append(asset_data)
        print(f"Parsed {asset_data['id']}: {asset_data['title']}")

    generate_typescript_file(assets)
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
