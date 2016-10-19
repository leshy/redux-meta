require! {
  util
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }:i
}

require! {
  '../index.ls': { define }: reduxMeta
}

describe 'basic', ->
  describe 'sketch', ->
    specify 'init', ->
      console.log 'init'
#      { actions, reducers } = define reduxMeta.Collection name: 'property'
