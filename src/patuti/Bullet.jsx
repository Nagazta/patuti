import bulletH from "../images/bullet_h.png";
import bulletV from "../images/bullet_v.png";

class Bullet {
  constructor(x, y, direction = "horizontal") {
    this.x = x;
    this.y = y;
    
    if (direction === "horizontal") {
      this.width = 60; 
      this.height = 30; 
    } else {
      this.width = 30;  
      this.height = 60; 
    }
    
    this.speed = 10;
    this.direction = direction;
    this.image = new Image();
    this.imageLoaded = false;
    
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
      ctx.fillStyle = this.direction === "vertical" ? "red" : "blue";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

export default Bullet;