import bulletH from "../images/bullet_h.png";
import bulletV from "../images/bullet_v.png";

class Bullet {
  constructor(x, y, direction = "horizontal") {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 5;
    this.direction = direction;
    this.image = new Image();
    this.imageLoaded = false;
    
    // Set up image loading
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = direction === "vertical" ? bulletV : bulletH;
  }

  update() {
    if (this.direction === "vertical") {
      this.y += this.speed;
    } else {
      this.x -= this.speed;
    }
  }

  draw(ctx) {
    if (this.imageLoaded) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // Fallback: draw a colored rectangle if image isn't loaded
      ctx.fillStyle = this.direction === "vertical" ? "red" : "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

export default Bullet;