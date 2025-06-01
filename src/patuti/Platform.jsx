import platformImg from "../images/area.png";

class Platform {
  constructor(x, y, width = 100, height = 80) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.image = new Image();
    this.image.src = platformImg;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

export default Platform;