from PIL import Image
import sys

def make_background_transparent(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    original_rgb = img.convert('RGB')

    # 1. Build a foreground mask for pixels that are part of the icon lines
    #    (dark blue/green). White fills are not included in the mask.
    is_foreground = bytearray(width * height)
    for y in range(height):
        for x in range(width):
            r, g, b = original_rgb.getpixel((x, y))
            if max(r, g, b) < 210:
                is_foreground[y * width + x] = 1

    # 2. Dilate the mask by a few pixels so anti-aliased edges are included
    #    and the white fills are fully enclosed by the mask.
    def dilate(mask, passes=2):
        current = bytearray(mask)
        for _ in range(passes):
            nxt = bytearray(current)
            for y in range(height):
                for x in range(width):
                    i = y * width + x
                    if current[i]:
                        continue
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            if dx == 0 and dy == 0:
                                continue
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < width and 0 <= ny < height and current[ny * width + nx]:
                                nxt[i] = 1
                                break
                        if nxt[i]:
                            break
            current = nxt
        return current

    mask = dilate(is_foreground, passes=2)

    # 3. Find the bounding box of the dilated foreground.
    min_x, min_y = width, height
    max_x, max_y = -1, -1
    for y in range(height):
        for x in range(width):
            if mask[y * width + x]:
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y

    # 4. Add a small padding around the icon and clamp to image bounds.
    padding = 20
    min_x = max(0, min_x - padding)
    min_y = max(0, min_y - padding)
    max_x = min(width - 1, max_x + padding)
    max_y = min(height - 1, max_y + padding)

    # 5. Inside the bounding box, convert near-white/grey background pixels
    #    to pure white so they blend perfectly into the white cards. Pixels
    #    that are part of the icon (colored lines/fills) stay as-is, so the
    #    white icon fills and the green checkmark remain intact. Everything
    #    outside the bounding box is fully transparent.
    new_pixels = []
    for y in range(height):
        for x in range(width):
            if min_x <= x <= max_x and min_y <= y <= max_y:
                r, g, b = original_rgb.getpixel((x, y))
                if max(r, g, b) >= 240:
                    new_pixels.append((255, 255, 255, 255))
                else:
                    new_pixels.append((r, g, b, 255))
            else:
                new_pixels.append((255, 255, 255, 0))

    img.putdata(new_pixels)
    img.save(output_path, 'PNG')
    print(f'Saved {output_path}')

if __name__ == '__main__':
    make_background_transparent(sys.argv[1], sys.argv[2])
