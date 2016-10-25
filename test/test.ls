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

describe 'reduxMeta', ->
  before -> new p (resolve,reject) ~>
    l.log 'starting sails'
    sails = require './sailsapp/node_modules/sails'
    
    sails.lift { port: 31313, hooks: { grunt: false }, log: { level: 'silent' } },  (err,sails) ~>
      if err then reject err else resolve @sails = sails

  before -> new p (resolve,reject) ~> 
    l.log 'connecting websocket'
    io = @io = require('./sailsapp/node_modules/sails.io.js')( require('./sailsapp/node_modules/socket.io-client') )
    io.sails.transports=<[ websocket ]>
    io.sails.url = 'http://localhost:31313'
    io.socket.on 'connect', resolve


  specify 'init', -> new p (resolve,reject) ~> 
    require! {
      redux
      'redux-thunk'
    }
    
    { actions, reducers } = reduxMeta.define reduxMeta.reducers.Collection, reduxMeta.actions.Collection, do
      name: 'testmodel'
      io: @io

    store = redux.createStore do
      reducers
      {}
      redux.applyMiddleware(reduxThunk.default)

      
    console.log state: store.getState()

    console.log actions: keys actions
    console.log reducers: reducers

    store.dispatch actions.create payload: { id: 3, lala: 213 }
    wait 1000, -> 
      console.log state: store.getState()
      resolve true
