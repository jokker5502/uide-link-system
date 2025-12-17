from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGB', (size, size), color = '#242424')
    d = ImageDraw.Draw(img)
    d.text((size/4, size/2), "UIDE", fill=(255, 255, 255))
    img.save(filename)

create_icon(192, 'frontend/public/pwa-192x192.png')
create_icon(512, 'frontend/public/pwa-512x512.png')
