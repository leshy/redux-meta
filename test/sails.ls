require! {
  util
  assert
  chai: { expect }
  leshdash: { keys, head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }: i
  'mocha-logger': l
}

require! { '../index.ls': { define }: reduxMeta }

describe 'fullSailsIntegration', ->
  before -> new p (resolve,reject) ~>
    l.log 'starting sails'
    sails = require './sailsapp/node_modules/sails'
    process.chdir './test/sailsapp'
    
    sails.lift { port: 31313, hooks: { grunt: false }, log: { level: 'verbose' } },  (err,sails) ~>
      if err then reject err else resolve @sails = sails

  before -> new p (resolve,reject) ~> 
    l.log 'connecting websocket'
    io = @io = require('./sailsapp/node_modules/sails.io.js')( require('./sailsapp/node_modules/socket.io-client') )
    io.sails.transports=<[ websocket ]>
    io.sails.url = 'http://localhost:31313'
    io.socket.on 'connect', resolve

  before ->
    require! {
      redux
      'redux-thunk'
    }

    opts = do
      name: 'testmodel'
      io: @io
      
    reducer = reduxMeta.reducers.Collection opts

    @store = redux.createStore do
      redux.combineReducers testmodel: reducer
      {}
      redux.applyMiddleware(reduxThunk.default)

    @actions = reduxMeta.actions.SailsCollection opts <<< store: @store
  specify 'init', -> new p (resolve,reject) ~> 
    l.log 'dispatch create action'
    
    @store.dispatch @actions.remoteCreate name: 'model1', size: 33
    console.log state: @store.getState()
    wait 1000, ~> 
      console.log "DONE"
      console.log state: @store.getState()
      
      resolve true
      
