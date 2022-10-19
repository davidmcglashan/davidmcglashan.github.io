// ==============================================================================================
// Game state stuff!
// We need to know the canvas dimensions to calculate some of this ...
// ==============================================================================================

// refs for the major scene elements
var gameover = document.getElementById( 'gameover' )
var kiosk = document.getElementById( 'kiosk' )
var game = document.getElementById( 'game' )
var stars = document.getElementById( 'stars' )
var info = document.getElementById( 'info' )

// Globals for screen dimensions, etc.
var width = 0;
var height = 0;
var margin = 0;
var aperture = 0;
var level = 0;

// Beam globals
var beamPos = {
    x: 0,
    y: 0
}
var beamPath = []
var dust = []


// Moves the beam
// =====================
function moveDust( delta ) {
    for ( const d of dust ) {
        d.x -= d.speed*delta*0.25
        if ( d.x < 0 ) {
            d.x += width
        }
    }
}

// Moves the beam
// =====================
function beam( delta ) {
    ox = beamPos.x
    oy = beamPos.y

    // Add a new corner to the path if there has been a change in pressing state
    if ( isPressing !== wasPressing ) {
        var corner = {
            x: beamPos.x,
            y: beamPos.y
        }
        beamPath.push( corner )
    }
    wasPressing = isPressing

    // Move the beam
    beamPos.x += delta*tick
    if ( isPressing ) {
        beamPos.y -= delta*tick
    } else {
        beamPos.y += delta*tick
    }

    // Have we collided with a star? Check for non-zero pixels in the space we've
    // just moved through. This is _usually_ a tiny (2x2 or 3x3) square
    try {
        pxls = starGfx.getImageData( ox, oy, beamPos.x-ox, beamPos.y-oy ).data
        for ( i = 0; i < pxls.length; i++ ) {
            if ( pxls[i] != 0 ) {
                return true
            }
        }
    } catch( error ) {
        console.error( { ox:ox, oy:oy, bx:beamPos.x-ox, by:beamPos.y-oy } )
    }

    // Have we gone through the aperture or into the wall?
    if ( beamPos.x >= width-margin ) {
        // into the wall?
        if ( beamPos.y < height/2 - aperture/2 || beamPos.y > height/2 + aperture/2 ) {
            return true
        }

        // through the aperture!
        level += 1
        info.innerHTML = 'level ' + level
        newBeam()
        return false
    }
    
    // Have we gone out of bounds top and bottom?
    if ( beamPos.y <= margin || beamPos.y >= height-margin ) {
        return true
    }

    return false
}

// ==============================================================================================
// Graphics and painting stuff!
// Global graphics contexts for the canvases
// ==============================================================================================
var gameGfx = game.getContext( '2d' )
var starGfx = stars.getContext( '2d' )

// Draws the stardust
// ===========================
function paintDust() {
    gameGfx.clearRect( 0, 0, width, height );
    gameGfx.lineWidth = 1

    for ( const d of dust ) {
        gameGfx.beginPath();
        gameGfx.rect( d.x, d.y, 1, 1 )
        gameGfx.strokeStyle = d.style
        gameGfx.stroke()
    }
}

// Draws the beam
// ===========================
function paintBeam() {
    gameGfx.beginPath();
    gameGfx.strokeStyle = "#40d060"
    gameGfx.lineWidth = 5

    corner = beamPath[0]
    gameGfx.moveTo( beamPath.x, beamPath.y )

    for ( const corner of beamPath ) {
        gameGfx.lineTo( corner.x, corner.y )
    }

    gameGfx.lineTo( beamPos.x, beamPos.y )
    gameGfx.stroke()
}

// Draws the countdown traffic lights
// ==================================
function paintCountdown() {
    gameGfx.lineWidth = 5

    // Always three circles for the lamp rims
    gameGfx.strokeStyle = "#999aaa"
    for ( var x=0; x<3; x++ ) {
        gameGfx.beginPath();
        gameGfx.arc( 100+x*100, height/2, 25, 0, 2*Math.PI );
        gameGfx.stroke();
    }

    // Fill the ones that apply to the countdown so far.
    gameGfx.fillStyle = "#ff0000"
    for ( var x=0; x<(countdown/1000)-1; x++ ) {
        gameGfx.beginPath();
        gameGfx.arc( 100+x*100, height/2, 15, 0, 2*Math.PI );
        gameGfx.fill();
    }
}

