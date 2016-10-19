
SimpleAction = ({ name }, data, payload) -->
  (payload) -> { type: "resource_#{ name }" } <<< data <<< (if payload then payload: payload else {})

export Resource = (options) ->
  sa = SimpleAction options
  
  do
    empty: sa verb: 'empty'
    loading: sa verb: 'loading'
    error: sa verb: 'error'

export TailCollection = (options) ->
  Resource(options) <<< do
    push: SimpleAction options, verb: 'push'

export Collection = (options) ->
  sa = SimpleAction options
  
  TailCollection(options) <<< do
    del: sa verb: 'del'
    update: sa verb: 'update'
                  
