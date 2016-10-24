require! {
  leshdash: { defaultsDeep }
  immutable: { fromJS: immutable }: i
}

export Resource = (options={}, next) ->
  { name } = options
  (state, action) ->
    
    if action.type not in [ '@@INIT', "resource_#{ name }" ] then return state
    if action.type is '@@INIT' then
      state = { state: 'empty' }
      
    switch action.verb
      | "empty" => { state: 'empty' }
      | "loading" => { state: 'loading', data: state?data }
      | "error" => { state: 'error', data: state?data, error: action.payload }
      | _ => if next then next(state, action) else state
        
export OrderedMap = (options={}, next) ->
  Resource options, (state, action) ->
    switch action.type
      | "@@INIT" => state: 'empty', data: i.OrderedMap()
      | _ => if next then next(state, action) else state
      
export TailCollection = (options={}, next) ->
  { limit } = defaultsDeep options, { limit: Infinity }
  
  OrderedMap options, (state,action) ->
    switch action.verb
      | 'create' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        data = data.set id, immutable payload
        
        do
          state: 'data'
          data: if data.size <= limit then data else data.slice limit - data.size
          
      | _ => if next then next(state, action) else state
    
export Collection = (options={}, next) ->
  TailCollection options, (state, action) ->
    switch action.verb
      | 'remove' =>
        { id } = action.payload
        { state: 'data', data: state.data.remove id }
        
      | 'update' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        do
          state: 'data'
          data: data.mergeIn [id], payload
          
      | _ => if next then next(state, action) else state

