require! {
  path
  util
  assert
  chai: { expect }
  leshdash: { keys, head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head, omit }
  bluebird: p
  immutable: { OrderedMap }: i
  
  'mocha-logger': l
  
  randomlisten
}

require! { '../index.ls': { define }: reduxMeta }

describe 'fullSailsIntegration', ->
  describe 'SailsCollection', -> 
    before ->  new p (resolve,reject) ~>
      l.log "starting test sails instance"
      process.chdir @dir = path.resolve __dirname, '../sailsTestApp'
      sails = require "#{@dir}/node_modules/sails"

      randomlisten (err, @port ) ~> 

        if err then return reject err
        l.log "will use port #{ @port }"

        sails.lift { port: @port, hooks: { grunt: false }, log: { level: 'silent' } },  (err,sails) ~>
          if err then reject err else resolve @sails = sails

    before -> new p (resolve,reject) ~>
      l.log 'connecting websocket'
      io = @io = require("#{@dir}/node_modules/sails.io.js")( require("#{@dir}/node_modules/socket.io-client") )
      io.sails.transports=<[ websocket ]>
      io.sails.url = "http://localhost:#{ @port }"
      io.socket.on 'connect', ->
        l.success 'sails ready for testing'
        resolve!

    before ->
      require! {
        redux
        'redux-thunk'
      }

      { reducers, @actions } = reduxMeta.define do
        reduxMeta.reducers.Collection
        reduxMeta.actions.SailsCollection

        name: 'testmodel'
        io: @io

      @store = redux.createStore do
        redux.combineReducers reducers
        {}
        redux.applyMiddleware(reduxThunk.default)

    specify 'init store', ->     
      expect @store.getState()
      .to.deep.equal {"testmodel":{"state":"empty"}}

    specify 'remoteCreate one', -> new p (resolve,reject) ~>
      @store.dispatch @actions.remoteCreate name: 'model1', size: 33

      expect @store.getState()
      .to.deep.equal {"testmodel":{"state":"loading"}}

      unsub = @store.subscribe ~>
        unsub()

        @sails.models.testmodel.find().exec (err,models) ~> 
          state = @store.getState().testmodel

          expect state.state
          .to.equal 'data'

          expect JSON.stringify (state.data.get 1).filter (value,key) -> key not in <[ createdAt updatedAt ]>
          .to.equal '{"name":"model1","size":"33","id":1}'

          resolve!


    specify 'remoteCreate multi', -> new p (resolve,reject) ~> 
      @store.dispatch @actions.remoteCreate name: 'model2', size: 141
      @store.dispatch @actions.remoteCreate name: 'model3', size: 13

      expect @store.getState().testmodel.state
      .to.equal 'loading'

      expect @store.getState().testmodel.data.size
      .to.equal 1
    
      unsub = @store.subscribe ~>
        if @store.getState().testmodel.data.size isnt 3 then return
        unsub()
        resolve!

    specify 'remoteRemove', -> new p (resolve,reject) ~> 
      @store.dispatch @actions.remoteRemove id: 1

      unsub = @store.subscribe ~>
        unsub!
        expect @store.getState().testmodel.data.size
        .to.equal 2

        resolve!

    specify 'remoteUpdate', -> new p (resolve,reject) ~> 
      @store.dispatch @actions.remoteUpdate id: 2, size: 1

      expected = '{"name":"model2","size":"1","id":2}'

      unsub = @store.subscribe ~>
        unsub!
        expect JSON.stringify (@store.getState().testmodel.data.get 2).filter (value,key) -> key not in <[ createdAt updatedAt ]>
        .to.equal expected

        @sails.models.testmodel.find({ id: 2 }).exec (err,models) ~>
          expect JSON.stringify omit head(models), <[ createdAt updatedAt ]>
          .to.equal expected

          resolve!

    specify 'get', -> new p (resolve,reject) ~>
      @store.dispatch @actions.get size: 1
      unsub = @store.subscribe ~>
        unsub!
        
        state = @store.getState().testmodel
        
        expect state.data.size
        .to.equal 1
        
        expect JSON.stringify (state.data.get 2).filter (value,key) -> key not in <[ createdAt updatedAt ]>
        .to.equal '{"name":"model2","size":"1","id":2}'
        
        resolve!

