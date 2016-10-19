require! {
  leshdash: { defaultsDeep, push, pop, assign, pick, mapKeys, mapValues, assign, omit, map, curry, times, tail, reduce }
  
  './actions'
  './reducers'
}

export reduce do
  reducers
  
  (res, reducer, name) ->
    if not action = actions[ name ] then return res
    res[ name ] = ->
      reducers: reducer ...
      actions: action ...
      
  {}

  
export define = ->
  do
    actions: actions.define ...
    reducers: reducers.define ...


