class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.speed = 150;
        this.isPaused = false;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.updateHighScore();
    }

    initializeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.cellWidth = this.canvas.width / this.gridSize;
        this.cellHeight = this.canvas.height / this.gridSize;
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });

        // 触摸控制
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.direction !== 'down') this.direction = 'up';
        });
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.direction !== 'up') this.direction = 'down';
        });
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.direction !== 'right') this.direction = 'left';
        });
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.direction !== 'left') this.direction = 'right';
        });

        // 游戏控制
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });

        // 主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        // 窗口大小改变时重新调整画布
        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.draw();
        });
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    move() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.updateHighScore();
            }
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            return true;
        }
        
        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            // 蛇头特殊样式
            if (index === 0) {
                const grad = this.ctx.createRadialGradient(
                    (segment.x + 0.5) * this.cellWidth,
                    (segment.y + 0.5) * this.cellHeight,
                    this.cellWidth * 0.1,
                    (segment.x + 0.5) * this.cellWidth,
                    (segment.y + 0.5) * this.cellHeight,
                    this.cellWidth * 0.7
                );
                grad.addColorStop(0, '#00ffcc');
                grad.addColorStop(1, '#2196F3');
                this.ctx.shadowColor = '#00ffcc';
                this.ctx.shadowBlur = 16;
                this.ctx.fillStyle = grad;
            } else {
                // 蛇身渐变
                const grad = this.ctx.createLinearGradient(
                    segment.x * this.cellWidth,
                    segment.y * this.cellHeight,
                    (segment.x + 1) * this.cellWidth,
                    (segment.y + 1) * this.cellHeight
                );
                grad.addColorStop(0, '#2196F3');
                grad.addColorStop(1, '#00ffcc');
                this.ctx.shadowColor = '#00ffcc';
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = grad;
            }
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * this.cellWidth + 2,
                segment.y * this.cellHeight + 2,
                this.cellWidth - 4,
                this.cellHeight - 4,
                this.cellWidth * 0.3
            );
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
        });

        // 绘制食物
        this.ctx.save();
        this.ctx.beginPath();
        const foodCenterX = (this.food.x + 0.5) * this.cellWidth;
        const foodCenterY = (this.food.y + 0.5) * this.cellHeight;
        const foodRadius = Math.min(this.cellWidth, this.cellHeight) * 0.38;
        this.ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, 2 * Math.PI);
        const foodGrad = this.ctx.createRadialGradient(
            foodCenterX, foodCenterY, foodRadius * 0.2,
            foodCenterX, foodCenterY, foodRadius
        );
        foodGrad.addColorStop(0, '#fffbe6');
        foodGrad.addColorStop(0.5, '#ff4d4f');
        foodGrad.addColorStop(1, '#ff9800');
        this.ctx.shadowColor = '#ff9800';
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = foodGrad;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }

    update() {
        if (!this.isPaused) {
            this.move();
            this.draw();
        }
    }

    start() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.food = this.generateFood();
        this.isPaused = false;
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '继续' : '暂停';
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        // 显示自定义弹窗
        document.getElementById('finalScore').textContent = `得分：${this.score}`;
        document.getElementById('gameOverModal').style.display = 'flex';
        // 绑定重新开始按钮
        const restartBtn = document.getElementById('restartBtn');
        restartBtn.onclick = () => {
            document.getElementById('gameOverModal').style.display = 'none';
            this.start();
        };
    }

    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.speed = 300;
                break;
            case 'medium':
                this.speed = 180;
                break;
            case 'hard':
                this.speed = 50;
                break;
        }
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.speed);
        }
    }

    updateHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore);
        document.getElementById('highScore').textContent = this.highScore;
    }
}

// 初始化游戏
window.onload = () => {
    new SnakeGame();
}; 