from PIL import Image, ImageDraw, ImageColor
import math

def create_lego_sprites():
    # Palette
    YELLOW = (255, 205, 0)
    YELLOW_DARK = (210, 160, 0)
    RED = (220, 0, 0)
    RED_DARK = (160, 0, 0)
    BLUE = (0, 70, 180)
    BLUE_DARK = (0, 40, 120)
    BLACK = (20, 20, 20)
    GREY = (100, 100, 100)
    GREY_DARK = (60, 60, 60)
    SKIN_SHADOW = (230, 180, 0)

    # Config
    FRAME_SIZE = 64
    SCALE = 1 # Internal drawing scale, can be used if we want higher res source then downscale

    # ---------------------------------------------------------
    # Drawing Primitives
    # ---------------------------------------------------------
    def draw_rect(draw, x, y, w, h, color):
        draw.rectangle([x, y, x+w, y+h], fill=color)

    def draw_shaded_rect(draw, x, y, w, h, color, shade_color, shade_width=2):
        draw.rectangle([x, y, x+w, y+h], fill=color)
        # Right shade
        draw.rectangle([x+w-shade_width, y, x+w, y+h], fill=shade_color)
        # Bottom shade
        draw.rectangle([x, y+h-shade_width, x+w, y+h], fill=shade_color)

    # ---------------------------------------------------------
    # Part Drawers
    # ---------------------------------------------------------
    def draw_head(draw, x, y, facing):
        # Head is roughly 14x12
        w, h = 14, 12

        # Stud on top
        draw_rect(draw, x + 4, y - 2, 6, 2, YELLOW)

        # Main Head
        draw_shaded_rect(draw, x, y, w, h, YELLOW, YELLOW_DARK, 2)

        # Face
        if facing == 'front':
            # Eyes
            draw_rect(draw, x + 3, y + 4, 2, 2, BLACK)
            draw_rect(draw, x + 9, y + 4, 2, 2, BLACK)
            # Smile
            draw.arc([x + 3, y + 5, x + 10, y + 9], start=0, end=180, fill=BLACK, width=1)
        elif facing == 'right':
            # Side profile eye
            draw_rect(draw, x + 10, y + 4, 2, 2, BLACK)
        elif facing == 'left':
            # Side profile eye
            draw_rect(draw, x + 2, y + 4, 2, 2, BLACK)

    def draw_torso(draw, x, y, facing):
        # Trapezoid-ish body
        # For pixel art, we can stack rects

        # Neck
        # draw_rect(draw, x + 4, y, 6, 12, RED) # Covered by main body

        # Main Body: 16 wide at top, 18 wide at bottom? Or boxy.
        # Lego torso is trapezoid.

        color = RED
        shade = RED_DARK

        if facing == 'front' or facing == 'back':
            # Top part
            draw_rect(draw, x + 2, y, 12, 14, color)
            # Sides shading to fake trapezoid
            # Left slope
            # draw.polygon([(x+2, y), (x, y+14), (x+2, y+14)], fill=shade)
            # Just draw a rect
            draw_shaded_rect(draw, x, y, 16, 14, color, shade, 2)
        else:
            # Side view: Thinner
            draw_shaded_rect(draw, x + 4, y, 8, 14, color, shade, 2)

    def draw_hips(draw, x, y, facing):
        color = GREY
        shade = GREY_DARK
        if facing == 'front' or facing == 'back':
             draw_shaded_rect(draw, x, y, 16, 4, color, shade, 2)
        else:
             draw_shaded_rect(draw, x + 4, y, 8, 4, color, shade, 1)

    def draw_leg(draw, x, y, facing, action, is_left_leg):
        color = BLUE
        shade = BLUE_DARK

        w, h = 6, 12
        dx, dy = 0, 0

        if action == 'idle':
            pass
        elif action == 'walk':
             # Simple swing
             pass

        draw_shaded_rect(draw, x, y, w, h, color, shade, 2)

    # ---------------------------------------------------------
    # Frame Assembler
    # ---------------------------------------------------------
    def draw_character(draw, center_x, base_y, facing, frame_index):
        # Coordinate calculation
        # Center X is center of sprite slot
        # Base Y is where feet touch ground

        # Animation State
        # Walk cycle: 8 frames
        # 0: Contact (Right forward)
        # 1: Recoil
        # 2: Passing
        # 3: High Point
        # 4: Contact (Left forward)
        # ...

        # Bobbing
        bob = 0
        if frame_index % 4 == 1: bob = 1
        if frame_index % 4 == 3: bob = -1

        # Dimensions
        head_h = 14
        torso_h = 14
        hip_h = 4
        leg_h = 12

        total_h = head_h + torso_h + hip_h + leg_h # 44 px

        # Positions
        # Hips are the anchor usually? Or feet.
        # Let's anchor feet at base_y

        hip_y = base_y - leg_h - hip_h + bob
        torso_y = hip_y - torso_h
        head_y = torso_y - head_h + 2 # Overlap neck

        # X Anchors
        body_x = center_x - 8 # Assuming body width 16

        # Calculate limb swings
        left_arm_angle = 0
        right_arm_angle = 0
        left_leg_angle = 0
        right_leg_angle = 0

        swing_mag = 6 # pixels offset

        phase = frame_index / 8.0 * 2 * math.pi

        if facing == 'idle':
             pass
        else:
             # Walk
             sw = math.sin(phase) * swing_mag
             right_leg_offset = sw
             left_leg_offset = -sw

             right_arm_offset = -sw
             left_arm_offset = sw

        # Draw Order depends on facing
        # Front: Back Arm/Leg -> Body -> Front Arm/Leg?
        # Actually side view matters most for draw order.

        # --- DRAWING ---

        # Functions to draw limbs at offsets
        def draw_arm(side, offset_x, offset_y):
            # Arm is RED, Hand is YELLOW
            # Simple rect for now
            draw_rect(draw, offset_x, offset_y, 4, 10, RED)
            draw_rect(draw, offset_x, offset_y + 10, 4, 3, YELLOW)

        def draw_leg_shape(offset_x, offset_y, h_offset):
             # h_offset simulates lifting leg
             lift = 0
             if abs(h_offset) > 3: lift = 2 # Lift foot at extremes

             draw_shaded_rect(draw, offset_x, offset_y - lift, 6, 12, BLUE, BLUE_DARK, 1)

        # Facing Logic
        if facing == 'front':
            # Legs
            draw_leg_shape(body_x + 1, base_y - 12 + bob, 0) # Left
            draw_leg_shape(body_x + 9, base_y - 12 + bob, 0) # Right

            # Hips
            draw_hips(draw, body_x, hip_y, 'front')

            # Torso
            draw_torso(draw, body_x, torso_y, 'front')

            # Head
            draw_head(draw, body_x + 1, head_y, 'front')

            # Arms (Side)
            # Idle arms
            draw_arm('left', body_x - 4, torso_y + 2)
            draw_arm('right', body_x + 16, torso_y + 2)

        elif facing == 'back':
            # Legs
            draw_leg_shape(body_x + 1, base_y - 12 + bob, 0)
            draw_leg_shape(body_x + 9, base_y - 12 + bob, 0)
            # Hips
            draw_hips(draw, body_x, hip_y, 'back')
            # Torso
            draw_torso(draw, body_x, torso_y, 'back')
            # Head
            draw_head(draw, body_x + 1, head_y, 'back')
            # Arms
            draw_arm('left', body_x - 4, torso_y + 2)
            draw_arm('right', body_x + 16, torso_y + 2)

        elif facing == 'right': # Facing Right (Profile)
            # Left Leg (Far)
            l_off = 0
            if frame_index != -1: l_off = -math.sin(phase) * 4
            draw_leg_shape(center_x - 3 + l_off, base_y - 12 + bob, l_off)

            # Left Arm (Far)
            l_arm_off = 0
            if frame_index != -1: l_arm_off = math.sin(phase) * 3
            draw_arm('left', center_x - 2 + l_arm_off, torso_y + 2)

            # Torso/Hips/Head (Side view)
            draw_hips(draw, center_x - 4, hip_y, 'side')
            draw_torso(draw, center_x - 4, torso_y, 'side')
            draw_head(draw, center_x - 4, head_y, 'right')

            # Right Leg (Near)
            r_off = 0
            if frame_index != -1: r_off = math.sin(phase) * 4
            draw_leg_shape(center_x - 3 + r_off, base_y - 12 + bob, r_off)

            # Right Arm (Near)
            r_arm_off = 0
            if frame_index != -1: r_arm_off = -math.sin(phase) * 3
            draw_arm('right', center_x - 2 + r_arm_off, torso_y + 2)

        elif facing == 'left': # Facing Left (Profile)
            # Mirror of Right mostly, but draw order changes?
            # Right Leg (Far)
            r_off = 0
            if frame_index != -1: r_off = math.sin(phase) * 4
            draw_leg_shape(center_x - 3 + r_off, base_y - 12 + bob, r_off)

            # Right Arm (Far)
            r_arm_off = 0
            if frame_index != -1: r_arm_off = -math.sin(phase) * 3
            draw_arm('right', center_x - 2 + r_arm_off, torso_y + 2)

            # Body
            draw_hips(draw, center_x - 4, hip_y, 'side')
            draw_torso(draw, center_x - 4, torso_y, 'side')
            draw_head(draw, center_x - 4, head_y, 'left')

            # Left Leg (Near)
            l_off = 0
            if frame_index != -1: l_off = -math.sin(phase) * 4
            draw_leg_shape(center_x - 3 + l_off, base_y - 12 + bob, l_off)

            # Left Arm (Near)
            l_arm_off = 0
            if frame_index != -1: l_arm_off = math.sin(phase) * 3
            draw_arm('left', center_x - 2 + l_arm_off, torso_y + 2)

        elif facing == 'front_walk':
             # Walk Front
             # Legs separate
             off = math.sin(phase) * 2 # Slight up/down

             draw_leg_shape(body_x + 1, base_y - 12 + bob + off, 0) # Left
             draw_leg_shape(body_x + 9, base_y - 12 + bob - off, 0) # Right

             draw_hips(draw, body_x, hip_y, 'front')
             draw_torso(draw, body_x, torso_y, 'front')
             draw_head(draw, body_x + 1, head_y, 'front')

             # Arms swing
             l_arm_off = math.sin(phase) * 3
             r_arm_off = -math.sin(phase) * 3

             draw_arm('left', body_x - 4, torso_y + 2 + l_arm_off)
             draw_arm('right', body_x + 16, torso_y + 2 + r_arm_off)

        elif facing == 'back_walk':
             off = math.sin(phase) * 2
             draw_leg_shape(body_x + 1, base_y - 12 + bob + off, 0)
             draw_leg_shape(body_x + 9, base_y - 12 + bob - off, 0)
             draw_hips(draw, body_x, hip_y, 'back')
             draw_torso(draw, body_x, torso_y, 'back')
             draw_head(draw, body_x + 1, head_y, 'back')
             l_arm_off = math.sin(phase) * 3
             r_arm_off = -math.sin(phase) * 3
             draw_arm('left', body_x - 4, torso_y + 2 + l_arm_off)
             draw_arm('right', body_x + 16, torso_y + 2 + r_arm_off)

    # ---------------------------------------------------------
    # Generate Sheets
    # ---------------------------------------------------------

    # Idle Sheet: 1 Col x 4 Rows (Front, Right, Back, Left)
    idle_sheet = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE * 4), (0, 0, 0, 0))
    draw_idle = ImageDraw.Draw(idle_sheet)

    # Row 0: Front
    draw_character(draw_idle, FRAME_SIZE//2, FRAME_SIZE - 4, 'front', -1)
    # Row 1: Right
    draw_character(draw_idle, FRAME_SIZE//2, FRAME_SIZE - 4, 'right', -1)
    # Row 2: Back
    draw_character(draw_idle, FRAME_SIZE//2, FRAME_SIZE - 4, 'back', -1)
    # Row 3: Left
    draw_character(draw_idle, FRAME_SIZE//2, FRAME_SIZE - 4, 'left', -1)

    idle_sheet.save("public/assets/sprites/player-idle.png")

    # Walk Sheet: 8 Cols x 4 Rows
    walk_sheet = Image.new("RGBA", (FRAME_SIZE * 8, FRAME_SIZE * 4), (0, 0, 0, 0))
    draw_walk = ImageDraw.Draw(walk_sheet)

    for col in range(8):
        # Row 0: Front
        draw_character(draw_walk, col * FRAME_SIZE + FRAME_SIZE//2, 0 * FRAME_SIZE + FRAME_SIZE - 4, 'front_walk', col)
        # Row 1: Right
        draw_character(draw_walk, col * FRAME_SIZE + FRAME_SIZE//2, 1 * FRAME_SIZE + FRAME_SIZE - 4, 'right', col)
        # Row 2: Back
        draw_character(draw_walk, col * FRAME_SIZE + FRAME_SIZE//2, 2 * FRAME_SIZE + FRAME_SIZE - 4, 'back_walk', col)
        # Row 3: Left
        draw_character(draw_walk, col * FRAME_SIZE + FRAME_SIZE//2, 3 * FRAME_SIZE + FRAME_SIZE - 4, 'left', col)

    walk_sheet.save("public/assets/sprites/player-walk.png")

    print("Sprites generated.")

if __name__ == "__main__":
    create_lego_sprites()
