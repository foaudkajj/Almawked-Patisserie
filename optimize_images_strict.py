import os
from PIL import Image

def optimize_images_strict(directory, max_size=(600, 600), quality=75):
    # Supported extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    count = 0
    saved_space = 0

    print(f"Scanning directory: {directory}...")

    for root, dirs, files in os.walk(directory):
        for file in files:
            # EXCLUSION LOGIC: Skip files starting with 'logo'
            if file.lower().startswith('logo'):
                print(f"Skipping excluded file: {file}")
                continue

            ext = os.path.splitext(file)[1].lower()
            if ext in extensions:
                file_path = os.path.join(root, file)
                
                try:
                    # Get original size
                    original_size = os.path.getsize(file_path)
                    
                    with Image.open(file_path) as img:
                        # Resize if needed (using new stricter limit)
                        if img.width > max_size[0] or img.height > max_size[1]:
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)
                            print(f"Resizing {file} to max {max_size}...")
                        
                        # Save back to the same path with optimization
                        if ext == '.png':
                            # check if it has transparency
                            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                                img.save(file_path, optimize=True)
                            else:
                                img.save(file_path, optimize=True)
                        else:
                            # JPEG/WEBP - Lower quality
                            img.save(file_path, optimize=True, quality=quality)
                    
                    new_size = os.path.getsize(file_path)
                    saved = original_size - new_size
                    
                    # Only count if we actually saved space (re-saving might sometimes increase size slightly for small optimized images, though unlikely with quality drop)
                    if saved > 0:
                        saved_space += saved
                        print(f"Optimized {file}: Saved {saved/1024:.2f} KB")
                        count += 1
                    elif saved < 0:
                         print(f"Skipped {file} (already optimized or size increased)")

                except Exception as e:
                    print(f"Error processing {file}: {e}")

    print(f"\nSummary:")
    print(f"Optimized {count} images.")
    print(f"Total space saved: {saved_space / (1024*1024):.2f} MB")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(current_dir, 'images')
    
    if os.path.exists(images_dir):
        optimize_images_strict(images_dir)
    else:
        print(f"Directory not found: {images_dir}")
