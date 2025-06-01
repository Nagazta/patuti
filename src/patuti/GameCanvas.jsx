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
  
  const keysRef = useRef({});
  const playerRef = useRef(new Player());
  const bulletsRef = useRef([
    new Bullet(800, 100, "horizontal"),
    new Bullet(200, 0, "vertical"),
  ]);
  const platformsRef = useRef([new Platform(300, 300, 200, 100)]);

  const resetGame = () => {
    playerRef.current = new Player();
    setHealth(100);
    setIsGameOver(false);
    keysRef.current = {}; 
    bulletsRef.current = [
      new Bullet(800, 100, "horizontal"),
      new Bullet(200, 0, "vertical"),
    ];
  };

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

    const checkCollision = (objA, objB) => {
      return (
        objA.x < objB.x + objB.width &&
        objA.x + objA.width > objB.x &&
        objA.y < objB.y + objB.height &&
        objA.y + objA.height > objB.y
      );
    };

    const bg = new Image();
    bg.src = backgroundImg;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      playerRef.current.update(keysRef.current, platformsRef.current);
      playerRef.current.draw(ctx);

      platformsRef.current.forEach((platform) => platform.draw(ctx));

      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.update();
        bullet.draw(ctx);
        
        if (checkCollision(playerRef.current, bullet)) {
          setHealth((prev) => {
            const newHealth = prev - 20;
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

      if (bulletsRef.current.length < 2) {
        if (Math.random() < 0.51) { 
          if (Math.random() < 0.5) {
            bulletsRef.current.push(new Bullet(canvas.width, Math.random() * 300 + 50, "horizontal"));
          } else {
            bulletsRef.current.push(new Bullet(Math.random() * canvas.width, -20, "vertical"));
          }
        }
      }

      if (playerRef.current.y > 600) setIsGameOver(true);

      if (!isGameOver) animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameOver]); 
  return (
    <div className="game-container">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
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