// Draws the end game explosion
// ============================
function paintExplosion() {
    gameGfx.strokeStyle = "#40d060"
    gameGfx.lineWidth = 5

    for ( const p of particles ) {
        gameGfx.beginPath();
        gameGfx.rect( p.x-2, p.y-2, 4, 4 )
        gameGfx.stroke()
    }
}

// Draws the stars
// ===========================
function paintStars() {
    // Draw the frame
    starGfx.clearRect( 0, 0, width, height );
    starGfx.strokeStyle = "#dd6644"
    starGfx.lineWidth = 5

    starGfx.beginPath()
    starGfx.rect( margin, margin, width-2*margin, height-2*margin )
    starGfx.stroke()

    // Clear the aperture
    starGfx.clearRect( 0, height/2 - aperture/2, width, aperture );

    // Now draw the stars
    deg36 = 0.628319

    for ( var i = 0; i < 10 + level*3; i++ ) {
        x = Math.random() * (0.8 * width) + 0.15*width
        y = Math.random() * (0.9 * height) + 0.05*height
        size = Math.random() * ( width * 0.015 ) + width * 0.015
        theta = Math.random() * deg36 * 2

        starGfx.beginPath()
        for ( var j=0; j<11; j++ ) {
            dx = (j % 2 == 0 ? size : size/2) * Math.sin( theta )
            dy = (j % 2 == 0 ? size : size/2) * Math.cos( theta )
            theta += deg36

            if ( i === 0 ) {
                starGfx.moveTo( x+dx, y+dy )
            } else {
                starGfx.lineTo( x+dx, y+dy )
            }
        }

        r = Math.floor(200+Math.random()*55)
        g = Math.floor(200+Math.random()*55)
        b = Math.floor(200+Math.random()*55)
        starGfx.fillStyle = "rgba("+r+","+g+","+b+",0.8)"
        starGfx.fill()
    }
}

// ==============================================================================================
// Game loop stuff!
// ==============================================================================================

// Tracks the time difference between frame updates. Tick is how far the beam should advance
// in 1 millisecond
var lastRender = 0
var tick = 0
var countdown = 0

// Main game loop function. 
// Very simple: work out time diff, update everything, paint everything, repeat until death
// =======================
function loop( now ) {
    // Move the beam along and repaint the canvas
    isGameOver = beam( now - lastRender )
    moveDust( now - lastRender )
    paintDust()
    paintBeam()

    if ( !isGameOver ) {
        lastRender = now
        window.requestAnimationFrame( loop )
    } else {
        gameOver()
    }
}

// Countdown before a level begins
// =======================
function countdownLoop( now ) {
    delta = now - lastRender 
    countdown -= delta
    moveDust( delta )

    paintDust()
    paintCountdown()

    lastRender = now
    if ( countdown > 0 ) {
        window.requestAnimationFrame( countdownLoop )
    } else {
        window.requestAnimationFrame( loop )
    }
}

// Loop for the end game explosion
// ===============================
function explosionLoop( now ) {
    delta = now - lastRender 
    countdown -= delta
    
    for ( const p of particles ) {
        p.x += p.dx*delta/2
        p.y += p.dy*delta/2
    }

    moveDust( delta )
    paintDust()
    paintExplosion()

    lastRender = now
    if ( countdown > 0 ) {
        window.requestAnimationFrame( explosionLoop )
    } else {
        endState()
    }    
}


// Start the game!
// ===============
function play() {
    // Make the canvas visible, hide the kiosk ...
    game.style.display = 'block';
    stars.style.display = 'block';
    kiosk.style.display = 'none';
    gameover.style.display = 'none';
    info.style.display = 'block';
    level = 1
    info.innerHTML = 'level ' + level

    // kick off the game loops
    window.requestAnimationFrame( initState )    
}

// Reset the state of the beam and its path
// ========================================
function newBeam() {
    beamPos.x = margin
    if ( beamPos.y === 0 ) {
        beamPos.y = height / 2
    }

    beamPath = []
    var corner = {
        x: beamPos.x,
        y: beamPos.y
    }
    beamPath.push( corner )
    paintStars()
}

