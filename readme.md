# redux-meta

helpers for automatic construction of state reducers and actions
used for big repetetive stuff like different tyoes of remote resources

## sails.js blueprint api actions and reducers

creates a substate named as the model, offers actions to remoteCreate remoteUpdate and remoteRemove, automatically subscribes to remote changes via sails blueprint api

stores data as immutable.js instances

check test/sails.ls for more, but here is a quick snippet:

```livescript
require! {
  redux
  'redux-thunk'
}
io = require('sails.io.js')( require('socket.io-client')

# will return
# { 
#  actions: { update, create, remoteUpdate, remoteCreate etc... } 
#  reducers: testmodel1: [ Function ]
# }
#
# you'll probably want to use remote actions only, they trigger local ones once the data changes on the serverside

testmodel1 = reduxMeta.define do
  reduxMeta.reducers.Collection # defines which reducer to use (what kind of data do we expect)
  reduxMeta.actions.SailsCollection # defines concrete async actions on this collection (actual websocket interface to sails)
  name: 'testmodel1' # makes this concrete by specifying which model we work on
  io: io # and which connection


testmodel2 = reduxMeta.define do
  reduxMeta.reducers.Collection
  reduxMeta.actions.SailsCollection
  name: 'testmodel2'
  io: io

store = redux.createStore do
  redux.combineReducers { ...testnodel1.reducers, ...testmodel2.reducers }
  {}
  redux.applyMiddleware reduxThunk.default

store.dispatch testmodel1.remoteCreate name: 'model1', size: 33

expect @store.getState()
.to.deep.equal {"testmodel1":{"state":"loading"},"testmodel2":{"state":"empty"}}

store.subscribe ->
  # after create my store looks something like:
  # (store testmodel1 data attribute is an immutable.js OrderedMap
  # actual model data under the key is immutable.js Map
  #
  # {
  #   testmodel1: { state: 'data', 
  #                 data: { 1: { name: 'model1', id: 1, size: 33 } }},
  #   testmodel2: { state: 'empty'}
  #  } 
  state = store.getState().testmodel1

  expect state.state
  .to.equal 'data'
  
  expect JSON.stringify (state.data.get 1).filter (value,key) -> key not in <[ createdAt updatedAt ]>
  .to.equal '{"name":"model1","size":"33","id":1}'

```


