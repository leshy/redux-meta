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
    io.sails.url = 'http://localhost:31313'
    resolve!


  before -> new p (resolve,reject) ~>
    l.log 'initializing redux'
    resolve true


  specify 'init', ->
    { actions, reducers } = reduxMeta.define reduxMeta.reducers.Collection, reduxMeta.actions.SailsCollection, do
      name: 'testmodel'
      io: @io

    console.log actions: keys actions
    console.log reducers: reducers

    
