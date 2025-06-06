import idle1 from "../images/idle-1.png";
import idle2 from "../images/idle-2.png";

import dock1 from "../images/dock-1.png";
import dock2 from "../images/dock-2.png";
import dock3 from "../images/dock-3.png";
import dock4 from "../images/dock-4.png";
import dock5 from "../images/dock-5.png";

import left1 from "../images/left-1.png";
import left2 from "../images/left-2.png";
import left3 from "../images/left-3.png";
import left4 from "../images/left-4.png";
import left5 from "../images/left-5.png";

import right1 from "../images/right-1.png";
import right2 from "../images/right-2.png";
import right3 from "../images/right-3.png";
import right4 from "../images/right-4.png";
import right5 from "../images/right-5.png";

import jump1 from "../images/jump-1.png";
import jump2 from "../images/jump-2.png";
import jump3 from "../images/jump-3.png";
import jump4 from "../images/jump-4.png";
import jump5 from "../images/jump-5.png";
import jump6 from "../images/jump-6.png";
import jump7 from "../images/jump-7.png";

class Player {
  constructor() {
    this.x = 900;
    this.y = 340;
    this.width = 120;
    this.height = 40;
    this.originalHeight = 160; 
    this.velocityY = 0;
    this.jumpPower = -20;
    this.gravity = 0.8;
    this.speed = 5;
    this.grounded = true;

    this.currentAnimation = "idle";
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.frameDelay = 8; 
    
    this.animations = {
      idle: [idle1, idle2],
      dock: [dock1, dock2, dock3, dock4, dock5],
      walkLeft: [left1, left2, left3, left4, left5],
      walkRight: [right1, right2, right3, right4, right5],
      jump: [jump1, jump2, jump3, jump4, jump5, jump6, jump7]
    };

    this.loadedImages = {};
    Object.keys(this.animations).forEach(animName => {
      this.loadedImages[animName] = [];
      this.animations[animName].forEach((src, index) => {
        const img = new Image();
        img.src = src;
        this.loadedImages[animName][index] = img;
      });
    });

    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDocking = false;
  }

  update(keys, platforms, canvasWidth = 800) {
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDocking = false;

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
      this.x += this.speed;
      this.isMovingRight = true;
    }
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
      this.x -= this.speed;
      this.isMovingLeft = true;
    }
    
    const wasDocking = this.isDocking;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
      this.isDocking = true;
      const newHeight = this.originalHeight * 0.6;
      if (this.height !== newHeight) {
        this.height = newHeight;
      }
    } else {
      this.isDocking = false;
      if (this.height !== this.originalHeight && !this.grounded) {
        if (this.grounded && wasDocking) {
          const heightDifference = this.originalHeight - this.height;
          this.y += heightDifference + 50; 
        }
        this.height = this.originalHeight;
      }
    }
    
    // Jump controls - prevent jumping while docking
    if ((keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "]) && this.grounded && !this.isDocking) {
      this.velocityY = this.jumpPower;
      this.grounded = false;
    }

    // Apply gravity
    this.y += this.velocityY;
    this.velocityY += this.gravity;

    // Boundary checking
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;

    // Platform collision detection
    let onPlatform = false;
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

    if (!onPlatform) {
      this.grounded = false;
    }

    this.updateAnimation();
  }

  updateAnimation() {
    let newAnimation = "idle";

    if (!this.grounded) {
      newAnimation = "jump";
    } else if (this.isDocking) {
      newAnimation = "dock";
    } else if (this.isMovingLeft) {
      newAnimation = "walkLeft";
    } else if (this.isMovingRight) {
      newAnimation = "walkRight";
    } else {
      newAnimation = "idle";
    }

    if (newAnimation !== this.currentAnimation) {
      this.currentAnimation = newAnimation;
      this.currentFrame = 0;
      this.frameCounter = 0;
    }

    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= this.animations[this.currentAnimation].length) {
        this.currentFrame = 0;
      }
    }
  }

  draw(ctx) {
    const currentImg = this.loadedImages[this.currentAnimation][this.currentFrame];
    if (currentImg) {
      ctx.drawImage(currentImg, this.x, this.y, this.width, this.height);
    }
  }

  // Method to get collision bounds (useful for bullet collision)
  getCollisionBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}

export default Player;