var game;
var username;
var config;
var tooltip;
var safeZoneImage = new Image();
safeZoneImage.src = 'images/safe-zone.png';
var openSeaImage = new Image();
openSeaImage.src = 'images/open-sea.png';
var whirlpoolImage = new Image();
whirlpoolImage.src = 'images/whirlpool.png';
var gameInit = function () {
    var canvasWrap = document.getElementById('game-wrap');
    var canvas = document.getElementById("game");
    var curCol, curRow;
    var safeZoneImage = new Image();
    var openSeaImage = new Image();
    safeZoneImage.src = 'images/safe-zone.png';
    openSeaImage.src = 'images/open-sea.png';
    tooltip = document.getElementById('tooltip');
    canvas.width = config.field.width;
    canvas.height = config.field.height;
    canvas.onmousemove = function showTooltip(e) {
        var mouseX, mouseY;
        var wrapX = (e.pageX - canvasWrap.offsetLeft) * 0.99;
        var wrapY = (e.pageY - canvasWrap.offsetTop) * 0.97;

        if(e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if(e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
        var newCol = Math.floor(mouseX / game.field.cellWidth());
        var newRow = Math.floor(mouseY / game.field.cellHeight());

        if (newCol != curCol || newRow != curRow) {
            if (isNaN(newCol) || isNaN(newRow)) return;
            curCol = newCol;
            curRow = newRow;
        }
        for (var i in game.ships) {
            var ship = game.ships[i];
            if (curCol == ship.col && curRow == ship.row) {
                tooltip.style.top = (wrapY + 30) + 'px';
                tooltip.style.left = (wrapX + 30) + 'px';
                tooltip.innerHTML = '' +
                    'Name: <b>' + ship.name + '</b> <br>' +
                    'HP: ' + ship.hp;
                tooltip.style.display = 'block';
                ship.showCircle = true;
                break;
            }
            else {
                tooltip.style.display = 'none';
                ship.showCircle = false;
            }
        }
    };

    if (canvas.getContext) {
        game = {
            ctx: canvas.getContext("2d"),
            lastFrameTime: {},
            ships: [],
            flags: [],
            winds: [],
            rocks: [],
            whirlpools: [],
            score: {
                left: 0,
                right: 0
            },
            field: {
                columns: config.field.columns,
                rows: config.field.rows,
                width: config.field.width,
                height: config.field.height,
                cellWidth: function () {
                    return this.width / this.columns
                },
                cellHeight: function () {
                    return this.width / this.columns
                }
            },
            runFrame: function (now, fps, i) {
                this.lastFrameTime[i] = this.lastFrameTime[i] ? this.lastFrameTime[i] : now;
                var timePassed = now - this.lastFrameTime[i];
                if (timePassed >= 999 / fps) {
                    this.lastFrameTime[i] = now;
                    return true;
                }
                return false;
            },
            drawGrid: function () {
                //width
                for (var i = 1; i < this.field.columns; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i * this.field.cellWidth(), 0);
                    this.ctx.lineTo(i * this.field.cellWidth(), this.field.height);
                    this.ctx.stroke();
                }
                //height
                for (var i = 1; i < this.field.rows; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, i * this.field.cellHeight());
                    this.ctx.lineTo(this.field.width, i * this.field.cellHeight());
                    this.ctx.stroke();
                }
            },
            drawZones: function () {
                for (var i = 0; i < game.field.columns; i++) {
                    for (var j = 0; j < config.field.rows; j++) {
                        this.ctx.drawImage(
                            safeZoneImage,
                            this.field.cellWidth() * i,
                            this.field.cellHeight() * j,
                            this.field.cellWidth(),
                            this.field.cellHeight()
                        );
                    }
                    if (i === 2) {
                        i = game.field.columns - 4;
                    }
                }
                for (var i = 3; i < game.field.columns - 3; i++) {
                    for (var j = 0; j < config.field.rows; j++) {
                        this.ctx.drawImage(
                            openSeaImage,
                            this.field.cellWidth() * i,
                            this.field.cellHeight() * j,
                            this.field.cellWidth(),
                            this.field.cellHeight()
                        );
                    }

                }
            },
            drawShip: function (ship) {
                var shift = 0;
                if (ship.isDead) {
                    this.ctx.fillStyle = 'black';
                }
                else {
                    if (ship.name === game.userShip.name) {
                        this.ctx.fillStyle = config.colors.userColor;
                        ship.teamColor = config.colors.allyColor;
                    }
                    else if (ship.team === game.userShip.team) {
                        this.ctx.fillStyle = config.colors.allyColor;
                        ship.teamColor = config.colors.allyColor;
                    }
                    else {
                        this.ctx.fillStyle = config.colors.enemyColor;
                        ship.teamColor = config.colors.enemyColor;
                    }
                }
                var triangle = new Path2D();
                if (ship.isDamaged) {
                    shift = ship.isDamaged % 2 ? 5 : -5;
                }
                switch (ship.direction) {
                    case 'right':
                        triangle.moveTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 4 + shift
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.75 + shift
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 2 + shift
                        );
                        break;
                    case 'left':
                        triangle.moveTo(
                            ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 4 + shift
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.75 + shift
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 2 + shift
                        );
                        break;
                    case 'up':
                        triangle.moveTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 4 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.75 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 2 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        break;
                    case 'down':
                        triangle.moveTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 4 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.75 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        triangle.lineTo(
                            ship.col * this.field.cellWidth() + this.field.cellHeight() / 2 + shift,
                            ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );
                        break;
                }

                this.ctx.fill(triangle);
            },
            drawFlag: function (flag) {
                this.ctx.fillStyle = flag.color;
                this.ctx.fillRect(
                    flag.col * this.field.cellWidth() + this.field.cellWidth() * 0.125,
                    flag.row * this.field.cellHeight() + this.field.cellHeight() * 0.25,
                    this.field.cellWidth() * 0.750,
                    this.field.cellHeight() * 0.5
                );
                this.ctx.fillStyle = flag.color === 'white' ? 'black': 'white';
                this.ctx.font = (this.field.cellWidth() * 0.375) + 'px Arial';
                this.ctx.fillText(
                    flag.points,
                    (flag.col * this.field.cellWidth() + this.field.cellWidth() * 0.5) - (this.field.cellWidth() * 0.375) * 0.25,
                    (flag.row * this.field.cellHeight() + this.field.cellHeight() * 0.5) + (this.field.cellWidth() * 0.375) * 0.33
                );

            },
            drawRock: function (rock) {
                this.ctx.beginPath();
                this.ctx.arc(
                    rock.col * this.field.cellWidth() + this.field.cellWidth() * 0.5,
                    rock.row * this.field.cellHeight() + this.field.cellHeight() * 0.5,
                    this.field.cellWidth() * 0.3,
                    0,
                    2 * Math.PI,
                    false
                );
                this.ctx.fillStyle = 'white';
                this.ctx.fill();
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
            },
            drawWhirlpool: function (whirlpool) {
                this.ctx.drawImage(
                    whirlpoolImage,
                    this.field.cellWidth() * whirlpool.col[0],
                    this.field.cellHeight() * whirlpool.row[0],
                    this.field.cellWidth() * 2,
                    this.field.cellHeight() * 2
                );
            },
            drawWind: function (wind) {
                this.ctx.fillStyle = 'black';
                this.ctx.fillStyle = 'black';
                this.ctx.lineWidth = 4;
                var arrow = new Path2D();
                switch (wind.direction) {
                    case 'right':
                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 6,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() / 6,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );

                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 6 * 5,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );
                        break;
                    case 'left':
                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 6,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );

                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 6 * 5,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 4
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() / 6 * 5,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() * 0.75
                        );
                        break;
                    case 'up':
                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );

                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6 * 5
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6 * 5
                        );
                        break;
                    case 'down':
                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6
                        );

                        arrow.moveTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 4,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellHeight() / 2,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 6 * 5
                        );
                        arrow.lineTo(
                            wind.col * this.field.cellWidth() + this.field.cellWidth() * 0.75,
                            wind.row * this.field.cellHeight() + this.field.cellHeight() / 2
                        );
                        break;
                }
                this.ctx.stroke(arrow);
                this.ctx.lineWidth = 1;
            },
            drawCircle: function (ship) {
                this.ctx.beginPath();
                this.ctx.arc(
                   ship.col * this.field.cellWidth() + this.field.cellWidth() * 0.5,
                   ship.row * this.field.cellHeight() + this.field.cellHeight() * 0.5,
                   this.field.cellWidth() * 3.5,
                   0,
                   2 * Math.PI,
                   false
                );
                //this.ctx.strokeStyle = 'black';
                this.ctx.stroke();
            },
            drawCannonball: function (cannonball) {
                this.ctx.beginPath();
                this.ctx.lineWidth = 4;
                this.ctx.arc(
                    cannonball.x,
                    cannonball.y,
                    this.field.cellWidth() * 0.125,
                    0,
                    2 * Math.PI,
                    false
                );
                this.ctx.fillStyle = 'yellow';
                this.ctx.fill();
                this.ctx.lineWidth = 1;
            },
            update: function (now) {
                this.drawZones();
                this.drawGrid();
                this.flags.forEach(function (flag) {
                    game.drawFlag(flag);
                });
                this.winds.forEach(function (wind) {
                    game.drawWind(wind);
                });
                this.whirlpools.forEach(function (whirlpool) {
                    game.drawWhirlpool(whirlpool);
                });
                this.rocks.forEach(function (rock) {
                    game.drawRock(rock);
                });
                this.ships.forEach(function (ship, i) {
                    if (ship.isDamaged === true) {
                        game.ships[i].isDamaged = 1;
                    }
                    game.drawShip(ship);
                    if (ship.showCircle) {
                        game.drawCircle(ship);
                    }
                    if (ship.isDamaged !== false) {
                        game.ships[i].isDamaged++;
                    }
                    if (ship.isDamaged > 10) {
                        game.ships[i].isDamaged = false;
                    }
                    if (ship.cannonballs.length) {
                        ship.cannonballs.forEach(function (cannonball, i) {
                            game.drawCannonball(cannonball);
                            var modifier = cannonball.direction === 'left' ? -config.ship.cannonballSpeed : config.ship.cannonballSpeed;
                            cannonball.distance = cannonball.distance
                                ? cannonball.distance + config.ship.cannonballSpeed
                                : config.ship.cannonballSpeed;
                            switch (cannonball.shipDirection) {
                                case 'right':
                                    cannonball.y += modifier;
                                    break;
                                case 'left':
                                    cannonball.y -= modifier;
                                    break;
                                case 'up':
                                    cannonball.x += modifier;
                                    break;
                                case 'down':
                                    cannonball.x -= modifier;
                                    break;
                            }
                            if (cannonball.distance >= game.field.cellHeight() * 3) {
                                delete ship.cannonballs[i];
                                return;
                            }

                            for (var s in game.ships) {
                                var ship2 = game.ships[s];
                                if (Math.abs(ship2.getX() - cannonball.x) < game.field.cellHeight() * 0.25
                                    && Math.abs(ship2.getY() - cannonball.y) < game.field.cellHeight() * 0.25) {
                                    if (!ship2.isDead) {
                                        ship2.takeDamage(ship2.cannonDamage);
                                        delete ship.cannonballs[i];
                                        return;
                                    }
                                }
                            }
                            for (var r in game.rocks) {
                                var rock = game.rocks[r];
                                if (Math.abs((rock.col + 0.5) * game.field.cellWidth() - cannonball.x) < (game.field.cellHeight() * 0.25 + 12)
                                    && Math.abs((rock.row + 0.5) * game.field.cellHeight() - cannonball.y) < (game.field.cellHeight() * 0.25 + 12)) {
                                    delete ship.cannonballs[i];
                                    return;
                                }
                            }
                        });
                    }
                });

                this.frame = this.frame ? this.frame + 1 : 1;
            },
            getShip: function (col, row) {
                for (var i in this.ships) {
                    var ship = this.ships[i];
                    if (ship.col === col && ship.row === row) {
                        return ship;
                    }
                }
                return false;
            },
            checkFlag: function (flag, lastRound) {
                var ships = [];
                var game = this;
                game.ships.forEach(function (ship) {
                    var flagX = (flag.col + 0.5) * game.field.cellWidth();
                    var flagY = (flag.row + 0.5) * game.field.cellHeight();
                    var flagR = game.field.cellWidth() * 3.5;
                    if (Math.pow(ship.getX() - flagX, 2) + Math.pow(ship.getY() - flagY, 2) < Math.pow(flagR, 2)) {
                        ships.push(ship);
                    }
                });
                var teams = {
                    left: false,
                    right: false
                };
                var points = {
                    left: 0,
                    right: 0
                };
                flag.color = 'white';
                ships.forEach(function (ship) {
                    teams[ship.team] = true;
                    if (teams.left && teams.right) {
                        flag.color = 'black';
                        points.left = 0;
                        points.right = 0;
                    }
                    else {
                        flag.color = ship.teamColor;
                        if (lastRound) {
                            points[ship.team] = flag.points;
                        }
                    }
                });
                game.score.left += points.left;
                game.score.right += points.right;
            },
            //findCannonballCollision: function (cannonball) {
            //    var collidedShips = [];
            //    for (var i in this.ships) {
            //        var ship1 = this.ships[i];
            //        for (var j = Number(i) + 1; j < this.ships.length; j++) {
            //            var ship2 = this.ships[j];
            //            var shipX = (ship.col + 0.5) * game.field.cellWidth();
            //            var shipY = (ship.row + 0.5) * game.field.cellHeight();
            //            var flagX = (flag.col + 0.5) * game.field.cellWidth();
            //            var flagY = (flag.row + 0.5) * game.field.cellHeight();
            //            var flagR = game.field.cellWidth() * 3.5;
            //            if (Math.pow(shipX - flagX, 2) + Math.pow(shipY - flagY, 2) < Math.pow(flagR, 2)) {
            //                ships.push(ship);
            //            }
            //        }
            //        this.rocks.forEach(function (rock) {
            //            if (ship1.col === rock.col && ship1.row === rock.row) {
            //                collidedShips.push(ship1);
            //            }
            //        });
            //    }
            //    return collidedShips;
            //},
            findCollisions: function () {
                var collidedShips = [];
                for (var i in this.ships) {
                    var ship1 = this.ships[i];
                    for (var j = Number(i) + 1; j < this.ships.length; j++) {
                        var ship2 = this.ships[j];
                        if (ship1.col === ship2.col && ship1.row === ship2.row) {
                            collidedShips.push(ship1, ship2);
                        }
                    }
                    this.rocks.forEach(function (rock) {
                        if (ship1.col === rock.col && ship1.row === rock.row) {
                            collidedShips.push(ship1);
                        }
                    });
                }
                return collidedShips;
            },
            resolveCollisions: function (move) {
                var ships = this.findCollisions();
                if (ships.length) {
                    for (var i in ships) {
                        var ship = ships[i];
                        if (ship.turning)
                            ship.turning = false;
                        ship.roundMoves = ship.roundMoves || [{}, {}, {}, {}];
                        if (ship.roundMoves[move].move !== 'stay')
                            ship.restorePosition();
                        if (ship.roundMoves[move].secondary !== undefined && ship.roundMoves[move].secondary.type === 'wind')
                            ship.restorePosition();
                        if (ship.roundMoves[move].secondary !== undefined && ship.roundMoves[move].secondary.type === 'whirlpool'){
                            ship.restorePosition();
                            ship.takeDamage(ship.bumpDamage);
                            return 'whirlpool';
                        }
                        ship.takeDamage(ship.bumpDamage);
                    }
                }
            },
            runMove: function (move) {
                var turningShips = [];
                this.ships.forEach(function (ship) {
                    ship.turning = false;
                    if (ship.isDead) return;
                    if (!ship.roundMoves.length) return;
                    switch (ship.roundMoves[move].move) {
                        case 'forward':
                            ship.forwardMove();
                            break;
                        case 'turn-left':
                            if (ship.forwardMove())
                                turningShips.push(ship);
                            ship.rotate('left');
                            ship.turning = true;
                            break;
                        case 'turn-right':
                            if (ship.forwardMove())
                                turningShips.push(ship);
                            ship.rotate('right');
                            ship.turning = true;
                            break;
                        case 'stay':
                        default:
                            return;
                    }
                });
                this.resolveCollisions(move);
                turningShips.forEach(function (ship) {
                    if (ship.turning)
                        ship.forwardMove();
                });
                this.resolveCollisions(move);
                this.ships.forEach(function (ship) {
                    if (ship.isDead) return;
                    if (!ship.roundMoves.length) return;
                    for (var side in ship.roundMoves[move].fire) {
                        if (ship.roundMoves[move].fire[side] > 0) {
                            ship.cannonFire(side);
                        }
                    }
                });
                setTimeout(function () {
                    game.ships.forEach(function (ship) {
                        if (ship.isDead) return;
                        if (!ship.roundMoves.length) return;
                        for (var side in ship.roundMoves[move].fire) {
                            if (ship.roundMoves[move].fire[side] === 2) {
                                console.log(ship.roundMoves[move].fire[side]);
                                ship.cannonFire(side);
                            }
                        }
                    });
                }, 250);
                setTimeout(function () {
                    game.runSecondaryMove(move);
                }, 500);
            },
            runSecondaryMove: function (move) {
                game.ships.forEach(function (ship) {
                    game.winds.forEach(function (wind) {
                        if (ship.col === wind.col && ship.row === wind.row) {
                            ship.roundMoves[move].secondary = wind;
                            ship.windMove(wind);
                            game.resolveCollisions(move);
                        }
                    });
                    game.whirlpools.forEach(function (whirlpool) {
                        for (var i = 0; i < 4; i++) {
                            if (ship.col === whirlpool.col[i] && ship.row === whirlpool.row[i]) {
                                ship.roundMoves[move].secondary = whirlpool;
                                ship.whirlpoolMove(whirlpool, i, 1);
                                if (game.resolveCollisions(move) === 'whirlpool') {
                                    break;
                                }
                                ship.whirlpoolMove(whirlpool, i, 2);
                                game.resolveCollisions(move);
                                break;
                            }
                        }
                    });
                });
            },
            getShipByName: function (name) {
                for (var i in this.ships) {
                    var ship = this.ships[i];
                    if (ship.name === name) {
                        return ship;
                    }
                }
                return false;
            },
            setUserShip: function (name) {
               this.userShip = this.getShipByName(name);
            },
            updateShips: function (ships) {
                this.ships = ships;
                this.setUserShip(username);
                ships.forEach(function (ship) {
                    ship.getX = function () {
                        return (this.col + 0.5) * game.field.cellWidth();
                    };
                    ship.getY = function () {
                        return (this.row + 0.5) * game.field.cellHeight();
                    };
                    ship.rotate = function (side) {
                        var directions = ['up', 'right', 'down', 'left'];
                        var dirIndex = directions.indexOf(this.direction);
                        if (side == 'left') dirIndex--;
                        else if (side == 'right') dirIndex++;
                        if (dirIndex == -1) dirIndex = 3;
                        else if(dirIndex == 4) dirIndex = 0;
                        this.direction = directions[dirIndex];
                    };
                    ship.windMove = function (wind) {
                        this.savePosition();
                        switch (wind.direction) {
                            case 'up':
                                if (this.row === 0) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.row--;
                                break;
                            case 'down':
                                if (this.row === config.field.rows - 1) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.row++;
                                break;
                            case 'left':
                                if (this.col === 0) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.col--;
                                break;
                            case 'right':
                                if (this.col === config.field.columns - 1) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.col++;
                                break;
                        }
                    };
                    ship.whirlpoolMove = function (whirlpool, i, part) {
                        switch (i) {
                            case 0:
                                if (part === 1) {
                                    this.windMove({direction: 'right'});
                                }
                                if (part === 2) {
                                    this.windMove({direction: 'down'});
                                }
                                break;
                            case 1:
                                if (part === 1) {
                                    this.windMove({direction: 'down'});
                                }
                                if (part === 2) {
                                    this.windMove({direction: 'left'});
                                }
                                break;
                            case 2:
                                if (part === 1) {
                                    this.windMove({direction: 'left'});
                                }
                                if (part === 2) {
                                    this.windMove({direction: 'up'});
                                }
                                break;
                            case 3:
                                if (part === 1) {
                                    this.windMove({direction: 'up'});
                                }
                                if (part === 2) {
                                    this.windMove({direction: 'right'});
                                }
                                break;
                        }
                        if (part === 1) {
                            this.rotate('right');
                        }
                    };
                    ship.forwardMove = function () {
                        this.savePosition();
                        switch (this.direction) {
                            case 'up':
                                if (this.row === 0) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.row--;
                                break;
                            case 'down':
                                if (this.row === config.field.rows - 1) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.row++;
                                break;
                            case 'left':
                                if (this.col === 0) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.col--;
                                break;
                            case 'right':
                                if (this.col === config.field.columns - 1) {
                                    this.takeDamage(this.bumpDamage);
                                    return false;
                                }
                                this.col++;
                                break;
                        }
                        return true;
                    };
                    ship.turnMove = function (side) {
                        if (!this.forwardMove()) {
                            this.rotate(side);
                            return false;
                        }
                        this.rotate(side);
                        return this.forwardMove();
                    };
                    ship.move = function (move) {
                        switch (move) {
                            case 'forward':
                                this.movesOrder.push('forward');
                                break;
                            case 'turn-left':
                                this.movesOrder.push('forward');
                                this.movesOrder.push('rotate');
                                this.movesOrder.push('left');
                                this.movesOrder.push('forward');
                                break;
                            case 'turn-right':
                                this.movesOrder.push('forward');
                                this.movesOrder.push('rotate');
                                this.movesOrder.push('right');
                                this.movesOrder.push('forward');
                                break;
                            case 'stay':
                                this.movesOrder.push('stay');
                                break;
                            case 'fire-no':
                                this.movesOrder.push('fire');
                                this.movesOrder.push('no');
                                break;
                            case 'fire-left':
                                this.movesOrder.push('fire');
                                this.movesOrder.push('left');
                                break;
                            case 'fire-right':
                                this.movesOrder.push('fire');
                                this.movesOrder.push('right');
                                break;
                        }
                    };
                    ship.takeDamage = function (val) {
                        if ((this.col < 3 || this.col > config.field.columns - 4) || this.isDead)
                            return;
                        this.hp -= val;
                        this.isDamaged = true;
                        if (this.hp <= 0){
                            this.hp = 0;
                            this.isDead = true;
                        }
                    };
                    ship.cannonFire = function (side) {
                        var modifier = side === 'left' ? -0.5 : 0.5;
                        switch (this.direction) {
                            case 'right':
                                this.cannonballs.push({
                                    x: (this.col + 0.5) * game.field.cellWidth(),
                                    y: (this.row + 0.5 + modifier) * game.field.cellHeight(),
                                    direction: side,
                                    shipDirection: this.direction
                                });
                                break;
                            case 'left':
                                this.cannonballs.push({
                                    x: (this.col + 0.5) * game.field.cellWidth(),
                                    y: (this.row + 0.5 - modifier) * game.field.cellHeight(),
                                    direction: side,
                                    shipDirection: this.direction
                                });
                                break;
                            case 'up':
                                this.cannonballs.push({
                                    x: (this.col + 0.5 + modifier) * game.field.cellWidth(),
                                    y: (this.row + 0.5) * game.field.cellHeight(),
                                    direction: side,
                                    shipDirection: this.direction
                                });
                                break;
                            case 'down':
                                this.cannonballs.push({
                                    x: (this.col + 0.5 - modifier) * game.field.cellWidth(),
                                    y: (this.row + 0.5) * game.field.cellHeight(),
                                    direction: side,
                                    shipDirection: this.direction
                                });
                                break;
                        }
                    };
                    ship.savePosition = function () {
                        this.prevPosition = {
                            //direction: this.direction,
                            col: this.col,
                            row: this.row
                        };
                    };
                    ship.restorePosition = function () {
                        if (!Object.keys(this.prevPosition).length) {
                            return;
                        }
                        //this.direction = this.prevPosition.direction;
                        this.col = this.prevPosition.col;
                        this.row = this.prevPosition.row;
                    };
                    ship.getSideCells = function () {
                        var cells = [];
                        switch (this.direction) {
                            case 'right':
                            case 'left':
                                cells.push({
                                        col: this.col,
                                        row: this.row - 1
                                    }, {
                                        col: this.col,
                                        row: this.row + 1
                                    }
                                );
                                break;
                            case 'up':
                            case 'down':
                                cells.push({
                                        col: this.col - 1,
                                        row: this.row
                                    }, {
                                        col: this.col + 1,
                                        row: this.row
                                    }
                                );
                                break;
                        }
                        return cells;
                    };
                })
            }
        };
    }

    window.canvasAnimation = true;
    requestAnimationFrame(loop);

    function loop(now) {
        if (window.canvasAnimation) {
            requestAnimationFrame(loop);
        }
        game.update(now);
    }

    //$(document).keydown(function(e) {
    //    var testShip = game.ships[0];
    //    switch(e.which) {
    //        case 37: // left
    //            testShip.turnMove('left');
    //            break;
    //
    //        case 38: // up
    //            testShip.forwardMove();
    //            break;
    //
    //        case 39: // right
    //            testShip.turnMove('right');
    //            break;
    //
    //        case 40: // down
    //            console.log(testShip.getSideCells());
    //            break;
    //        case 65: // leftFire
    //            testShip.cannonFire('left');
    //            break;
    //        case 68: // rightFire
    //            testShip.cannonFire('right');
    //            break;
    //
    //        default: return; // exit this handler for other keys
    //    }
    //    game.update();
    //    e.preventDefault(); // prevent the default action (scroll / move caret)
    //});

    $('#fps').html('<b>FPS: 0</b>');
    setInterval(function () {
        $('#fps').html('<b>FPS: ' + game.frame + '</b>');
        game.frame = 0;
    }, 1000);
};