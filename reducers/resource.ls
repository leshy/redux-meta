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
      | "loading" => { state: 'loading', data: state?data }
      | "error" => { state: 'error', data: state?data, error: action.payload }
      | otherwise => if next then next(state, action) else state
        
export OrderedMap = (options={}, next) ->
  Resource options, (state, action) ->
    switch action.type
      | "@@INIT" => state: 'empty', data: i.OrderedMap()
      | otherwise => if next then next(state, action) else state
      
export TailCollection = (options={}, next) ->
  { limit } = defaultsDeep options, { limit: Infinity }
  
  OrderedMap options, (state,action) ->
    switch action.verb
      | 'push' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        data = data.set id, immutable payload
        
        do
          state: 'data'
          data: if data.size <= limit then data else data.slice limit - data.size
          
      | otherwise => if next then next(state, action) else state
    
export Collection = (options={}, next) ->
  TailCollection options, (state, action) ->
    switch action.verb
      | 'del' =>
        { id } = action.payload
        { state: 'data', data: state.data.remove id }
        
      | 'update' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        do
          state: 'data'
          data: data.mergeIn [id], payload
          
      | otherwise => if next then next(state, action) else state


