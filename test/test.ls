require! {
  util
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }:i
}

require! {
  '../reducers/resource': resource
}

describe 'reducers', -> 
  describe 'meta', ->
    
    { defineResource } = resource
  
    remoteResource = ->
      before ->
        if not @c then @c = defineResource 'somename', resource.RemoteResource()

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
        if not @c then @c = defineResource 'somename', resource.TailCollection limit: 3

      remoteResource()

      specify 'init', ->
        @state = state = @c void, { type: "@@INIT" }

        expect state
        .to.be.an.instanceOf(Object)

        expect state.state
        .to.equal 'empty'

        expect state.data
        .to.be.instanceOf OrderedMap

      specify 'push', ->
        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 1, something: 'else' } }

        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"1":{"id":1,"something":"else"}}}'

      specify 'limit', ->

        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 2, something: 'else2' } }
        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 3, something: 'else3' } }
        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 4, something: 'else4' } }
        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 5, something: 'else5' } }
        @state = @c @state, { type: 'resource_somename', verb: 'push', payload: { id: 6, something: 'else6' } }

        expect JSON.stringify @state.data
        .to.equal '{"4":{"id":4,"something":"else4"},"5":{"id":5,"something":"else5"},"6":{"id":6,"something":"else6"}}'

    
    describe 'remoteResource', -> remoteResource()

    describe 'TailCollection', -> tailCollection()

    describe 'Collection', ->
      before ->
        if not @c then @c = defineResource 'somename', resource.Collection limit: 3

      tailCollection()

      specify 'del', ->
        @state = @c @state, { type: 'resource_somename', verb: 'del', payload: { id: 5 }}
        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"4":{"id":4,"something":"else4"},"6":{"id":6,"something":"else6"}}}'

      specify 'update', ->
        @state = @c @state, { type: 'resource_somename', verb: 'update', payload: { id: 5, something: 'elseUpdate', newAttr: 3 }}
        expect JSON.stringify @state
        .to.equal '{"state":"data","data":{"4":{"id":4,"something":"else4"},"5":{"id":5,"something":"elseUpdate","newAttr":3},"6":{"id":6,"something":"else6"}}}'




