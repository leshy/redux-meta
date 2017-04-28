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

      | 'replace' =>
        if action.payload.length is 0 then { state: 'empty' }
        else

          data = reduce do
            action.payload
            (data, {id}:model) -> data.set id, immutable model
            i.OrderedMap()

          do
            state: 'data'
            data: data
      
      | 'update' =>
        { data } = state
        { payload } = action
        { id } = payload

        console.log "#{options.name} MERGING IN DATA", payload, "TO", id
        do
          state: 'data'
          data: data.mergeIn [id], payload
          
      | _ => next state, action

export SortedCollection = maybeNext (options={}, next) ->
  Collection options, (state, action) ->
    switch action.verb
      | 'sort' =>
        console.log "SORT ACTION",action
        { sortBy, order } = sort = action.payload{ sortBy, order=1 }
        console.log "SORT", sort

        comparator = (x,y) ->
          x = x.get(sortBy)
          y = y.get(sortBy)
          
          console.log 'comparing',x,y
          if x is y then return 0
          if x < y then order else order * -1

        if state.data.size then { state: 'data', data: state.data.sort(comparator), sort: sort }
        else { state: 'empty', sort: sort } 
        
      | _ => next state, action


export SeedCollection = maybeNext (options={}, next) ->
  SortedCollection options, (state, action) ->
    { seed } = options
    
    switch action.verb
      | 'init' =>
        if seed then next { state: 'data', data: seed, sort: { sortBy: 'createdAt', order: 1 } }
        else next state, action
        
      | _ => next state, action

      
  
