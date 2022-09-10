const any       = f => pipe(map(f), reduce(or)(false))
const add       = o1 => o2 => ({...o1, x: o1.x + o2.x, y: o1.y + o2.y})
const addX      = o1 => o2 => ({...o1, x: o1.x + o2.x, y: o1.y})
const addY      = o1 => o2 => ({...o1, x: o1.x, y: o1.y + o2.y})
const adjust    = n => f => xs => mapi(x => i => i == n ? f(x) : x)(xs)
const all       = f => pipe(map(f), reduce(and)(true))
const and       = x => y => x && y
const dropFirst = xs => xs.slice(1)
const equals    = o1 => o2 => o1.x === o2.x && o1.y === o2.y
const id        = x => x
const ifelse    = c => t => f => x => c(x) ? t(x) : f(x)
const inc       = n => n + 1
const index     = n => xs => xs[n]
const isTrue    = v => v === true 
const k         = x => y => x
const map       = f => xs => xs.map(f)
const mapi      = f => xs => xs.map((x, i) => f(x)(i))
const merge     = o1 => o2 => Object.assign({}, o1, o2)
const mightBe   = () => Math.random() > 0.4999
const or        = x => y => x || y
const pipe      = (...fns) => x => [...fns].reduce((acc, f) => f(acc), x)
const reduce    = f => z => xs => xs.reduce((acc, x) => f(acc)(x), z)
const prop      = k => o => o[k]
const range     = n => m => Array.apply(null, Array(m - n)).map((_, i) => n + i)
const repeat    = c => n => map(k(c))(range(0)(n))

const north     = () => ({ x: 0, y:-1 })
const south     = () => ({ x: 0, y: 1 })
const east      = () => ({ x: 1, y: 0 })
const west      = () => ({ x:-1, y: 0 })
const northEast = () => ({ x: 1, y: -1 })
const northWest = () => ({ x: -1, y: -1 })
const southEast = () => ({ x: 1, y: 1 })
const southWest = () => ({ x: -1, y: 1 })

const advance = state => merge(state)({
    ball: add(state.ball)(state.ballDirection)
})
const ballIsMovingSouth = state => state.ballDirection.y === 1
const ballHitsBar = state => or(ballWillPlayer(state))(ballWillHitCpu(state))
const ballWillHitGoal = state => or(willScoreLeft(state))(willScoreRight(state))
const ballWillHitCpu = state => nextContains(state)(state.cpu)
const ballWillPlayer = state => nextContains(state)(state.player)
const ballWillHitSide = state => or(willHitTop(state))(willHitBottom(state))
const cpuWillCrash = state => isValid(state)(nextCpuPositions(state)(state.cpu))
const defending = state => state.ballDirection.x === -1
const fromSideDirection = state => pipe(
    ifelse(ballIsMovingSouth)(
        ifelse(defending)(northWest)(northEast)
    )(ifelse(defending)(southWest)(southEast))
)(state)
const fromBarDirection = state => pipe(
    ifelse(defending)(
        ifelse(mightBe)(east)(southEast)
    )(ifelse(mightBe)(west)(northWest))
)(state) 
const gameEnded = state => or(state.lost > 9)(state.won > 9)
const goalAgainst = state => state.ball.x === 0;
const hasMoves = state => state.moves.length > 0
const isValid = state => xs => xs.some((o) => !withinRange(state)(o))
const lostGame = state => merge(State.initialState())({
    lost: inc(state.lost),
    won: state.won 
})
const movesAvailable = state => state.moves.length > 1
const newDirectionFromBar = state => merge(state)({
    ballDirection: fromBarDirection(state) 
})
const newDirectionFromSide = state => merge(state)({
    ballDirection: fromSideDirection(state)
})
const nextContains = state => xs => xs.some((pos) => equals(pos)(nextBallPos(state)))
const nextCpuPositions = state => xs => xs.map((o) => addY(o)(state.ballDirection))
const nextPlayerPos = state => o => hasMoves(state) ? nextPosition(o) : state.player
const nextPlayerPositions = state => xs => xs.map((o) => nextPlayerPos(state)(o))
const nextPositions = xs => xs.map(o => nextPosition(o))
const nextPosition = pos => hasMoves(state)? add(pos)(index(0)(state.moves)) : pos
const nextBallPos = state => add(state.ball)(state.ballDirection)
const playerWillCrash = state => isValid(state)(nextPlayerPositions(state)(state.player)) 
const shouldNotAdvance = state => any(isTrue)([
    gameEnded(state),
    ballHitsBar(state),
    ballWillHitSide(state)
])
const withinX = state => o => and(o.x >= 0)(o.x < state.cols)
const withinY = state => o => and(o.y > 0)(o.y < state.rows)
const withinRange = state => o => (withinX(state)(o) && withinY(state)(o))
const willScoreLeft = state => nextBallPos(state).x === -1
const willScoreRight = state => nextBallPos(state).x === state.cols
const willHitTop = state => nextBallPos(state).y === -1
const willHitBottom = state => nextBallPos(state).y === state.rows
const wonGame = state => merge(State.initialState())({
    won: inc(state.won),
    lost: state.lost 
})


const State = {}
State.initialState = () => ({
    cols: 36,
    rows: 24,   
    cpu: [
        {x: 35, y: 10},
        {x: 35, y: 11},
        {x: 35, y: 12},
        {x: 35, y: 13},
        {x: 35, y: 14},
    ],
    player: [
        {x: 0, y: 10},
        {x: 0, y: 11},
        {x: 0, y: 12},
        {x: 0, y: 13},
        {x: 0, y: 14}
    ],
    moves: [],
    ball: {x: 10, y: 10},
    ballDirection: east(),
    won: 0,
    lost: 0,
    playerScore: {x: 5, y:3},
    cpuScore: {x: 30, y: 3}
})
State.enqueue = (state, move) => merge(state)({ 
    moves: state.moves.concat([move]) 
})
State.nextPlayer = state => playerWillCrash(state) ? 
    state : hasMoves(state) ?
    merge(state)({
        player: nextPositions(state.player)
    }) : state
State.nextMove = state => movesAvailable(state) ? merge(state)({
    moves: dropFirst(state.moves)
}) : state               
State.nextBall = state => pipe(
    ifelse(ballHitsBar)(newDirectionFromBar)(id),
    ifelse(ballWillHitGoal)(
        ifelse(goalAgainst)(lostGame)(wonGame)
    )(id),
    ifelse(ballWillHitSide)(newDirectionFromSide)(id),
    ifelse(shouldNotAdvance)(id)(advance),
    ifelse(gameEnded)(State.initialState)(id),
)(state)
State.nextCpu = state => merge(state)({
    cpu: state.cpu.map((o) => !defending(state) ? 
    !cpuWillCrash(state) ? addY(o)(state.ballDirection) : o : o 
)})
State.next = pipe(
    State.nextPlayer,
    State.nextMove,
    State.nextBall,
    State.nextCpu
)


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


let state = State.initialState()
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
setInterval(() => { step(); show() }, 40)
