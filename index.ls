require! {
  './actions'
  './reducers'
}

export define = ->
  do
    actions: actions.define ...
    reducers: reducers.define ...


