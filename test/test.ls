require! {
  util
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head }
  bluebird: p
  immutable: { OrderedMap }:i
}

require! {
  '../index.ls': { reducers, actions, define }: reduxMeta
}

describe 'reduxMeta', ->
  specify 'init', ->
    console.log reduxMeta.define reducers.resource.Collection, actions.resource.Collection, do
      name: 'property'
