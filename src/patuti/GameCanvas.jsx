import React, { useRef, useEffect, useState } from "react";
import Player from "./Player";
import Bullet from "./Bullet";
import Platform from "./Platform";
import HealthBar from "./HealthBar";
import backgroundImg from "../images/background.png";

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [health, setHealth] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const keysRef = useRef({});
  const playerRef = useRef(new Player());
  const bulletsRef = useRef([
    new Bullet(800, 400, "horizontal"),
    new Bullet(800, 0, "vertical"),
  ]);
  const platformsRef = useRef([new Platform(750, 500, 500, 300)]);

  const resetGame = () => {
    playerRef.current = new Player();
    setHealth(100);
    setIsGameOver(false);
    keysRef.current = {}; 
    bulletsRef.current = [
      new Bullet(canvasSize.width, 400, "horizontal"),
      new Bullet(200, 0, "vertical"),
    ];
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const handleKeyDown = (e) => {
      e.preventDefault();
      keysRef.current[e.key] = true;
      console.log('Key pressed:', e.key); 
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

      if (bulletsRef.current.length < 3) {
        if (Math.random() < 0.51) { 
          if (Math.random() < 0.5) {
            bulletsRef.current.push(new Bullet(canvas.width, Math.random() * 300 + 50, "horizontal"));
          } else {
            bulletsRef.current.push(new Bullet(Math.random() * canvas.width, -20, "vertical"));
          }
        }
      }

      if (playerRef.current.y > canvas.height) setIsGameOver(true);

      if (!isGameOver) animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
        style={{ outline: 'none' }}
      />
      <HealthBar health={health} />
      {isGameOver && <div className="overlay">Game Over — Press R to Restart</div>}
    </div>
  );
};

export default GameCanvas;