// Resizes the window to a high score size
// =======================================
function playScore( dim ) {
    var i = dim.indexOf('x')
    var w = dim.substring( 0, i )
    var h = dim.substring( i+1, dim.length )
    window.resizeTo( w, h )
}

// Initialise the game's state
// ===========================
function initState( timestamp ) {
    // update the dimensions now they're known
    width = game.offsetWidth;
    height = game.offsetHeight;
    game.width = width
    game.height = height
    stars.width = width
    stars.height = height

    beamPos.y = 0
    countdown = 4000

    dust = []
    for ( i=0; i<100; i++ ) {
        var d = {
            x: width*Math.random(),
            y: height*Math.random(),
            speed: 0.25 + Math.random()/2,
            style: "(" + 192+64*Math.random()/2 + "," + 192+64*Math.random()/2 + "," + 192+64*Math.random()/2 + "," + 0.5*Math.random()/2 + ")"
        }
        dust.push( d )
    }

    // margin and aperture depend on the screen dimensions
    margin = width * 0.015
    aperture = height * 0.2

    newBeam()

    lastRender = timestamp
    tick = width/5000
    window.requestAnimationFrame( countdownLoop )    
}

// End the game with an explosion
// ==============================
var particles = []
function gameOver() {
    particles = []
    for ( i=0; i<100; i++ ) {
        var p = {
            x: beamPos.x,
            y: beamPos.y,
            dx: 2*Math.random()-1,
            dy: 2*Math.random()-1
        }
        particles.push( p )
    }
    countdown = 2000
    window.requestAnimationFrame( explosionLoop )    
}

// End the game!
// ===============
function endState() {
    var levelSpan = document.getElementById( 'level' )
    levelSpan.innerHTML = level

    // Do the high score malarky!
    key = window.outerWidth + 'x' + window.outerHeight + '_hiscore' 
    oldHigh = localStorage.getItem( key )
    if ( oldHigh === undefined ) {
        oldHigh = 0
    }

    var newHigh = document.getElementById( 'newhighscore' )
    if ( level > oldHigh ) {
        newHigh.style.display = 'inline'
        localStorage.setItem( key, level )
    } else {
        newHigh.style.display = 'none'
    }

    // Show the game over screen ...
    gameover.style.display = 'block';
}

// Returns to the kiosk
// ===============
function back() {
    // Show the game over screen ...
    kiosk.style.display = 'block';
    game.style.display = 'none';
    stars.style.display = 'none';
    gameover.style.display = 'none';
    info.style.display = 'none';

    // Hide the highscores ...
    var highscores = document.getElementById( 'highscores' )
    highscores.style.display = 'none'

    // ... and show them it we find any!
    var scoreslist = document.getElementById( 'scoreslist' )
    while ( scoreslist.firstChild ) {
        scoreslist.firstChild.remove() 
    }

    for ( const[key, value] of Object.entries( localStorage ) ) {
        if ( key.indexOf( '_hiscore' ) !== -1 ) {
            var a = document.createElement( 'a' )
            var k = key.substring(0, key.length - 8);
            a.innerHTML = k + ' &mdash; level ' + value
            a.setAttribute( 'href', 'javascript:playScore("'+k+'");')
            var li = document.createElement( 'li' )
            li.appendChild( a )

            scoreslist.appendChild( li )
            highscores.style.display = 'block'
        }
    }
}

// ==============================================================================================
// Mouse stuff!
// Listen for mouse up and mouse down (hopefully fingers on touch devices!)
// ==============================================================================================

// When true, someone is pressing the mouse/touching the screen
var pressing = false;
var wasPressing = false;

// Determines if pressing is occurring or not. 
// ==============================
function isPressing( e ) {
    var flags = e.buttons !== undefined ? e.buttons : e.which;
    isPressing = (flags & 1) === 1;
}

// Update state when the mouse buttons are pressed or released.
document.addEventListener( "mousedown", isPressing );
document.addEventListener( "mouseup", isPressing );
document.addEventListener( "touchstart", function() { isPressing = true } )
document.addEventListener( "touchend", function() { isPressing = false } )

// Call back() to set up the kiosk properly
back()