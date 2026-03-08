export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('backgroundgames', 'assets/backgroundgames.png');
        this.load.image('Coco_sad', 'assets/Coco_sad.png');
        this.load.image('LuvaGirl', 'assets/LuvaGirl.png');

        this.load.audio('gameOverSound', 'assets/GameOver.mp3');
        this.load.audio('badSound', 'assets/Bad.mp3');
    }

    create() {
        this.gameWidth = 360;
        this.gameHeight = 640;

        this.background = this.add.tileSprite(180, 320, 360, 640, 'backgroundgames');

        this.gameStarted = false;
        this.isGameOver = false;

        this.ship = this.add.image(180, 550, 'LuvaGirl').setScale(0.22);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.items = this.add.group();

        this.heartsCaught = 0;
        this.lives = 3;
        this.currentFallSpeed = 2;

        this.starLevelShown = false;
        this.superStarShown = false;
        this.iconLevelShown = false;
        this.legendaryShown = false;

        this.currentLevelName = 'Luva Girl';

        this.grammyUnlocked = false;
        this.grammySpawned = false;
        this.grammyCaught = false;

        this.ramenSpawnCount = 0;
        this.musicSpawnCount = 0;
        this.maxRamenSpawns = 3;
        this.maxMusicSpawns = 3;

        this.createStartScreen();
    }

    createStartScreen() {
        this.startTitle = this.add.text(180, 180, 'Coco Jones\nLuva Girl', {
            fontSize: '28px',
            align: 'center',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.startButton = this.add.text(180, 300, 'Start Game', {
            fontSize: '22px',
            backgroundColor: '#333',
            padding: { left: 15, right: 15, top: 10, bottom: 10 },
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });

        this.startButton.on('pointerover', () => {
            this.startButton.setColor('#ff69b4');
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setColor('#ffff00');
        });

        this.presaveButton = this.add.text(180, 360, 'Presave Luva Girl', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.presaveButton.on('pointerdown', () => {
            window.open('https://link.fans/luvagirl', '_blank');
        });

        this.presaveButton.on('pointerover', () => {
            this.presaveButton.setColor('#ff69b4');
        });

        this.presaveButton.on('pointerout', () => {
            this.presaveButton.setColor('#ffff00');
        });
    }

    startGame() {
        this.gameStarted = true;

        this.startTitle.destroy();
        this.startButton.destroy();
        this.presaveButton.destroy();

        this.setupHUD();

        this.spawnTimer = this.time.addEvent({
            delay: 650,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });
    }

    setupHUD() {
        this.add.text(10, 8, 'Coco Jones', {
            fontSize: '12px',
            color: '#ffffff'
        });

        this.add.text(10, 22, 'Luva Girl', {
            fontSize: '12px',
            color: '#ffffff'
        });

        this.heartsLabelText = this.add.text(180, 8, 'Hearts', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        this.heartsNumberText = this.add.text(180, 24, '0', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);

        this.livesText = this.add.text(350, 8, '♥ ♥ ♥', {
            fontSize: '18px',
            color: '#ff69b4'
        }).setOrigin(1, 0);
    }

    update() {
        if (!this.gameStarted) return;
        if (this.isGameOver) return;

        this.background.tilePositionX += 0.4;

        if (this.cursors.left.isDown) this.ship.x -= 5;
        if (this.cursors.right.isDown) this.ship.x += 5;

        if (this.ship.x < 30) this.ship.x = 30;
        if (this.ship.x > 330) this.ship.x = 330;

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;

            item.y += item.speed;

            if (item.y > this.gameHeight + 40) {
                item.destroy();
                return;
            }

            const catchX = this.ship.x;
            const catchY = this.ship.y + 42;

            const dx = Math.abs(item.x - catchX);
            const dy = Math.abs(item.y - catchY);

            if (dx < 42 && dy < 28) {
                this.handleCaughtItem(item);
            }
        });

        this.checkLevelProgress();
    }

    spawnItem() {
        if (this.isGameOver) return;

        const type = this.chooseItemType();
        const x = Phaser.Math.Between(28, 332);
        const data = this.getItemData(type);

        const item = this.add.text(x, -20, data.symbol, {
            fontSize: data.fontSize,
            stroke: data.stroke,
            strokeThickness: data.strokeThickness
        }).setOrigin(0.5);

        item.itemKind = data.kind;
        item.itemValue = data.value;
        item.speed = this.currentFallSpeed;
        item.itemType = type;

        if (data.glow) {
            item.setShadow(0, 0, data.glowColor, 18, true, true);
        }

        this.items.add(item);
    }

    chooseItemType() {
        const roll = Phaser.Math.Between(1, 100);

        if (this.grammyUnlocked && !this.grammySpawned && !this.grammyCaught) {
            const grammyRoll = Phaser.Math.Between(1, 100);
            if (grammyRoll <= 12) {
                this.grammySpawned = true;
                return 'grammy';
            }
        }

        if (this.heartsCaught < 5) {
            return 'heart';
        }

        if (this.heartsCaught < 15) {
            if (roll <= 50) return 'heart';
            return 'tomato';
        }

        if (this.heartsCaught < 30) {
            if (roll <= 40) return 'heart';

            if (roll <= 43 && this.ramenSpawnCount < this.maxRamenSpawns) {
                this.ramenSpawnCount += 1;
                return 'ramen';
            }

            if (roll <= 46 && this.musicSpawnCount < this.maxMusicSpawns) {
                this.musicSpawnCount += 1;
                return 'music';
            }

            return 'tomato';
        }

        if (roll <= 35) return 'heart';

        if (roll <= 38 && this.ramenSpawnCount < this.maxRamenSpawns) {
            this.ramenSpawnCount += 1;
            return 'ramen';
        }

        if (roll <= 41 && this.musicSpawnCount < this.maxMusicSpawns) {
            this.musicSpawnCount += 1;
            return 'music';
        }

        return 'tomato';
    }

    getItemData(type) {
        if (type === 'heart') {
            return {
                symbol: '❤️',
                value: 1,
                kind: 'good',
                fontSize: '28px',
                stroke: '#ffb6d9',
                strokeThickness: 1,
                glow: true,
                glowColor: '#ff69b4'
            };
        }

        if (type === 'ramen') {
            return {
                symbol: '🍜',
                value: 2,
                kind: 'good',
                fontSize: '26px',
                stroke: '#ffe082',
                strokeThickness: 2,
                glow: true,
                glowColor: '#ffd54f'
            };
        }

        if (type === 'music') {
            return {
                symbol: '🎵',
                value: 2,
                kind: 'good',
                fontSize: '26px',
                stroke: '#d1b3ff',
                strokeThickness: 2,
                glow: true,
                glowColor: '#b388ff'
            };
        }

        if (type === 'tomato') {
            return {
                symbol: '🍅',
                value: 1,
                kind: 'bad',
                fontSize: '26px',
                stroke: '#000000',
                strokeThickness: 0,
                glow: false,
                glowColor: '#000000'
            };
        }

        return {
            symbol: '🏆',
            value: 10,
            kind: 'bonus',
            fontSize: '28px',
            stroke: '#ffe082',
            strokeThickness: 2,
            glow: true,
            glowColor: '#ffd700'
        };
    }

    handleCaughtItem(item) {
        const kind = item.itemKind;
        const value = item.itemValue;

        item.destroy();

        if (kind === 'good') {
            this.heartsCaught += value;
            this.heartsNumberText.setText(String(this.heartsCaught));

            if (value === 2) {
                this.showFloatingScore('+2');
            }
            return;
        }

        if (kind === 'bonus') {
            this.heartsCaught += value;
            this.heartsNumberText.setText(String(this.heartsCaught));
            this.grammyCaught = true;
            this.showFloatingScore('Grammy Bonus +10');
            return;
        }

        if (kind === 'bad') {
            if (this.sound && this.cache.audio.exists('badSound')) {
                this.sound.play('badSound');
            }

            this.lives -= 1;
            this.updateLivesDisplay();

            if (this.lives <= 0) {
                this.endGame();
            }
        }
    }

    updateLivesDisplay() {
        if (this.lives === 3) this.livesText.setText('♥ ♥ ♥');
        else if (this.lives === 2) this.livesText.setText('♥ ♥ X');
        else if (this.lives === 1) this.livesText.setText('♥ X X');
        else this.livesText.setText('X X X');
    }

    checkLevelProgress() {
        if (this.heartsCaught >= 100 && !this.legendaryShown) {
            this.legendaryShown = true;
            this.currentLevelName = 'Legendary Level';
            this.showLevelMessage('Legendary Level Reached');
            return;
        }

        if (this.heartsCaught >= 60 && !this.iconLevelShown) {
            this.iconLevelShown = true;
            this.currentLevelName = 'ICON Level';
            this.currentFallSpeed = 8;
            this.showLevelMessage('ICON Level Reached');
            return;
        }

        if (this.heartsCaught >= 30 && !this.superStarShown) {
            this.superStarShown = true;
            this.currentLevelName = 'Super Star Level';
            this.grammyUnlocked = true;
            this.showLevelMessage('Super Star Level Reached');
            return;
        }

        if (this.heartsCaught >= 20 && this.currentFallSpeed < 6) {
            this.currentFallSpeed = 6;
            return;
        }

        if (this.heartsCaught >= 15 && !this.starLevelShown) {
            this.starLevelShown = true;
            this.currentLevelName = 'Star Level';
            this.showLevelMessage('Star Level Reached');
            return;
        }

        if (this.heartsCaught >= 5 && this.currentFallSpeed < 4) {
            this.currentFallSpeed = 4;
        }
    }

    showLevelMessage(text) {
        const levelText = this.add.text(180, 245, text, {
            fontSize: '18px',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: levelText,
            alpha: 0,
            delay: 1000,
            duration: 900,
            onComplete: () => { levelText.destroy(); }
        });
    }

    showFloatingScore(text) {
        const msg = this.add.text(this.ship.x, this.ship.y - 95, text, {
            fontSize: '22px',
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => { msg.destroy(); }
        });
    }

    endGame() {
        this.isGameOver = true;

        if (this.spawnTimer) this.spawnTimer.remove(false);

        this.items.children.iterate((item) => {
            if (item) item.destroy();
        });

        if (this.sound && this.cache.audio.exists('gameOverSound')) {
            this.sound.play('gameOverSound');
        }

        const levelText = this.getFinalLevelName();

        this.add.rectangle(180, 320, 300, 390, 0x000000, 0.9);

        this.add.image(180, 150, 'Coco_sad').setScale(0.32);

        this.add.text(180, 215, 'Heartbroken\nGame Over', {
            fontSize: '22px',
            color: '#ff6b81',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(180, 290, 'Hearts Collected', {
            fontSize: '18px',
            color: '#fff'
        }).setOrigin(0.5);

        this.add.text(180, 325, String(this.heartsCaught), {
            fontSize: '34px',
            color: '#fff'
        }).setOrigin(0.5);

        this.add.text(180, 365, levelText, {
            fontSize: '16px',
            color: '#fff'
        }).setOrigin(0.5);

        this.add.text(180, 415, 'Presave Luva Girl', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            window.open('https://link.fans/luvagirl', '_blank');
        })
        .on('pointerover', function () { this.setColor('#ff69b4'); })
        .on('pointerout', function () { this.setColor('#ffff00'); });

        this.add.text(180, 442, 'Made by Source', {
            fontSize: '14px',
            color: '#fff'
        }).setOrigin(0.5);

        const playAgain = this.add.text(180, 492, 'Play Again', {
            fontSize: '18px',
            backgroundColor: '#333',
            padding: { left: 10, right: 10, top: 6, bottom: 6 }
        }).setOrigin(0.5).setInteractive();

        playAgain.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    getFinalLevelName() {
        if (this.heartsCaught >= 100) return 'Legendary Level';
        if (this.heartsCaught >= 60) return 'ICON Level';
        if (this.heartsCaught >= 30) return 'Super Star Level';
        if (this.heartsCaught >= 15) return 'Star Level';
        return 'Luva Girl';
    }
}