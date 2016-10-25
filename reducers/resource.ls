require! {
  leshdash: { defaultsDeep }
  immutable: { fromJS: immutable }: i
}


maybeNext = (f) ->
  (options, next) -> f options, (state, action) -> if next then next(state,action) else state

export Resource = maybeNext (options={}, next) ->
  { name } = options
  (state, action) ->

    if not state then action = { verb: 'init' }
    else if action.type isnt "resource_#{ name }" then return state
      
    switch action.verb
      | "init" => next { state: 'empty' }, action
      | "empty" => { state: 'empty' }
      | "loading" => { state: 'loading', data: state?data }
      | "error" => { state: 'error', data: state?data, error: action.payload }
      | _ => next state, action
        
export OrderedMap = maybeNext (options={}, next) ->
  Resource options, (state, action) ->
    switch action.verb
      | "init" => next { state: 'empty' }, action
      | _ => if next then next(state, action) else state
      
export TailCollection = maybeNext (options={}, next) ->
  { limit } = defaultsDeep options, { limit: Infinity }
  
  OrderedMap options, (state,action) ->
    switch action.verb
      | 'create' =>
        { data } = state
        { payload } = action
        { id } = payload

        if not data then data = i.OrderedMap()
        data = data.set id, immutable payload
        
        do
          state: 'data'
          data: if data.size <= limit then data else data.slice limit - data.size
          
      | _ => if next then next(state, action) else state
    
export Collection = maybeNext (options={}, next) ->
  TailCollection options, (state, action) ->
    switch action.verb
      | 'remove' =>
        { id } = action.payload
        data = state.data.remove id
        
        if data.size then { state: 'data', data: data  }
        else { state: 'empty' }
        
      | 'update' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        do
          state: 'data'
          data: data.mergeIn [id], payload
          
      | _ => if next then next(state, action) else state

