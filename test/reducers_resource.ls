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

describe 'reducers', -> 
  describe 'meta', ->
    
    Resource = ->
      before ->
        if not @c then @c = reducers.Resource name: 'somename'

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
        @state = state = @c void, { type: "@@INIT" }

        expect state
        .to.be.an.instanceOf Object

        expect state.state
        .to.equal 'empty'

        expect state.data
        .to.be.instanceOf OrderedMap

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



describe 'storeIntegration', ->
  specify 'create', ->
    require! {
      redux
      'redux-thunk'
    }

    opts = do
      name: 'testmodel'
      io: @io
      
    reducer = reduxMeta.reducers.Collection opts

    store = redux.createStore do
      redux.combineReducers testmodel: reducer
      {}
      redux.applyMiddleware(reduxThunk.default)

    actions = reduxMeta.actions.Collection opts <<< store: store
      
    console.log state: store.getState()
    console.log actions: keys actions

    l.log 'dispatch create action'
    
    store.dispatch actions.create id: 3, lala: 213
    
    wait 1000, -> 
      console.log state: store.getState()
      resolve true
      

    
