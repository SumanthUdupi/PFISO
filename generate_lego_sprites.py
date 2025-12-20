from PIL import Image, ImageDraw

def create_lego_sprites():
    # Colors
    YELLOW = (252, 194, 0) # Lego Bright Yellow
    RED = (254, 25, 35)    # Lego Bright Red
    BLUE = (0, 85, 191)    # Lego Bright Blue
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    DARK_GREY = (107, 90, 90)

    # Dimensions
    WIDTH = 32
    HEIGHT = 48

    # ---------------------------------------------------------
    # Helper to draw a frame
    # ---------------------------------------------------------
    def draw_frame(draw, x_offset, y_offset, frame_index, row_index, action="idle"):
        # Base coordinates relative to the frame slot
        bx = x_offset
        by = y_offset

        # Animation offsets
        head_y = 2
        torso_y = 14
        legs_y = 28

        # Bobbing
        if action == "walk":
            if frame_index % 2 == 0:
                head_y += 1
                torso_y += 1

            # Leg movement logic (simple block swapping/shifting)
            # Row 0=South, 1=SW, 2=W, 3=NW (mapped later)
            # Actually let's follow standard: 0=S, 1=W, 2=E, 3=N usually?
            # Or Iso: SW, SE, NW, NE.
            pass

        # Draw Head (Yellow)
        # Stud
        draw.rectangle([bx + 13, by + head_y - 2, bx + 19, by + head_y], fill=YELLOW)
        # Head
        draw.rectangle([bx + 10, by + head_y, bx + 22, by + head_y + 10], fill=YELLOW)

        # Face (on South and SE/SW views)
        # Row 0 (S), 1 (SW/SE?), 2...
        # Let's assume Row 0 = Front/South for now
        if row_index in [0, 1]:
            # Eyes
            draw.point([bx + 13, by + head_y + 4], fill=BLACK)
            draw.point([bx + 18, by + head_y + 4], fill=BLACK)
            # Smile
            draw.arc([bx + 13, by + head_y + 4, bx + 19, by + head_y + 7], start=0, end=180, fill=BLACK)

        # Draw Torso (Red)
        # Trapezoid shape approx
        draw.polygon([
            (bx + 9, by + torso_y), (bx + 23, by + torso_y),  # Shoulders
            (bx + 25, by + torso_y + 12), (bx + 7, by + torso_y + 12) # Hips top
        ], fill=RED)

        # Arms (Yellow hands, Red sleeves)
        # Simple rectangles for now
        if action == "walk":
            swing = (frame_index % 8) - 4 # -4 to 3
            draw.rectangle([bx + 5, by + torso_y + 2 + swing, bx + 9, by + torso_y + 10 + swing], fill=RED) # Left Arm
            draw.rectangle([bx + 23, by + torso_y + 2 - swing, bx + 27, by + torso_y + 10 - swing], fill=RED) # Right Arm
            # Hands
            draw.rectangle([bx + 5, by + torso_y + 10 + swing, bx + 9, by + torso_y + 13 + swing], fill=YELLOW)
            draw.rectangle([bx + 23, by + torso_y + 10 - swing, bx + 27, by + torso_y + 13 - swing], fill=YELLOW)
        else:
            # Idle arms
            draw.rectangle([bx + 6, by + torso_y + 2, bx + 9, by + torso_y + 10], fill=RED)
            draw.rectangle([bx + 23, by + torso_y + 2, bx + 26, by + torso_y + 10], fill=RED)
            draw.rectangle([bx + 6, by + torso_y + 10, bx + 9, by + torso_y + 13], fill=YELLOW)
            draw.rectangle([bx + 23, by + torso_y + 10, bx + 26, by + torso_y + 13], fill=YELLOW)


        # Draw Hips (Dark Grey)
        draw.rectangle([bx + 11, by + torso_y + 12, bx + 21, by + torso_y + 14], fill=DARK_GREY)

        # Draw Legs (Blue)
        draw.rectangle([bx + 11, by + legs_y, bx + 15, by + legs_y + 12], fill=BLUE) # Left Leg
        draw.rectangle([bx + 17, by + legs_y, bx + 21, by + legs_y + 12], fill=BLUE) # Right Leg

        # Walk cycle legs
        if action == "walk":
            # Just simple color swap to simulate stepping?
            # Or offset height?
            # Let's offset height of the blue rects
            step = (frame_index % 4)
            if step == 0 or step == 1:
                # Left leg up
                draw.rectangle([bx + 11, by + legs_y, bx + 15, by + legs_y + 10], fill=BLUE)
            else:
                 # Right leg up
                draw.rectangle([bx + 17, by + legs_y, bx + 21, by + legs_y + 10], fill=BLUE)


    # ---------------------------------------------------------
    # Create Idle Sheet (1 col x 4 rows)
    # ---------------------------------------------------------
    # Actually code uses 1 frame for idle currently in logic, but we can make it 1 col x 4 rows for direction
    idle_sheet = Image.new("RGBA", (WIDTH, HEIGHT * 4), (0, 0, 0, 0))
    draw_idle = ImageDraw.Draw(idle_sheet)

    for row in range(4):
        draw_frame(draw_idle, 0, row * HEIGHT, 0, row, "idle")

    idle_sheet.save("public/assets/sprites/player-idle.png")
    idle_sheet.save("public/assets/sprites/player-idle.webp")
    print("Generated player-idle.png/webp")

    # ---------------------------------------------------------
    # Create Walk Sheet (8 cols x 4 rows)
    # ---------------------------------------------------------
    walk_sheet = Image.new("RGBA", (WIDTH * 8, HEIGHT * 4), (0, 0, 0, 0))
    draw_walk = ImageDraw.Draw(walk_sheet)

    for row in range(4): # 4 Directions
        for col in range(8): # 8 Frames
            draw_frame(draw_walk, col * WIDTH, row * HEIGHT, col, row, "walk")

    walk_sheet.save("public/assets/sprites/player-walk.png")
    walk_sheet.save("public/assets/sprites/player-walk.webp")
    print("Generated player-walk.png/webp")

if __name__ == "__main__":
    create_lego_sprites()
