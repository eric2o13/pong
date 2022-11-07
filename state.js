const lib = require('./lib')
Object.getOwnPropertyNames(lib).map(p => global[p] = lib[p])

const State = {}

State.enqueue = (state, move) => merge(state)({ 
    moves: state.moves.concat([move]) 
})

State.nextPlayer = state => playerWillCrash(state) ? 
    state : hasMoves(state) ?
    merge(state)({
        player: nextPositions(state.player)(state)
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
    ifelse(gameEnded)(initialState)(id),
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

module.exports = State