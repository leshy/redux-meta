require! {
  leshdash: { defaultsDeep, push, pop, assign, pick, mapKeys, mapValues, assign, omit, map, curry, times, tail, reduce }
}

export actions = require './actions'
export reducers = require './reducers'

export define = (metaReducer, metaAction, options) ->
  do
    actions: metaAction options
    reducers: metaReducer options

