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
  
  // Use useRef for all game state to avoid closure issues
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
    keysRef.current = {}; // Reset keys
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
      console.log('Key pressed:', e.key); // Debug log
      if (e.key === "r" && isGameOver) resetGame();
    };

    const handleKeyUp = (e) => {
      e.preventDefault();
      keysRef.current[e.key] = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Focus the canvas to ensure it receives keyboard events
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

      // Update and draw player
      playerRef.current.update(keysRef.current, platformsRef.current);
      playerRef.current.draw(ctx);

      // Draw platforms
      platformsRef.current.forEach((platform) => platform.draw(ctx));

      // Update and draw bullets
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.update();
        bullet.draw(ctx);
        
        // Check collision with player
        if (checkCollision(playerRef.current, bullet)) {
          setHealth((prev) => {
            const newHealth = prev - 20;
            if (newHealth <= 0) setIsGameOver(true);
            return newHealth;
          });
          return false; // Remove bullet
        }
        
        // Remove bullets that are off-screen
        if (bullet.direction === "horizontal" && bullet.x < -bullet.width) {
          return false;
        }
        if (bullet.direction === "vertical" && bullet.y > canvas.height) {
          return false;
        }
        
        return true; // Keep bullet
      });

      // Respawn bullets when they're removed (optional - for continuous gameplay)
      if (bulletsRef.current.length < 2) {
        // Add new bullets occasionally
        if (Math.random() < 0.01) { // 1% chance per frame
          if (Math.random() < 0.5) {
            bulletsRef.current.push(new Bullet(canvas.width, Math.random() * 300 + 50, "horizontal"));
          } else {
            bulletsRef.current.push(new Bullet(Math.random() * canvas.width, -20, "vertical"));
          }
        }
      }

      // Check if player fell off screen
      if (playerRef.current.y > 600) setIsGameOver(true);

      if (!isGameOver) animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameOver]); // Removed player and platforms from dependencies

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