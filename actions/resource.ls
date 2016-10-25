require! {
  moment
  leshdash: { each, wait, union, assign, omit, map, curry, times, keys, cloneDeep, defaultsDeep, mapValues, pick, omit }
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
    remove: sa verb: 'remove'
    update: sa verb: 'update'

class Rest
  remove: (name, id) -> new p (resolve,reject) ~> resolve true
  create: (name, id) -> new p (resolve,reject) ~> resolve true
  update: (name, id,data) -> new p (resolve,reject) ~> resolve true
  find: (name, filter) -> new p (resolve,reject) ~> resolve true
  findOne: (name, filter) -> new p (resolve,reject) ~> resolve true

class SailsRest extends Rest
  ({ @io }) -> true
  remove: (name, id) -> @io.socket.delete 
  create: (name, id) -> new p (resolve,reject) ~> resolve true
  update: (name, id,data) -> new p (resolve,reject) ~> resolve true
  find: (name, filter) -> new p (resolve,reject) ~> resolve true
  findOne: (name, filter) -> new p (resolve,reject) ~> resolve true


      
export SailsCollection = (options) ->
  sa = SimpleAction options
  
  parseDates = (data) ->
    data
      |> -> it{ createdAt, updatedAt }
      |> mapValues _, (-> moment it)
      |> -> data <<< it
    

  checkErr = (dispatch, jwRes, expectedCode=200) ->
    if jwRes.statusCode is expectedCode then return false
    dispatch actions.error (statusCode: jwRes.statusCode) <<< jwRes.error
    return true
  
  { sub, name, io } = defaultsDeep options, { sub: true }
  io.socket.on name, (event) ->
    switch event.verb
      | "updated" => store.dispatch actions.update payload: (event.data <<< id: event.id)
      | "created" => store.dispatch actions.push  payload: event.data
      | otherwise => console.error "received an unknown collection event", event
  
  actions = Collection(options) <<< do
    remoteCreate: (payload) ->
      (dispatch) -> 
        io.socket.post "/#{name}", payload, (resData, jwRes) ->
          if checkErr dispatch, jwRes, 201 then return
          dispatch actions.create parseDates jwRes.body
        
        dispatch actions.loading!

    remoteUpdate: (payload) ->
      (dispatch) -> 
        io.socket.put "/#{name}/#{payload.id}", omit(payload, 'id'), (resData, jwRes) ->
          if checkErr dispatch, jwRes then return
          dispatch actions.update parseDates jwRes.body
        
        dispatch actions.loading!
                  
    remoteRemove: ({ id }) ->
      (dispatch) -> 
        io.socket.delete "/#{name}/#{id}", (resData, jwRes) ->
          if checkErr dispatch, jwRes then return
          dispatch actions.remove id: id
          
        dispatch actions.loading!
      
    remoteGet: (filter) ->
      query = "/#{name}?sort=createdAt DESC"
      if filter then query = "#{query}&where=JSON.stringify(filter)"
        
      actions.loading!
      io.socket.get query
      .then -> each it, actions.push
      .catch -> actions.error it
        
      
      
