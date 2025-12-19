from PIL import Image
import os
import glob
import json
import math

# Configuration
SPRITE_DIR = "public/assets/sprites"
OUTPUT_DIR = "public/assets/atlas"
ATLAS_SIZE = 512
PADDING = 0 # No padding for pixel art usually, or 1px

def pack_sprites():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Get all webp images (since we converted them)
    # Filter for 16x16 and 32x32 as per requirement
    # "Pack all 16x16 and 32x32 sprites into a single 512x512 pixel Texture Atlas"

    files = glob.glob(os.path.join(SPRITE_DIR, "*.webp"))
    images = []

    for f in files:
        try:
            img = Image.open(f)
            # Check dimensions
            # We pack everything small enough?
            # Or strict 16/32 check?
            # Let's pack anything <= 64 for safety
            if img.width <= 64 and img.height <= 64:
                images.append({'path': f, 'img': img, 'name': os.path.basename(f)})
            else:
                # Keep sprite sheets separate if they are large animations?
                # Player-walk might be 16x4 = 64x16.
                if img.width <= 256 and img.height <= 256:
                     images.append({'path': f, 'img': img, 'name': os.path.basename(f)})
        except Exception as e:
            print(f"Error loading {f}: {e}")

    # Simple packing algorithm (Shelf packing)
    atlas = Image.new('RGBA', (ATLAS_SIZE, ATLAS_SIZE), (0,0,0,0))
    mapping = {}

    x_cursor = 0
    y_cursor = 0
    max_h_in_row = 0

    # Sort by height for better packing
    images.sort(key=lambda x: x['img'].height, reverse=True)

    for item in images:
        img = item['img']
        name = item['name']
        w, h = img.size

        if x_cursor + w > ATLAS_SIZE:
            x_cursor = 0
            y_cursor += max_h_in_row
            max_h_in_row = 0

        if y_cursor + h > ATLAS_SIZE:
            print(f"Atlas full! Skipping {name}")
            continue

        atlas.paste(img, (x_cursor, y_cursor))

        # Normalize UVs
        u = x_cursor / ATLAS_SIZE
        v = 1 - ((y_cursor + h) / ATLAS_SIZE) # GL coordinates (0,0 is bottom left usually? No, top-left for images)
        # ThreeJS UV: (0,0) is Bottom-Left.
        # Image coords: (0,0) is Top-Left.
        # So y in UV = 1 - (y_in_image + h) / H

        uv_x = x_cursor / ATLAS_SIZE
        uv_y = 1 - (y_cursor + h) / ATLAS_SIZE
        uv_w = w / ATLAS_SIZE
        uv_h = h / ATLAS_SIZE

        mapping[name] = {
            'x': x_cursor, 'y': y_cursor, 'w': w, 'h': h,
            'uv': [uv_x, uv_y, uv_w, uv_h]
        }

        x_cursor += w
        max_h_in_row = max(max_h_in_row, h)

    atlas.save(os.path.join(OUTPUT_DIR, "sprites.webp"), "WEBP", lossless=True)
    with open(os.path.join(OUTPUT_DIR, "sprites.json"), 'w') as f:
        json.dump(mapping, f, indent=2)

    print(f"Packed {len(mapping)} sprites into atlas.")

if __name__ == "__main__":
    pack_sprites()
