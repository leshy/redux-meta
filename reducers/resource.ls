require! {
  immutable: { OrderedMap, fromJS: immutable }: i
  leshdash: { defaultsDeep, push, pop, assign, pick, mapKeys, mapValues, assign, omit, map, curry, times, tail }
}

{ type: 'resource_properties', verb: 'empty' }
{ type: 'resource_properties', verb: 'add', data: { id: 124124, sadg: 3 } }
{ type: 'resource_properties', verb: 'update', data: { id: 124124, sadg: 1 } }
{ type: 'resource_properties', verb: 'del', data: 124124 }

#
# properties: defineResource 'properties', Collection()
# 

export defineResource = (name, reducer) ->
  (state, action) ->
    if action.type isnt "resource_#{ name }" and action.type isnt '@@INIT' then state
    else reducer state, action

export RemoteResource = ->
  (state, action) ->
    if action.type is '@@INIT' then return state: 'empty'
    switch action.verb
      | "loading" => { state: 'loading', data: state?data }
      | "error" => { state: 'error', data: state?data, error: action.payload }
      | otherwise => state
        
export OrderedCollection = (options={}) ->
  remoteResource = RemoteResource options
  
  (state, action) ->
    state = remoteResource ... 
    switch action.type
      | "@@INIT" => state: 'empty', data: OrderedMap()
      | otherwise => state
      
export TailCollection = (options={}) ->
  { limit } = defaultsDeep options, { limit: Infinity }
  
  orderedCollection = OrderedCollection()
  
  (state,action) ->
    state = orderedCollection ...
    
    switch action.verb
      | 'push' =>
        { data } = state
        { payload } = action
        { id } = payload
        
        data = data.set id, immutable payload
        
        do
          state: 'data'
          data: if data.size <= limit then data else data.slice limit - data.size
          
      | otherwise => state
    
export Collection = (options={}) ->
  tailCollection = TailCollection options
  
  (state, action) ->
    state = tailCollection ...
    
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
          
      | otherwise => state


