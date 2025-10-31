document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid')
    const scoreDisplay = document.getElementById('score')
    const levelDisplay = document.getElementById('level')
    const enemyDisplay = document.getElementById('enemies')
    // size of the grid, 10 squares, 48 px wide
    const width = 10
    const tileSize = 48

    const squares = []
    let score = 0
    let level = 0
    let playerPosition = 40
    let enemies = []
    let playerDirection = 'right'
    let gameRunning = true

    // y,w,x,z = corner walls | a,b = side walls | c,d = top/bottom walls
    // ) = lanterns | ( = fire pots | % = left door | ^ = top door | $ = stairs
    // * = slicer enemy | } = skeleter enemy | (space) = empty walkable area
    const maps = [
        // level 1 map
        [
            'ycc)cc^ccw',
            'a        b',
            'a      * b',
            'a    (   b',
            '%        b',
            'a    (   b',
            'a  *     b',
            'a        b',
            'xdd)dd)ddz'
        ],
        // level 2
        [
            'yccccccccw',
            'a        b',
            ')        )',
            'a        b',
            'a        b',
            'a    $   b',
            ')   }    )',
            'a        b',
            'xddddddddz',         
        ]
    ]

    function createBoard() {
        // reset the game after each new level
        gameRunning = true
        grid.innerHTML = ''
        squares.length = 0
        enemies = []
        // get the first map at level 1
        const currentMap = maps[level]

        for(let i = 0; i < 9; i++){
            for(let j = 0; j < 10; j++){
                // create a container for each square
                const square = document.createElement('div')
                // assign each square by their location on the grid
                square.setAttribute('id', i * width + j)
                // get the coordinating square
                const char = currentMap[i][j]
                // add the artwork onto the square
                addMapElement(square, char, j, i)

                grid.appendChild(square)
                squares.push(square)
            }
        }
        // create link
        createPlayer()
    }

    function addMapElement(square, char, x, y){
        switch(char){
            case 'a':
                square.classList.add('left-wall')
                break
            case 'b':
                square.classList.add('right-wall')
                break
            case 'c':
                square.classList.add('top-wall')
                break
            case 'd':
                square.classList.add('bottom-wall')
                break
            case 'w':
                square.classList.add('top-right-wall')
                break
            case 'x':
                square.classList.add('bottom-left-wall')
                break
            case 'y':
                square.classList.add('top-left-wall')
                break
            case 'z':
                square.classList.add('bottom-right-wall')
                break
            case '%':
                square.classList.add('left-door')
                break
            case '^':
                square.classList.add('top-door')
                break
            case '$':
                square.classList.add('stairs')
                break
            case ')':
                square.classList.add('lanterns')
                break
            case '(':
                square.classList.add('fire-pot')
                break
            case '*':
                createSlicer(x,y)
                break
            case '}':
                createSkeletor(x,y)
                break
        }
    }

    function createPlayer(){
        const playerElement = document.createElement('div')
        playerElement.classList.add('link-going-right')
        playerElement.id = 'player'
        // get link's position on the grid
        playerElement.style.left = `${(playerPosition % width) * tileSize}px`
        // get link's vertical position
        playerElement.style.top = `${Math.floor(playerPosition / width) * tileSize}px`
        // add link to the grid
        grid.appendChild(playerElement)
    }

    function createSlicer(x,y){
        const slicerElement = document.createElement('div')
        slicerElement.classList.add('slicer')
        slicerElement.style.left = `${x * tileSize}px`
        slicerElement.style.top = `${y * tileSize}px`

        const slicer = {
            x, y,
            direction: -1,
            type: 'slicer',
            element: slicerElement
        }

        enemies.push(slicer)
        grid.appendChild(slicerElement)
    }

    function createSkeletor(x,y){
        const skeletorElement = document.createElement('div')
        skeletorElement.classList.add('skeletor')
        skeletorElement.style.left = `${x * tileSize}px`
        skeletorElement.style.top = `${y * tileSize}px`

        const skeletor = {
            x, y,
            direction: -1,
            timer: Math.random() * 5,
            type: 'skeletor',
            element: skeletorElement
        }

        enemies.push(skeletor)
        grid.appendChild(skeletorElement)
    }
    
    
    function movePlayer(direction) {
        const playerElement = document.getElementById('player')
        let newPosition = playerPosition

        switch(direction){
            case 'left':
                // check if player is in the left most column
                if (playerPosition % width !==0) newPosition = playerPosition -1
                playerElement.className = 'link-going-left'
                playerDirection = 'left'
                break

            case 'right':
                // check if player is in the right most column
                if (playerPosition % width !== width-1) newPosition = playerPosition +1
                playerElement.className = 'link-going-right'
                playerDirection = 'right'
                break
                
            case 'up':
                // check if player is in the top most column
                if (playerPosition - width >=0) newPosition = playerPosition - width
                playerElement.className = 'link-going-up'
                playerDirection = 'up'
                break

            case 'down':
                // check if player is in the bottom most column
                if (playerPosition + width < width * 9) newPosition = playerPosition + width
                playerElement.className = 'link-going-down'
                playerDirection = 'down'
                break
        }

        // check to make sure there is not an object occupying the square
        if (canMoveTo(newPosition)){
            const square = squares[newPosition]
            // interative doors that player can move through
            if (square.classList.contains('left-door')){
                square.classList.remove('left-door')
            }
            // check for level progression triggers
            if (square.classList.contains('top-door') || square.classList.contains('stairs')){
                // player can only continue to the next level after defeating all enemies
                if (enemies.length === 0){
                    nextLevel()
                } else {
                    showEnemiesRemainingMessage()
                }
                return
            }

            // display link moving on the board
            playerPosition = newPosition
            playerElement.style.left = `${(playerPosition % width) * tileSize}px`
            playerElement.style.top=`${Math.floor(playerPosition / width) * tileSize}px`
        } 
    }

    function canMoveTo(position){
        // check if position is outside grid boundaries
        if (position < 0 || position >= squares.length) return false
        // find current position and check if it contains an object
        const square = squares[position]

        return !square.classList.contains('left-wall') &&
                !square.classList.contains('right-wall') && 
                !square.classList.contains('top-wall') &&
                !square.classList.contains('bottom-wall') &&
                !square.classList.contains('top-left-wall') &&
                !square.classList.contains('top-right-wall') &&
                !square.classList.contains('bottom-left-wall') &&
                !square.classList.contains('bottom-right-wall') &&
                !square.classList.contains('lanterns') &&
                !square.classList.contains('fire-pot')
    }

    function spawnKaboom(){
        // calculate which position player is facing so kaboom spawns in front
        let kaboomX = playerPosition % width
        let kaboomY = Math.floor(playerPosition / width)

        switch(playerDirection){
            case 'left':
                kaboomX -= 1
                break
            
            case 'right':
                kaboomX += 1
                break

            case 'up':
                kaboomY -= 1
                break

            case 'down':
                kaboomY += 1
                break

        }
        // make sure the kaboom does not go outside of boundaries
        if (kaboomX >= 0 && kaboomX < width && kaboomY >= 0 && kaboomY < 9){
            const kaboomElement = document.createElement('div')
            kaboomElement.className = 'kaboom'
            kaboomElement.style.left = `${kaboomX * tileSize}px`
            kaboomElement.style.top = `${kaboomY * tileSize}px`
            grid.appendChild(kaboomElement)

            checkKaboomEnemyCollision(kaboomX, kaboomY)

            // remove explosion after a certain amount of time
            setTimeout(() =>{
                if(kaboomElement.parentNode){
                    kaboomElement.parentNode.removeChild(kaboomElement)
                }
            }, 1000)
        }
    }

    function checkKaboomEnemyCollision(kaboomX, kaboomY){
        for (let i= enemies.length - 1; i >= 0; i--){
            const enemy = enemies[i]
            const enemyX = Math.round(enemy.x)
            const enemyY = Math.round(enemy.y)
            // remove kaboom from the board
            if(enemyX === kaboomX && enemyY === kaboomY){
                if(enemy.element.parentNode){
                    enemy.element.parentNode.removeChild(enemy.element)
                }
                // remove kaboom from enemies array and update the score
                enemies.splice(i, 1)
                score++
                updateDisplays()
                break
            }
        }
    }

    function checkPlayerEnemyCollision(){
        // get player coordinates
        const playerX = playerPosition % width
        const playerY = Math.floor(playerPosition / width)

        for (const enemy of enemies){
            // get enemy coordinates
            const enemyX = Math.round(enemy.x)
            const enemyY = Math.round(enemy.y)

            if (enemyX === playerX && enemyY === playerY){
                // player and enemy are on the same square
                gameOver()
                return
            }
        }
    }

    function moveEnemies(deltaTime){
        // loop through enemies array and summon them
        for (const enemy of enemies){
            if (enemy.type === 'slicer'){
                moveSlicer(enemy, deltaTime)
            } else if (enemy.type === 'skeletor'){
                moveSkeletor(enemy,deltaTime)
            }
        }
    }

    function moveSlicer(slicer, deltaTime) {
        // set the speed of the slicer and new horizatal/vertical position
        const speed = 2 * deltaTime
        const newX = slicer.x + (slicer.direction * speed)
        const y = Math.round(slicer.y)
        // boundaries checker
        if (newX < 0 || newX >= width || isWall(Math.round(newX), y)){
            slicer.direction *= -1
        } else {
            slicer.x = newX
        }

        // update position
        slicer.element.style.left = `${slicer.x * tileSize}px`
    }

     function moveSkeletor(skeletor, deltaTime) {
        // set the speed of the skeletor and new horizatal/vertical position
        const speed = 1.5 * deltaTime
        skeletor.timer -= deltaTime
        // boundaries checker
        if (skeletor.timer <= 0){
            skeletor.direction *= -1
            skeletor.timer = Math.random() * 5
        } 
        
        // update position
        const newY = skeletor.y + (skeletor.direction * speed)
        const x = Math.round(skeletor.x)
        // boundaries checker
        if (newY < 0 || newY >= 9 || isWall(x,Math.round(newY))){
            skeletor.direction *= -1
        } else {
            skeletor.y = newY
        }
        skeletor.element.style.top = `${skeletor.y * tileSize}px`      
    }   

    function isWall(x, y){
        // converts grid coordinates into grid index
        const position = y * width + x
        // check if position is outside of grid bounds
        if (position < 0 || position >= squares.length) return true
        const square = squares[position]
        return square.classList.contains('left-wall') ||
            square.classList.contains('right-wall') ||
            square.classList.contains('top-wall') ||
            square.classList.contains('bottom-wall') ||
            square.classList.contains('top-left-wall') ||
            square.classList.contains('top-right-wall') ||
            square.classList.contains('bottom-left-wall') ||
            square.classList.contains('bottom-right-wall') ||
            square.classList.contains('lanterns') ||
            square.classList.contains('fire-pot')

    }

    function updateDisplays(){
        // update the scores for the user
        scoreDisplay.innerHTML = score
        levelDisplay.innerHTML = level + 1
        enemyDisplay.innerHTML = enemies.length
    }

    function nextLevel(){
        // loop though maps
        level = (level + 1) % maps.length
        // create the next board
        createBoard()
    }

    function showEnemiesRemainingMessage() {
        // flash the screen red
        grid.style.filter = 'hue-rotate(0deg) saturate(2) brightness(1.5)'
        grid.style.boxShadow = '0 0 20px red'

        setTimeout(() => {
            grid.style.filter = ''
            grid.style.boxShadow = ''
        }, 300)

        showTemporaryMessage('Defaut all enemies first!', 'red', 2000)
    }

    function showTemporaryMessage(message, color, duration){
        // check if message is already being displayed
        const existingMessage = document.getElementById('temp-message')
        if (existingMessage) existingMessage.remove()
        // display new message to player
        const messageElement = document.createElement('div')
        messageElement.id = 'temp-message'
        messageElement.textContent = message
        messageElement.style.color = color
        grid.appendChild(messageElement)

        setTimeout(() => {
            if (messageElement.parentNode){
                messageElement.remove()
            }
        }, duration)
    }

    // listen for user key input
    document.addEventListener('keydown', (e)=>{
        if(!gameRunning) return

        switch(e.code){
            case 'ArrowLeft':
                e.preventDefault()
                movePlayer('left')
                break
            
            case 'ArrowRight':
                e.preventDefault()
                movePlayer('right')
                break

            case 'ArrowUp':
                e.preventDefault()
                movePlayer('up')
                break

            case 'ArrowDown':
                e.preventDefault()
                movePlayer('down')
                break

            case 'Space':
                e.preventDefault()
                spawnKaboom()
                break
        }
    })

    let lastTime = 0
    let animationId

    function gameLoop(currentTime){
        // calculate current time based on last frame
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        if (gameRunning && deltaTime < 0.1){
            moveEnemies(deltaTime)
            checkPlayerEnemyCollision()
        }
        // update the number of enemies
        updateDisplays()
        animationId = requestAnimationFrame(gameLoop)
    }


    function gameOver(){
        gameRunning = false
        showTemporaryMessage(`Game Over! Final Score: ${score}`, 'white', 3000)
    }

    createBoard()
    animationId = requestAnimationFrame(gameLoop)

})