from PIL import Image
import os
import glob

def convert_to_webp(directory):
    files = glob.glob(os.path.join(directory, "*.png"))
    for file in files:
        # Check if transparency
        img = Image.open(file)
        # Requirement: "Batch convert all non-transparent textures and opaque sprites to WebP"
        # "Keep PNG only for assets requiring complex alpha channels if WebP artifacts are visible."

        # WebP supports transparency (lossless or lossy).
        # We'll try to convert everything to WebP.
        # If it has alpha, we can use lossless webp or lossy with alpha.
        # But generally WebP is good.

        new_file = file.replace(".png", ".webp")
        print(f"Converting {file} to {new_file}")

        try:
            # Save as WebP
            # Use lossless=True for pixel art to avoid artifacts
            img.save(new_file, "WEBP", lossless=True)

            # Note: We are NOT deleting the original PNGs yet, as we need to update code references first.
            # And we might want to keep them as source.
        except Exception as e:
            print(f"Failed to convert {file}: {e}")

if __name__ == "__main__":
    convert_to_webp("public/assets/sprites")
