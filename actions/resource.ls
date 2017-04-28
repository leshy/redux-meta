#autocompile
require! {
  moment
  leshdash: { cbc, each, wait, union, assign, omit, map, curry, times, keys, cloneDeep, defaultsDeep, mapValues, pick, omit }
  path
}

SimpleAction = ({ name }, data, payload) -->
  { type: "resource_#{ name }" } <<< data <<< (if payload then payload: payload else {})

export Resource = (options) ->
  sa = SimpleAction options
  
  do
    empty: sa verb: 'empty'
    loading: sa verb: 'loading'
    error: sa verb: 'error'

export TailCollection = (options) ->
  Resource(options) <<< do
    create: SimpleAction options, verb: 'create'

export Collection = (options) ->
  sa = SimpleAction options
  
  TailCollection(options) <<< do
    sort: sa verb: 'sort'
    remove: sa verb: 'remove'
    replace: sa verb: 'replace'
    update: sa verb: 'update'
      
export SailsCollection = (options) ->
  sa = SimpleAction options

  # we convert createdAt and updatedAt into moment instances  
  parseDates = (data) ->
    data
      |> -> it{ createdAt, updatedAt }
      |> mapValues _, (-> moment it)
      |> -> data <<< it

  # used by all the endpoints making API calls
  # checks if we got an error response and dispatches an error action if needed
  checkErr = (dispatch, jwRes, expectedCode=200) ->
    if jwRes.statusCode is expectedCode then return false
    dispatch actions.error (statusCode: jwRes.statusCode) <<< jwRes.error
    return true
  
  { sub, name, io, pathPrefix } = defaultsDeep options, { sub: true, pathPrefix: '/' }
  
  io.socket.on name, (event) ->
    
    switch event.verb
      | "updated" =>
        console.log "UPDATED",event
        store.dispatch actions.update payload: (event.data <<< id: event.id)
        
      | "created" =>
        console.log "CREATED",event
        
        store.dispatch actions.create payload: event.data
      | otherwise => console.error "received an unknown collection event", event
  
  actions = Collection(options) <<< do
  
    remoteCreate: (payload, callback) ->
      (dispatch) -> 
        dispatch actions.loading!
        
        io.socket.post path.join(pathPrefix, "/#{name}"), payload, (resData, jwRes) ->
          if checkErr dispatch, jwRes, 201 then cbc(callback,jwRes); return jwRes
          dispatch actions.create parseDates jwRes.body
          cbc callback, void, jwRes

    remoteUpdate: (payload) ->
      (dispatch) -> 
        dispatch actions.loading!
        
        io.socket.put path.join(pathPrefix, "/#{name}/#{payload.id}"), omit(payload, 'id'), (resData, jwRes) ->
          if checkErr dispatch, jwRes then return
          dispatch actions.update parseDates jwRes.body
                  
    remoteRemove: ({ id }) ->
      (dispatch) ->
        dispatch actions.loading!
        
        io.socket.delete path.join(pathPrefix, "/#{name}/#{id}"), (resData, jwRes) ->
          if checkErr dispatch, jwRes then return
          dispatch actions.remove id: id
          
    get: (filter) ->
      (dispatch) -> 
        dispatch actions.loading!
        
        query = "/#{name}?sort=createdAt DESC"
        if filter then query = "#{query}&where=#{JSON.stringify(filter)}"

        query = path.join(pathPrefix, query)

        io.socket.get query, (resData, jwRes) ->
          if checkErr dispatch, jwRes then return
          dispatch actions.replace map jwRes.body, parseDates

