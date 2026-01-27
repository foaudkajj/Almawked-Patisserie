import os
from PIL import Image

def optimize_images(directory, max_size=(1024, 1024), quality=85):
    # Supported extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    count = 0
    saved_space = 0

    print(f"Scanning directory: {directory}...")

    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in extensions:
                file_path = os.path.join(root, file)
                
                try:
                    # Get original size
                    original_size = os.path.getsize(file_path)
                    
                    with Image.open(file_path) as img:
                        # Skip if already small
                        if img.width <= max_size[0] and img.height <= max_size[1] and original_size < 300 * 1024:
                             # If dimensions are small AND file size is less than 300KB, skip
                             # But re-saving might still optimize it. Let's strictly check dimensions first.
                             pass

                        # Resize if needed
                        if img.width > max_size[0] or img.height > max_size[1]:
                            img.thumbnail(max_size, Image.Resampling.LANCZOS)
                            print(f"Resizing {file}...")
                        
                        # Save back to the same path with optimization
                        # For PNG, quality param is ignored by some versions or handled differently, 
                        # optimize=True works.
                        if ext == '.png':
                            # check if it has transparency
                            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                                # Keep as PNG
                                img.save(file_path, optimize=True)
                            else:
                                # Start with just optimizing PNG
                                img.save(file_path, optimize=True)
                        else:
                            # JPEG/WEBP
                            img.save(file_path, optimize=True, quality=quality)
                    
                    new_size = os.path.getsize(file_path)
                    saved = original_size - new_size
                    if saved > 0:
                        saved_space += saved
                        print(f"Optimized {file}: Saved {saved/1024:.2f} KB")
                        count += 1
                    
                except Exception as e:
                    print(f"Error processing {file}: {e}")

    print(f"\nSummary:")
    print(f"Optimized {count} images.")
    print(f"Total space saved: {saved_space / (1024*1024):.2f} MB")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(current_dir, 'images')
    
    if os.path.exists(images_dir):
        optimize_images(images_dir)
    else:
        print(f"Directory not found: {images_dir}")
