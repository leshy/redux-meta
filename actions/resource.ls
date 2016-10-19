
SimpleAction = ({ name }, data, payload) -->
  ret = { type: "resource_#{ name }" } <<< data <<< (if payload then payload: payload else {})

export Resource = (options) ->
  sa = SimpleAction options
  
  do
    empty = -> sa verb: 'empty'
    loading = -> sa verb: 'loading'
    error = -> sa verb: 'error', it

export TailCollection = (options) ->
  Resource(options) <<< do
    push: -> SimpleAction options, verb: 'push', it

export Collection = (options) ->
  sa = SimpleAction options
  
  TailCollection(options) <<< do
    del: -> sa verb: 'del', it
    update: -> sa verb: 'update', it
                  
