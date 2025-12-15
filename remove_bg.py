from PIL import Image
import os

def process_image(path, mode='black'):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()
        new_data = []

        for item in datas:
            if mode == 'black':
                # Remove Black (0,0,0) AND White (>230, >230, >230) for Skeleton
                # User complaint: "White stuff behind". Previous reset removed white transparency.
                r, g, b, a = item
                is_black = (r < 10 and g < 10 and b < 10)
                is_white = (r > 230 and g > 230 and b > 230)
                
                if is_black or is_white:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append(item)
            elif mode == 'white':
                # Remove White (Threshold > 230)
                if item[0] > 230 and item[1] > 230 and item[2] > 230:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append(item)

        img.putdata(new_data)
        img.save(path, "PNG")
        print(f"Successfully processed {path} (Mode: {mode})")

    except Exception as e:
        print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    process_image(r"C:\Users\ykdj\.gemini\antigravity\scratch\sandbag_game\skeleton_archer.png", mode='black')
    process_image(r"C:\Users\ykdj\.gemini\antigravity\scratch\sandbag_game\arrow.png", mode='white')
