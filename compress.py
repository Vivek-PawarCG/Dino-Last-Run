import os
import shutil
import subprocess
try:
    from PIL import Image
except ImportError:
    subprocess.check_call(["pip", "install", "Pillow"])
    from PIL import Image

src = r"C:\Users\vivpawar\.gemini\antigravity\brain\cd262351-a379-4173-a356-19a029455108\media__1774414946425.png"
dst = r"public\images\main_bg.png"
if os.path.exists(src):
    shutil.copyfile(src, dst)

folder = r"public\images"
for filename in os.listdir(folder):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        filepath = os.path.join(folder, filename)
        outpath = os.path.join(folder, filename.rsplit('.', 1)[0] + '.webp')
        
        try:
            with Image.open(filepath) as img:
                img.thumbnail((800, 800))
                if img.mode != "RGB" and img.mode != "RGBA":
                    img = img.convert("RGBA")
                img.save(outpath, "webp", quality=50)
            os.remove(filepath)
            print(f"Compressed {filename} to {outpath}")
        except Exception as e:
            print(f"Failed on {filename}: {e}")
