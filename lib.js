
const initialState = () => ({
    cols: 40,
    rows: 22,   
    cpu: [
        {x: 39, y: 8},
        {x: 39, y: 9},
        {x: 39, y: 10},
        {x: 39, y: 11},
        {x: 39, y: 12},
    ],
    player: [
        {x: 0, y: 8},
        {x: 0, y: 9},
        {x: 0, y: 10},
        {x: 0, y: 11},
        {x: 0, y: 12}
    ],
    moves: [],
    ball: {x: 10, y: 10},
    ballDirection: east(),
    won: 0,
    lost: 0,
    playerScore: {x: 5, y:3},
    cpuScore: {x: 30, y: 3}
})

const any       = f => pipe(map(f), reduce(or)(false))
const add       = o1 => o2 => ({...o1, x: o1.x + o2.x, y: o1.y + o2.y})
const addY      = o1 => o2 => ({...o1, x: o1.x, y: o1.y + o2.y})
const adjust    = n => f => xs => mapi(x => i => i == n ? f(x) : x)(xs)
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
        ifelse(mightBe)(east)(ifelse(mightBe)(northEast)(southEast))
    )(ifelse(mightBe)(west)(ifelse(mightBe)(southWest)(northWest)))
)(state)
const gameEnded = state => or(state.lost > 9)(state.won > 9)
const goalAgainst = state => state.ball.x === 0;
const hasMoves = state => state.moves.length > 0
const isValid = state => xs => xs.some((o) => !withinRange(state)(o))
const lostGame = state => merge(initialState())({
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
const nextPlayerPos = state => o => hasMoves(state) ? nextPosition(o)(state) : o
const nextPlayerPositions = state => xs => xs.map((o) => nextPlayerPos(state)(o))
const nextPositions = xs => state => xs.map(o => nextPosition(o)(state))
const nextPosition = pos => state => addY(pos)(index(0)(state.moves))
const nextBallPos = state => add(state.ball)(state.ballDirection)
const playerWillCrash = state => isValid(state)(nextPlayerPositions(state)(state.player)) 
const shouldNotAdvance = state => any(isTrue)([
    gameEnded(state),
    ballHitsBar(state),
    ballWillHitSide(state)
])
const withinX = state => o => and(o.x >= 0)(o.x <= state.cols)
const withinY = state => o => and(o.y >= 0)(o.y < state.rows)
const withinRange = state => o => (and(withinX(state)(o))(withinY(state)(o)))
const willScoreLeft = state => nextBallPos(state).x === -1
const willScoreRight = state => nextBallPos(state).x === state.cols
const willHitTop = state => nextBallPos(state).y === -1
const willHitBottom = state => nextBallPos(state).y === state.rows
const wonGame = state => merge(initialState())({
    won: inc(state.won),
    lost: state.lost 
})

module.exports = {
    initialState,
    any,
    add,
    addY,
    adjust,
    and,
    dropFirst,
    equals,
    id,
    ifelse,
    inc,
    index,
    isTrue,
    k,
    map,
    mapi,
    merge,
    mightBe,
    or,
    pipe,
    reduce,
    range,
    repeat,
    north,
    south,
    east,
    west,
    northEast,
    northWest,
    southEast,
    southWest,
    advance,
    ballIsMovingSouth,
    ballHitsBar,
    ballWillHitGoal,
    ballWillHitCpu,
    ballWillPlayer,
    ballWillHitSide,
    cpuWillCrash,
    defending,
    fromSideDirection,
    fromBarDirection,
    gameEnded,
    goalAgainst,
    hasMoves,
    isValid,
    lostGame,
    movesAvailable,
    newDirectionFromBar,
    newDirectionFromSide,
    nextContains,
    nextCpuPositions,
    nextPlayerPos,
    nextPlayerPositions,
    nextPositions,
    nextPosition,
    nextBallPos,
    playerWillCrash,
    shouldNotAdvance,
    withinX,
    withinY,
    withinRange,
    willScoreLeft,
    willScoreRight,
    willHitTop,
    willHitBottom,
    wonGame,
}