# redux-meta

helpers for automatic construction of state reducers and actions
used for big repetetive stuff like different tyoes of remote resources

## sails blueprint api actions and reducers

creates a substate named as the model
offers actions to remoteCreate remoteUpdate and remoteRemove

check test/sails.ls for more,
quick snippet:

```livescript
require! {
  redux
  'redux-thunk'
}
io = require('sails.io.js')( require('socket.io-client')

testmodel1 = reduxMeta.define do
  reduxMeta.reducers.Collection # defines which reducer to use (what kind of data do we expect)
  reduxMeta.actions.SailsCollection # defines concrete async actions on this collection (actual websocket interface to sails)
  name: 'testmodel1'
  io: io


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

expect JSON.stringify @store.getState()
.to.equal '{"testmodel":{"state":"loading"}}'

store.subscribe ->
  state = store.getState().testmodel1

  expect state.state
  .to.equal 'data'

  expect JSON.stringify (state.data.get 1).filter (value,key) -> key not in <[ createdAt updatedAt ]>
  .to.equal '{"name":"model1","size":"33","id":1}'

```


