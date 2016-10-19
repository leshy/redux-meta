require! {
  util
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }:i
}

require! {
  '../reducers/resource.ls'
}

describe 'basic', ->
  describe 'sketch', ->
    specify 'init', ->
      true
