class Food {
    constructor(size = 20) {
        this.size = size;
        this.position = { x: 0, y: 0 };
    }

    generate(width, height, snakeBody) {
        const gridWidth = width / this.size;
        const gridHeight = height / this.size;
        
        do {
            this.position = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.checkCollisionWithSnake(snakeBody));
    }

    checkCollisionWithSnake(snakeBody) {
        return snakeBody.some(segment => 
            segment.x === this.position.x && 
            segment.y === this.position.y
        );
    }
} 