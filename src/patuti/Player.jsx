import idleImg from "../images/idle-1.png";

class Player {
  constructor() {
    this.x = 380;
    this.y = 100;
    this.width = 50;
    this.height = 60;
    this.velocityY = 0;
    this.jumpPower = -15; // Increased jump power
    this.gravity = 0.8; // Increased gravity
    this.speed = 5; // Increased movement speed from 0.5 to 5
    this.grounded = false;

    this.image = new Image();
    this.image.src = idleImg;
  }

  update(keys, platforms) {
    // Handle horizontal movement
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      this.x += this.speed;
    }
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      this.x -= this.speed;
    }
    
    // Handle jumping
    if ((keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "]) && this.grounded) {
      this.velocityY = this.jumpPower;
      this.grounded = false;
    }

    // Apply gravity
    this.y += this.velocityY;
    this.velocityY += this.gravity;

    // Keep player within canvas bounds (horizontal)
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 800) this.x = 800 - this.width; // Assuming canvas width is 800

    // Only stop at ground if there are no platforms (remove automatic ground collision)
    // Let the player fall past the screen for game over detection
    let onPlatform = false;

    // Platform collision detection
    platforms.forEach(platform => {
      if (
        this.x < platform.x + platform.width &&
        this.x + this.width > platform.x &&
        this.y + this.height < platform.y + 10 &&
        this.y + this.height + this.velocityY >= platform.y
      ) {
        this.y = platform.y - this.height;
        this.velocityY = 0;
        this.grounded = true;
        onPlatform = true;
      }
    });

    // If not on a platform, player is not grounded
    if (!onPlatform) {
      this.grounded = false;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

export default Player;