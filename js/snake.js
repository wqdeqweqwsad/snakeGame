class Snake {
    constructor(size = 20) {
        this.size = size;
        this.direction = 'right';
        this.body = [
            { x: 6, y: 15 },
            { x: 5, y: 15 },
            { x: 4, y: 15 }
        ];
        this.nextDirection = this.direction;
        this.growing = false;
    }

    move() {
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.body.unshift(head);
        if (!this.growing) {
            this.body.pop();
        }
        this.growing = false;
    }

    grow() {
        this.growing = true;
    }

    setDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (opposites[direction] !== this.direction) {
            this.nextDirection = direction;
        }
    }

    checkCollision(width, height) {
        const head = this.body[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= width/this.size || 
            head.y < 0 || head.y >= height/this.size) {
            return true;
        }

        // 检查是否撞到自己
        return this.body.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }
} 