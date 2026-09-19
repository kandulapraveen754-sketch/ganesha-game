
import turtle

# Set up the screen
screen = turtle.Screen()
screen.bgcolor("black")
screen.title("Lord Ganesha Drawing")

# Set up the drawing pen
pen = turtle.Turtle()
pen.speed(3)
pen.pensize(3)
pen.color("#FFD700")  # Metallic Gold color
pen.hideturtle()

def draw_ganesha():
    # --- Ears ---
    pen.penup()
    pen.goto(-100, 50)
    pen.pendown()
    pen.circle(50, 180)  # Left Ear
    
    pen.penup()
    pen.goto(100, 50)
    pen.pendown()
    pen.circle(-50, 180)  # Right Ear

    # --- Head and Crown ---
    pen.penup()
    pen.goto(-60, 120)
    pen.pendown()
    pen.goto(0, 200)      # Crown top
    pen.goto(60, 120)
    pen.goto(-60, 120)    # Crown base

    # --- Face and Trunk ---
    pen.penup()
    pen.goto(-50, 100)
    pen.pendown()
    pen.right(45)
    pen.circle(70, 90)    # Head outline
    
    # Drawing the long trunk curving to the right
    pen.forward(50)
    pen.circle(30, 180)   # Trunk curve
    pen.forward(20)

    # --- Tilak (Forehead Mark) ---
    pen.penup()
    pen.goto(-15, 140)
    pen.setheading(0)
    pen.pendown()
    pen.forward(30)
    
    pen.penup()
    pen.goto(-20, 155)
    pen.pendown()
    pen.forward(40)
    
    pen.penup()
    pen.goto(0, 125)
    pen.pendown()
    pen.circle(4)         # Bottom dot

    # --- Eyes ---
    pen.penup()
    pen.goto(-35, 90)
    pen.pendown()
    pen.circle(8, 180)    # Left Eye
    
    pen.penup()
    pen.goto(15, 90)
    pen.pendown()
    pen.circle(8, 180)     # Right Eye

# Run the drawing function
draw_ganesha()

# Keep the window open
turtle.done()