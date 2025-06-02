import React, { useRef, useEffect, useState } from "react";
import Player from "./Player";
import Bullet from "./Bullet";
import Platform from "./Platform";
import HealthBar from "./HealthBar";
import backgroundImg from "../images/background.png";
import bulletH from "../images/bullet_h.png";
import bulletV from "../images/bullet_v.png";

const GameCanvas = () => {

  const bulletHImage = new Image();
  bulletHImage.src = bulletH;

  const bulletVImage = new Image();
  bulletVImage.src = bulletV;

  const canvasRef = useRef(null);
  const [health, setHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const keysRef = useRef({});
  const playerRef = useRef(new Player());
  const bulletsRef = useRef([]); // No initial bullets
  const platformsRef = useRef([new Platform(750, 500, 500, 300)]);

  const turretTimersRef = useRef([]); 

  const staticTurretsRef = useRef([
    { x: canvasSize.width - -1100, y: 100, direction: "horizontal" },
    { x: canvasSize.width - -1100, y: 230, direction: "horizontal" },
    { x: canvasSize.width - -1100, y: 360, direction: "horizontal" },
    { x: 850, y: -50, direction: "vertical" },
    { x: 1000, y: -50, direction: "vertical" },
    { x: 1150, y: -50, direction: "vertical" },
  ]);

  const resetGame = () => {
    playerRef.current = new Player();
    setHealth(100);
    setIsGameOver(false);
    keysRef.current = {};
    bulletsRef.current = [];
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const handleKeyDown = (e) => {
      e.preventDefault();
      keysRef.current[e.key] = true;
      if (e.key === "r" && isGameOver) resetGame();
    };

    const handleKeyUp = (e) => {
      e.preventDefault();
      keysRef.current[e.key] = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    if (canvas) {
      canvas.focus();
    }

    const checkCollision = (player, bullet) => {
      const playerBounds = player.getCollisionBounds();
      return (
        playerBounds.x < bullet.x + bullet.width &&
        playerBounds.x + playerBounds.width > bullet.x &&
        playerBounds.y < bullet.y + bullet.height &&
        playerBounds.y + playerBounds.height > bullet.y
      );
    };

    const bg = new Image();
    bg.src = backgroundImg;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      playerRef.current.update(keysRef.current, platformsRef.current, canvas.width);
      playerRef.current.draw(ctx);

      platformsRef.current.forEach((platform) => platform.draw(ctx));

     staticTurretsRef.current.forEach((turret) => {
      const image = turret.direction === "vertical" ? bulletVImage : bulletHImage;
      const width = turret.direction === "vertical" ? 30 : 60;
      const height = turret.direction === "vertical" ? 60 : 30;
      
      ctx.drawImage(image, turret.x, turret.y, width, height);
    });


      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.update();
        bullet.draw(ctx);

        if (checkCollision(playerRef.current, bullet)) {
          setHealth((prev) => {
            const newHealth = prev - 5;
            if (newHealth <= 0) setIsGameOver(true);
            return newHealth;
          });
          return false;
        }

        if (bullet.direction === "horizontal" && bullet.x < -bullet.width) {
          return false;
        }
        if (bullet.direction === "vertical" && bullet.y > canvas.height) {
          return false;
        }

        return true;
      });

      if (playerRef.current.y > canvas.height) setIsGameOver(true);

      if (!isGameOver) animationFrameId = requestAnimationFrame(gameLoop);
    };

    const startTurretFiring = () => {
      staticTurretsRef.current.forEach((turret) => {
        const fireBullet = () => {
          if (!isGameOver) {
            bulletsRef.current.push(new Bullet(turret.x, turret.y, turret.direction));
            const delay = Math.random() * 10000 + 1800; 
            const timerId = setTimeout(fireBullet, delay);
            turretTimersRef.current.push(timerId);
          }
        };
        fireBullet();
      });
    };

    startTurretFiring();
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      turretTimersRef.current.forEach(clearTimeout);
      turretTimersRef.current = [];
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameOver, canvasSize]);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="game-canvas"
        tabIndex="0"
        style={{ outline: "none" }}
      />
      <HealthBar health={health} />
      {isGameOver && <div className="overlay">Game Over — Press R to Restart</div>}
    </div>
  );
};

export default GameCanvas;
