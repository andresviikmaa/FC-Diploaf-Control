var liveFeed = {
  
  canvas: document.getElementById("liveFeed"),
  ctx: document.getElementById("liveFeed").getContext('2d'),
  
  // how big the "squares" will be
  xDis: 0,
  yDis: 0,
  
  // where the square will be drawn
  posX: 0,   
  posY: 0,
  
  repeater: 0, // ID of requestAnimationFrame
    
  divisions: 30, // breaks frame into X × X squares

  init: function() {
    
    // Set up "Two Dimensional" Array to remember what is on and off
    this.memory = new Array(this.divisions-1);
    for (var i = 0; i < (this.divisions+1); i++) {
      this.memory[i] = new Array(this.divisions-1);
    }
 
    // Size the canvas appropriately
    //var width = window.innerWidth;
    //var height = window.innerHeight;
    //liveFeed.canvas.width = width;
    //liveFeed.canvas.height = height;
    
    // Size of squares is canvas width broken into equal chunks
    //liveFeed.xDis = width/liveFeed.divisions;
    //liveFeed.yDis = height/liveFeed.divisions;
                
    // All pink, baby
  
    // Random starting position
    this.posX = Math.floor(Math.random() * this.divisions);
    this.posY = Math.floor(Math.random() * this.divisions);
    
    // global
    drawLoop = function() {
      liveFeed.repeater = requestAnimationFrame(drawLoop);
      liveFeed.update();
    }
    drawLoop();
        
  },
  
    drawSquare: function (y, x, color) {
        this.ctx.fillStyle = color;
        // Actually draw it
        var xx = x/10 + liveFeed.canvas.width / 2;
        var yy = y/10 + liveFeed.canvas.height / 2;
    liveFeed.ctx.fillRect(xx,yy,5, 5);
    
    // Record it in memory
    //liveFeed.memory[x][y] = true;
  },
    update: function () {
        if (window.fieldState == undefined) return;
        for (var i = 0; i < 12; i++)
            liveFeed.drawSquare(window.fieldState.balls[i][6], window.fieldState.balls[i][7], "orange");

        liveFeed.drawSquare(window.fieldState.gates[0][6], window.fieldState.gates[0][7], "blue");
        liveFeed.drawSquare(window.fieldState.gates[1][6], window.fieldState.gates[1][7], "yellow");

        liveFeed.drawSquare(window.fieldState.balls[window.fieldState.data[FieldState.closestBall]][6], window.fieldState.balls[window.fieldState.data[FieldState.closestBall]][7], "red");
        liveFeed.drawSquare(window.fieldState.balls[window.fieldState.data[FieldState.closestBallInFront]][6], window.fieldState.balls[window.fieldState.data[FieldState.closestBallInFront]][7], "brown");

  },

  
  startNewRound: function() {
    // Stop! 
    cancelAnimationFrame(this.repeater);
    

      // Actually restart      
      drawLoop();
      
    
  },
  
 
}

// need this loop to make sure canvas sizes right on CodePen
setTimeout(function() {
  
  liveFeed.init();
  
}, 10);