
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let state = initialState()
    
const x = c => Math.round(c * canvas.width / state.cols) 
const y = r => Math.round(r * canvas.height / state.rows)

const cellWidth = canvas.width / state.cols
const cellHeight = canvas.height / state.rows

const draw = () => {

    ctx.fillStyle = '#232323'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  
    //draw score
    ctx.fillStyle = '#666'
    ctx.font = '16px Ubuntu'
    ctx.fillText(state.won, x(state.playerScore.x), y(state.playerScore.y))
    ctx.fillText(state.lost, x(state.cpuScore.x), y(state.cpuScore.y))
    
    //draw player
    ctx.fillStyle = 'rgb(0,200,50)'
    state.player.map(p => ctx.fillRect(x(p.x), y(p.y), x(1), y(1.025)))
  
    //draw cpu
    ctx.fillStyle = 'rgb(200,50,50)'
    state.cpu.map(p => ctx.fillRect(x(p.x), y(p.y), x(1), y(1.025)))

    //draw ball
    ctx.fillStyle = 'white'
    ctx.beginPath() 
    ctx.arc(x(state.ball.x) + 10, y(state.ball.y) + 9, 10, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    
}

const step = t1 => t2 => {
    if (t2 - t1 > 10) {
      state = State.next(state)
      draw()
      requestAnimationFrame(step(t2))
    } else {
      requestAnimationFrame(step(t1))
    }
  }
  
  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'w': case 'h': case 'ArrowUp':   
        state = State.enqueue(state, north()); break
      case 's': case 'k': case 'ArrowDown':  
        state = State.enqueue(state, south()); break
    }
  })
  
  draw()
  requestAnimationFrame(step(0))
  