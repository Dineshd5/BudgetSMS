import os
from PIL import Image, ImageDraw

def create_icon(size, path, round=False):
    img = Image.new('RGBA', (size, size), color=(73, 109, 137))
    d = ImageDraw.Draw(img)
    
    if round:
        d.ellipse([(0,0), (size, size)], fill=(255, 255, 0), outline=(0,0,0))
    else:
        d.rectangle([(0,0), (size, size)], fill=(255, 255, 0), outline=(0,0,0))
        
    d.text((size//4, size//4), "SMS", fill=(0,0,0))
    img.save(path, "PNG")

densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

base_path = "android/app/src/main/res"

for density, size in densities.items():
    folder = os.path.join(base_path, density)
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    create_icon(size, os.path.join(folder, "ic_launcher.png"))
    create_icon(size, os.path.join(folder, "ic_launcher_round.png"), round=True)

print("Icons generated successfully")
