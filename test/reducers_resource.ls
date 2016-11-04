require! {
  util
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }:i
  'mocha-logger': l
  '../index.ls': { reducers }:reduxMeta
}

describe 'reducerOutput', -> 
  describe 'meta', ->
    
    Resource = ->
      before ->
        if not @c then @c = reducers.Resource name: 'somename'
        @state = @c void, { trigger: 'init' }

      specify 'loading', ->
        @state = @c @state, { type: 'resource_somename', verb: 'loading' }
        expect @state.state
        .to.equal 'loading'

      specify 'nameMatching', ->
        @state = @c @state, { type: 'resource_some_wrong_name', verb: 'error', payload: 'some error' }
        expect @state.state
        .to.equal 'loading'

      specify 'error', ->    
        @state = @c @state, { type: 'resource_somename', verb: 'error', payload: 'some error' }
        expect @state.state
        .to.equal 'error'

        expect @state.error
        .to.equal 'some error'

    tailCollection = ->
      before ->
        if not @c then @c = reducers.TailCollection limit: 3, name: 'somename'

      Resource()

      specify 'init', ->
        @state = state = @c void, { whatever: "whatever" }

        expect state
        .to.be.an.instanceOf Object

        expect state.state
        .to.equal 'empty'

      specify 'create', ->
        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 1, something: 'else' } }

        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"1":{"id":1,"something":"else"}}}'

      specify 'limit', ->

        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 2, something: 'else2' } }
        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 3, something: 'else3' } }
        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 4, something: 'else4' } }
        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 5, something: 'else5' } }
        @state = @c @state, { type: 'resource_somename', verb: 'create', payload: { id: 6, something: 'else6' } }

        expect JSON.stringify @state.data
        .to.equal '{"4":{"id":4,"something":"else4"},"5":{"id":5,"something":"else5"},"6":{"id":6,"something":"else6"}}'

    
    describe 'remoteResource', -> Resource()

    describe 'TailCollection', -> tailCollection()

    describe 'Collection', ->
      before ->
        if not @c then @c = reducers.Collection limit: 3, name: 'somename'

      tailCollection()

      specify 'remove', ->
        @state = @c @state, { type: 'resource_somename', verb: 'remove', payload: { id: 5 }}
        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"4":{"id":4,"something":"else4"},"6":{"id":6,"something":"else6"}}}'

      specify 'update', ->
        @state = @c @state, { type: 'resource_somename', verb: 'update', payload: { id: 5, something: 'elseUpdate', newAttr: 3 }}
        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"4":{"id":4,"something":"else4"},"5":{"id":5,"something":"elseUpdate","newAttr":3},"6":{"id":6,"something":"else6"}}}'



describe 'reduxIntegration', ->

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

    @actions = reduxMeta.actions.Collection opts <<< store: @store

  describe 'Collection', -> 
    specify 'loading', -> new p (resolve,reject) ~> 

      expect @store.getState()
      .to.deep.equal {"testmodel":{"state":"empty"}}

      @store.dispatch @actions.loading!

      expect @store.getState()
      .to.deep.equal {"testmodel":{"state":"loading"}}

      resolve true

    specify 'create', -> new p (resolve,reject) ~> 

      expect @store.getState()
      .to.deep.equal {"testmodel":{"state":"loading"}}

      @store.dispatch @actions.create id: 3, lala: 213

      expect JSON.stringify(@store.getState())
      .to.equal '{"testmodel":{"state":"data","data":{"3":{"id":3,"lala":213}}}}'

      resolve true

    specify 'createMore', -> new p (resolve,reject) ~> 

      @store.dispatch @actions.create id: 1, lala: 14
      @store.dispatch @actions.create id: 2, lala: 99

      expect JSON.stringify @store.getState()
      .to.equal '{"testmodel":{"state":"data","data":{"1":{"id":1,"lala":14},"2":{"id":2,"lala":99},"3":{"id":3,"lala":213}}}}'
      resolve true


    specify 'remove', -> new p (resolve,reject) ~> 

      @store.dispatch @actions.remove id: 2

      expect JSON.stringify @store.getState()
      .to.equal '{"testmodel":{"state":"data","data":{"1":{"id":1,"lala":14},"3":{"id":3,"lala":213}}}}'

      resolve true

    specify 'update', -> new p (resolve,reject) ~> 

      @store.dispatch @actions.update id: 1, newattr: 'hello'
      @store.dispatch @actions.update id: 3, lala: 1

      expect JSON.stringify @store.getState()
      .to.equal '{"testmodel":{"state":"data","data":{"1":{"id":1,"lala":14,"newattr":"hello"},"3":{"id":3,"lala":1}}}}'

      resolve true
