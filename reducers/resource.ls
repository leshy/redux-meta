#autocompile

require! {
  leshdash: { defaultsDeep, map, mapValues, each, reduce }
  immutable: { fromJS: immutable }: i
}

maybeNext = (f) ->
  (options, next) -> f options, (state, action) -> if next then next(state,action) else state

export Resource = maybeNext (options={}, next) ->
  { name } = options
  ( state, action ) ->

    if not state then action = { verb: 'init' }
    else if action.type isnt "resource_#{ name }" then return state
      
    switch action.verb
      | "init" => next { state: 'empty' }, action
      | "empty" => { state: 'empty' }
      | "loading" => { state: 'loading' } <<< (if state.data then data: state.data)
      | "error" => { state: 'error', data: state?data, error: action.payload }
      | _ => next state, action
        
export OrderedMap = maybeNext (options={}, next) ->
  Resource options, (state, action) ->
    switch action.verb
      | "init" => next { state: 'empty' }, action
      | _ => next state, action
      
export TailCollection = maybeNext (options={}, next) ->
  { limit } = defaultsDeep options, { limit: Infinity }
  
  OrderedMap options, (state, action) ->
    switch action.verb
      | 'create' =>
        { data } = state
        { payload } = action
        ({ id } = payload) or new Date!getTime!

        if not data then data = i.OrderedMap()
        data = data.set id, immutable payload
        
        next { state: 'data', data: if data.size <= limit then data else data.slice limit - data.size }, action
          
      | _ => next state, action

                        
export Collection = maybeNext (options={}, next) ->
  TailCollection options, (state, action) ->
    switch action.verb
      | 'remove' =>
        { id } = action.payload
        data = state.data.remove id
        
        if data.size then next { state: 'data', data: data  }, action
        else next { state: 'empty' }, action

      | 'replace' =>
        if action.payload.length is 0 then next { state: 'empty' }, action
        else

          data = reduce do
            action.payload
            (data, {id}:model) -> data.set id, immutable model
            i.OrderedMap()

          next { state: 'data', data: data }, action
      
      | 'update' =>
        { data } = state
        { payload } = action
        { id } = payload

        console.log "#{options.name} MERGING IN DATA", payload, "TO", id
        next { state: 'data' data: data.mergeIn [id], payload }, action
          
      | _ => next state, action

export SeedCollection = maybeNext (options={}, next) ->
  Collection options, (state, action) ->
    { seed } = options
    
    switch action.verb
      | 'init' =>
        if seed then next { state: 'data', data: seed }, action
        else next state, action
        
      | _ => next state, action
  

export SortedSeedCollection = maybeNext (options={}, next) ->
  SeedCollection options, (state, action) ->
    
    sort = ({ sortBy, sortOrder, data }) ->
      if not sortBy then sortBy = options.sortBy
      if sortBy and not sortOrder then sortOrder = options.sortOrder or 1

      comparator = (x,y) ->
        x = x.get sortBy
        y = y.get sortBy
        if x is y then return 0
        if x < y then sortOrder else sortOrder * -1

      if state.data.size then { state: 'data', data: (if sortBy then data.sort(comparator) else data) } <<< { sortOrder, sortBy }
      else { state: 'empty' } <<< { sortOrder, sortBy }
      
    switch action.verb
      | 'init'   => sort state
      | 'create' => sort state
      | 'update' => sort state
      | 'remove' => sort state
      | 'sort'   => sort state{ sortBy, sortOrder } <<< action.payload{ sortBy, sortOrder=1 }
      | _ => next state, action


