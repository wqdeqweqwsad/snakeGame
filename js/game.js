class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = new Snake(this.gridSize);
        this.food = new Food(this.gridSize);
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.speed = 200;

        // 添加音效
        this.sounds = {
            eat: new Audio('assets/sounds/eat.mp3'),
            gameOver: new Audio('assets/sounds/gameover.mp3')
        };

        // 加载蛇头图片
        this.snakeHead = new Image();
        this.snakeHead.src = 'assets/images/snake-head.png';

        this.isMuted = false;
        this.setupSoundControl();

        this.initializeGame();
        this.setupEventListeners();

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30; // 最小滑动距离
        this.setupTouchControls();
    }

    initializeGame() {
        this.updateScore(0);
        document.getElementById('highScore').textContent = this.highScore;
        this.food.generate(this.canvas.width, this.canvas.height, this.snake.body);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // 添加触摸事件处理
        if ('ontouchstart' in window) {
            this.setupTouchControls();
        }
    }

    handleKeyPress(event) {
        const keyActions = {
            'ArrowUp': () => this.snake.setDirection('up'),
            'ArrowDown': () => this.snake.setDirection('down'),
            'ArrowLeft': () => this.snake.setDirection('left'),
            'ArrowRight': () => this.snake.setDirection('right'),
            'Space': () => this.togglePause()
        };

        const action = keyActions[event.code];
        if (action) {
            event.preventDefault();
            action();
        }
    }

    startGame() {
        if (this.gameLoop) return;
        
        this.isRunning = true;
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        if (this.isRunning) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        } else {
            this.startGame();
        }
        this.isRunning = !this.isRunning;
    }

    update() {
        // 移动蛇
        this.snake.move();
        
        // 检查是否吃到食物
        if (this.checkFoodCollision()) {
            this.playSound('eat');  // 在实际碰撞时播放音效
            this.food.generate(this.canvas.width, this.canvas.height, this.snake.body);
            this.updateScore(this.score + 10);
            this.updateSpeed();
            // 让蛇增长（在确认吃到食物后）
            this.snake.grow();
        }

        // 检查是否游戏结束
        if (this.snake.checkCollision(this.canvas.width, this.canvas.height)) {
            this.playSound('gameOver');
            this.gameOver();
            return;
        }

        this.draw();
    }

    checkFoodCollision() {
        const head = this.snake.body[0];
        // 计算蛇头和食物的实际像素位置
        const snakeX = head.x * this.gridSize;
        const snakeY = head.y * this.gridSize;
        const foodX = this.food.position.x * this.gridSize;
        const foodY = this.food.position.y * this.gridSize;

        // 检查是否有重叠（考虑网格大小）
        return (
            snakeX < foodX + this.gridSize &&
            snakeX + this.gridSize > foodX &&
            snakeY < foodY + this.gridSize &&
            snakeY + this.gridSize > foodY
        );
    }

    updateScore(newScore) {
        this.score = newScore;
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = this.score;
        
        // 添加分数变化动画
        scoreElement.classList.remove('score-change');
        void scoreElement.offsetWidth; // 触发重排
        scoreElement.classList.add('score-change');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            const highScoreElement = document.getElementById('highScore');
            highScoreElement.textContent = this.highScore;
            highScoreElement.classList.remove('score-change');
            void highScoreElement.offsetWidth;
            highScoreElement.classList.add('score-change');
        }
    }

    updateSpeed() {
        if (this.score % 100 === 0) {
            clearInterval(this.gameLoop);
            this.speed *= 0.9;
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制食物
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
            this.food.position.x * this.gridSize,
            this.food.position.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // 绘制蛇身
        this.ctx.fillStyle = 'green';
        this.snake.body.slice(1).forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // 绘制蛇头
        const head = this.snake.body[0];
        const angle = {
            'up': -Math.PI/2,
            'down': Math.PI/2,
            'left': Math.PI,
            'right': 0
        }[this.snake.direction];

        this.ctx.save();
        this.ctx.translate(
            head.x * this.gridSize + this.gridSize/2,
            head.y * this.gridSize + this.gridSize/2
        );
        this.ctx.rotate(angle);
        this.ctx.drawImage(
            this.snakeHead,
            -this.gridSize/2,
            -this.gridSize/2,
            this.gridSize,
            this.gridSize
        );
        this.ctx.restore();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isRunning = false;
        alert(`游戏结束！得分：${this.score}`);
        
        // 重置游戏
        this.snake = new Snake(this.gridSize);
        this.updateScore(0);
        this.speed = 200;
        this.food.generate(this.canvas.width, this.canvas.height, this.snake.body);
        this.draw();
    }

    setupSoundControl() {
        const soundButton = document.getElementById('toggleSound');
        soundButton.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            soundButton.textContent = this.isMuted ? '🔇' : '🔊';
            soundButton.classList.toggle('muted', this.isMuted);
        });
    }

    playSound(soundName) {
        if (!this.isMuted && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    setupTouchControls() {
        // 移除之前的虚拟按键代码，只保留滑动控制
        const canvas = this.canvas;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // 防止页面滚动
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // 只有当滑动距离超过最小值时才改变方向
            if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平滑动
                    if (deltaX > 0) {
                        this.snake.setDirection('right');
                    } else {
                        this.snake.setDirection('left');
                    }
                } else {
                    // 垂直滑动
                    if (deltaY > 0) {
                        this.snake.setDirection('down');
                    } else {
                        this.snake.setDirection('up');
                    }
                }
            }
        });

        // 添加触摸开始时自动开始游戏的功能
        canvas.addEventListener('touchstart', () => {
            if (!this.isRunning && !this.gameLoop) {
                this.startGame();
            }
        }, { once: true });
    }
}

// 初始化游戏
window.onload = () => {
    new Game();
}; 