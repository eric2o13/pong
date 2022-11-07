const State = require('./state')

const Color = {}
Color.red     = s => `\x1b[31m${s}\x1b[0m`
Color.green   = s => `\x1b[32m${s}\x1b[0m`
Color.yellow  = s => `\x1b[33m${s}\x1b[0m`
Color.white   = s => `\x1b[37m${s}\x1b[0m`

const Matrix        = {}
Matrix.make         = state => repeat(repeat('\u001b[40m ')(state.cols))(state.rows)
Matrix.set          = val => pos => adjust(pos.y)(adjust(pos.x)(k(val)))
Matrix.toString     = xsxs => xsxs.map(xs => xs.join('\u001b[40m ')).join('\r\n').concat('\u001b[0m')
Matrix.addCpu       = state => pipe(...map(Matrix.set('▓'))(state.cpu))
Matrix.addPlayer    = state => pipe(...map(Matrix.set(Color.white('▓')))(state.player))
Matrix.addBall      = state => Matrix.set(Color.yellow('◉'))(state.ball)
Matrix.addScore     = state => Matrix.set(Color.green(state.won))(state.playerScore)
Matrix.addCpuScore  = state => Matrix.set(Color.red(state.lost))(state.cpuScore)
Matrix.fromState    = state => pipe(
    Matrix.make,
    Matrix.addCpu(state),
    Matrix.addPlayer(state),
    Matrix.addBall(state),
    Matrix.addScore(state),
    Matrix.addCpuScore(state)
)(state)


let state = initialState()

const readline = require('readline')
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {    
  if (key.ctrl && key.name === 'c') process.exit()
  switch (key.name.toUpperCase()) {
    case 'UP':    state = State.enqueue(state, north()); break
    case 'DOWN':  state = State.enqueue(state, south()); break
  }
});

const show = () => console.log('\x1Bc' + Matrix.toString(Matrix.fromState(state)))
const step = () => state = State.next(state)
setInterval(() => { step(); show()}, 40)
