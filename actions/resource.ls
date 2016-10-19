
export define = (name, reducer) ->
  (state, action) ->
    if action.type isnt "resource_#{ name }" and action.type isnt '@@INIT' then state
    else reducer state, action
