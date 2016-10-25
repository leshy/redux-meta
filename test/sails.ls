require! {
  util
  assert
  chai: { expect }
  leshdash: { keys, head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head, omit }
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
    
    sails.lift { port: 31313, hooks: { grunt: false }, log: { level: 'silent' } },  (err,sails) ~>
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
    
  specify 'init', ->     
    expect JSON.stringify @store.getState()
    .to.equal '{"testmodel":{"state":"empty"}}'

  specify 'create', -> new p (resolve,reject) ~> 
    @store.dispatch @actions.remoteCreate name: 'model1', size: 33
    
    expect JSON.stringify @store.getState()
    .to.equal '{"testmodel":{"state":"loading"}}'

    unsub = @store.subscribe ~>
      unsub()
      @sails.models.testmodel.find().exec (err,models) ~> 
        state = @store.getState().testmodel

        expect state.state
        .to.equal 'data'

        expect JSON.stringify (state.data.get 1).filter (value,key) -> key not in <[ createdAt updatedAt ]>
        .to.equal '{"name":"model1","size":"33","id":1}'
        
        resolve true
      
  specify 'remove', -> new p (resolve,reject) ~> 
    @store.dispatch @actions.remoteRemove id: 1
    expect @store.getState().testmodel.state
    .to.equal 'loading'

    unsub = @store.subscribe ~> 
      expect JSON.stringify @store.getState()
      .to.equal '{"testmodel":{"state":"empty"}}'
      
      unsub()
      resolve true
      
