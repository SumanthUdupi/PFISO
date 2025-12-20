from PIL import Image, ImageDraw, ImageColor
import math
import os

def create_lego_sprites():
    # ---------------------------------------------------------
    # Palette (REQ-011 to REQ-013)
    # ---------------------------------------------------------
    # Using RGB approximations for the requested Hex codes
    # REQ-011: Yellow #FCC12E -> (252, 193, 46)
    YELLOW = (252, 193, 46) 
    YELLOW_DARK = (210, 160, 0) # Shadow shade
    
    # REQ-012: Red #FE1923 -> (254, 25, 35)
    RED = (254, 25, 35)
    RED_DARK = (180, 0, 10)
    
    # REQ-013: Blue #0055BF -> (0, 85, 191)
    BLUE = (0, 85, 191)
    BLUE_DARK = (0, 50, 140)
    
    BLACK = (20, 20, 20)
    GREY = (107, 90, 90) # REQ-109 #6B5a5A
    GREY_DARK = (60, 50, 50)
    WHITE = (255, 255, 255)

    # ---------------------------------------------------------
    # Config (REQ-001)
    # ---------------------------------------------------------
    FRAME_W = 32
    FRAME_H = 48
    
    # Ensure output directory exists
    os.makedirs("public/assets/sprites", exist_ok=True)

    # ---------------------------------------------------------
    # Drawing Primitives
    # ---------------------------------------------------------
    def draw_rect(draw, x, y, w, h, color):
        if w <= 0 or h <= 0: return
        draw.rectangle([x, y, x+w-1, y+h-1], fill=color)

    def draw_shaded_rect(draw, x, y, w, h, color, shade_color):
        if w <= 0 or h <= 0: return
        draw.rectangle([x, y, x+w-1, y+h-1], fill=color)
        # Right shade
        draw.rectangle([x+w-1, y, x+w-1, y+h-1], fill=shade_color)
        # Bottom shade
        draw.rectangle([x, y+h-1, x+w-1, y+h-1], fill=shade_color)

    # ---------------------------------------------------------
    # Components
    # ---------------------------------------------------------
    def draw_head(draw, x, y, facing):
        # REQ-002: Head ~12px height
        # REQ-003: Stud 2px height, 6px width
        
        # Stud
        draw_rect(draw, x + 3, y, 6, 2, YELLOW)
        
        # Head Main (12x10 roughly to fit 12px height inc stud?)
        # Let's say Head is 10px high + 2px stud = 12px total.
        head_y = y + 2
        w, h = 12, 10
        
        draw_shaded_rect(draw, x, head_y, w, h, YELLOW, YELLOW_DARK)
        
        # REQ-014: Plastic Highlight
        draw.point((x + 1, head_y + 1), fill=WHITE)
        
        # Face REQ-015
        if facing in ['front', 'front_walk']:
            # Eyes
            draw_rect(draw, x + 3, head_y + 3, 2, 2, BLACK)
            draw_rect(draw, x + 7, head_y + 3, 2, 2, BLACK)
            # Smile
            draw.arc([x + 3, head_y + 4, x + 8, head_y + 7], start=0, end=180, fill=BLACK)
            
        elif facing in ['right', 'left']:
            # Profile Eye
            eye_x = x + 8 if facing == 'right' else x + 2
            draw_rect(draw, eye_x, head_y + 3, 2, 2, BLACK)

    def draw_torso_trapezoid(draw, x, y, facing):
        # REQ-004: Top 14px, Bottom 18px. Height 14px.
        # This is for Front/Back. Side is thinner.
        
        c = RED
        s = RED_DARK
        
        if facing in ['front', 'back', 'front_walk', 'back_walk']:
            # We can't do true trapezoid easily with PIL rectangle, use polygon
            # Center x is roughly 6. Top width 14 (-7 to +7). Bottom 18 (-9 to +9).
            # But x is top-left of the bounding BOX.
            # Bounding box is 18px wide.
            
            # Points for trapezoid
            # Top: x+2 to x+16 (14px wide)
            # Bottom: x to x+18 (18px wide)
            
            poly = [
                (x + 2, y),      # Top Left
                (x + 16, y),     # Top Right
                (x + 18, y + 14),# Bottom Right
                (x, y + 14)      # Bottom Left
            ]
            draw.polygon(poly, fill=c)
            
            # Logo REQ-017 on Front
            if facing in ['front', 'front_walk']:
                # Planet logo (simplified)
                draw.ellipse([x + 6, y + 4, x + 12, y + 10], outline=WHITE)
                draw.line([x+4, y+7, x+14, y+7], fill=WHITE)
                
        else:
            # Side view
            # Width ~8px
            draw_shaded_rect(draw, x + 4, y, 10, 14, c, s)

    def draw_hand_c_shape(draw, x, y, facing):
        # REQ-007: C shape 6x6
        # Draw yellow box, clear middle
        draw_rect(draw, x, y, 6, 6, YELLOW)
        
        # Clear center based on facing
        draw_rect(draw, x+2, y+2, 2, 2, (0,0,0,0) if facing != 'back' else YELLOW)


    def draw_character(draw, slot_x, slot_y, facing, frame_idx):
        # Center of the 32x48 slot
        cx = slot_x + 16
        base_y = slot_y + 48
        
        # REQ-033: Anchor at (16, 48)
        
        # Measurements
        leg_h = 12
        hip_h = 2 # REQ-009
        torso_h = 14
        head_h = 12
        
        # Bobbing (REQ-028)
        bob = 0
        if frame_idx % 4 == 0 or frame_idx % 4 == 4:
            bob = 1 # Down 1px on contact frames
            
        # Coordinates
        current_y = base_y - leg_h + bob
        hip_y = current_y - hip_h
        torso_y = hip_y - torso_h
        head_y = torso_y - head_h + 2 # Neck overlap
        
        # Animation
        phase = 0
        if frame_idx >= 0:
            phase = (frame_idx / 8.0) * 2 * math.pi
            
        swing = math.sin(phase) * 4 if frame_idx >= 0 else 0
        
        # --- DRAW LEGS ---
        def draw_leg(lx, ly, is_left):
            # REQ-006: Leg separation
            # REQ-002: 12px High
            # Offset based on swing
            draw_shaded_rect(draw, lx, ly, 6, 12, BLUE, BLUE_DARK)
            
        # Leg base positions
        # Center is 16. Width 18 total at hips?
        # Let's place legs at roughly hips width.
        l_leg_base_x = cx - 7
        r_leg_base_x = cx + 1
        
        l_leg_y = base_y - 12 + bob
        r_leg_y = base_y - 12 + bob
        
        # Apply Swing
        l_swing = 0
        r_swing = 0
        
        if facing in ['right', 'left', 'front_walk', 'back_walk']:
            if facing == 'right':
                l_swing = -swing
                r_swing = swing
            elif facing == 'left':
                r_swing = -swing
                l_swing = swing
            else:
                l_swing = swing
                r_swing = -swing
            
        # Draw Legs logic
        # Right view: Left is Far (draw first)
        # Left view: Right is Far (draw first)
        
        if facing == 'right':
            # Draw Left Leg (Far)
            draw_leg(cx - 3 + int(l_swing), l_leg_y, True)
        elif facing == 'left':
            # Draw Right Leg (Far)
            draw_leg(cx - 3 + int(r_swing), r_leg_y, False)
            
        # --- HIPS ---
        if facing in ['front', 'back', 'front_walk', 'back_walk']:
             draw_rect(draw, cx - 7, hip_y, 14, 2, GREY)
        else:
             draw_rect(draw, cx - 4, hip_y, 8, 2, GREY)

        # --- TORSO ---
        if facing in ['front', 'back', 'front_walk', 'back_walk']:
             draw_torso_trapezoid(draw, cx - 9, torso_y, facing)
        else:
             draw_torso_trapezoid(draw, cx - 5, torso_y, facing)
             
        # --- HEAD ---
        draw_head(draw, cx - 6, head_y, facing)
        
        # --- ARMS & LEGS (NEAR) ---
        def draw_arm_assembly(ax, ay, angle_deg, is_left):
            # Simple offset based on angle
            arm_swing_x = math.sin(math.radians(angle_deg)) * 4
            arm_swing_y = math.cos(math.radians(angle_deg)) * 2 # Reduced Y movement
            
            final_x = ax + int(arm_swing_x)
            final_y = ay # Simplified vertical movement
            
            draw_rect(draw, final_x, final_y, 4, 10, RED)
            draw_hand_c_shape(draw, final_x - 1, final_y + 10, facing)

        # Offsets
        l_arm_x = cx - 13
        r_arm_x = cx + 9
        arm_y = torso_y + 2
        
        # Angles
        l_arm_angle = 0
        r_arm_angle = 0
        if frame_idx >= 0:
            current_swing = math.sin(phase) * 45
            if facing == 'right':
                 r_arm_angle = -current_swing
                 l_arm_angle = current_swing
            elif facing == 'left':
                 l_arm_angle = -current_swing
                 r_arm_angle = current_swing
            else:
                 l_arm_angle = current_swing
                 r_arm_angle = -current_swing

        if facing == 'right':
             # Far Arm (Left)
             draw_arm_assembly(cx - 2, arm_y, l_arm_angle, True)
             # Near Leg (Right)
             draw_leg(cx - 3 + int(r_swing), r_leg_y, False)
             # Near Arm (Right)
             draw_arm_assembly(cx - 2, arm_y, r_arm_angle, False)
             
        elif facing == 'left':
             # Far Arm (Right)
             draw_arm_assembly(cx - 2, arm_y, r_arm_angle, False)
             # Near Leg (Left)
             draw_leg(cx - 3 + int(l_swing), l_leg_y, True)
             # Near Arm (Left)
             draw_arm_assembly(cx - 2, arm_y, l_arm_angle, True)
             
        elif facing == 'front' or facing == 'front_walk':
             # Legs
             draw_leg(cx - 7, l_leg_y + int(l_swing * 0.5), True) # Less Swing on Y for front
             draw_leg(cx + 1, r_leg_y - int(l_swing * 0.5), False)
             
             draw_arm_assembly(l_arm_x, arm_y, l_arm_angle, True)
             draw_arm_assembly(r_arm_x, arm_y, r_arm_angle, False)
             
        elif facing == 'back' or facing == 'back_walk':
             # Legs
             draw_leg(cx - 7, l_leg_y + int(l_swing * 0.5), True)
             draw_leg(cx + 1, r_leg_y - int(l_swing * 0.5), False)
             
             draw_arm_assembly(l_arm_x, arm_y, l_arm_angle, True)
             draw_arm_assembly(r_arm_x, arm_y, r_arm_angle, False)


    # ---------------------------------------------------------
    # Generate Sheets
    # ---------------------------------------------------------
    
    # Idle Sheet
    idle_sheet = Image.new("RGBA", (FRAME_W, FRAME_H * 4), (0, 0, 0, 0))
    d_idle = ImageDraw.Draw(idle_sheet)
    
    draw_character(d_idle, 0, 0 * FRAME_H, 'front', -1)
    draw_character(d_idle, 0, 1 * FRAME_H, 'right', -1)
    draw_character(d_idle, 0, 2 * FRAME_H, 'back', -1)
    draw_character(d_idle, 0, 3 * FRAME_H, 'left', -1)
    
    idle_sheet.save("public/assets/sprites/player-idle.png")
    
    # Walk Sheet: 8 cols x 4 rows
    walk_sheet = Image.new("RGBA", (FRAME_W * 8, FRAME_H * 4), (0, 0, 0, 0))
    d_walk = ImageDraw.Draw(walk_sheet)
    
    for i in range(8):
        draw_character(d_walk, i * FRAME_W, 0 * FRAME_H, 'front_walk', i)
        draw_character(d_walk, i * FRAME_W, 1 * FRAME_H, 'right', i)
        draw_character(d_walk, i * FRAME_W, 2 * FRAME_H, 'back_walk', i)
        draw_character(d_walk, i * FRAME_W, 3 * FRAME_H, 'left', i)

    walk_sheet.save("public/assets/sprites/player-walk.png")
    print(f"Sprites generated at {FRAME_W}x{FRAME_H}.")

if __name__ == "__main__":
    create_lego_sprites()
