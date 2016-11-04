(function(){
  var ref$, defaultsDeep, push, pop, assign, pick, mapKeys, mapValues, omit, map, curry, times, tail, reduce, actions, reducers, define, out$ = typeof exports != 'undefined' && exports || this;
  ref$ = require('leshdash'), defaultsDeep = ref$.defaultsDeep, push = ref$.push, pop = ref$.pop, assign = ref$.assign, pick = ref$.pick, mapKeys = ref$.mapKeys, mapValues = ref$.mapValues, assign = ref$.assign, omit = ref$.omit, map = ref$.map, curry = ref$.curry, times = ref$.times, tail = ref$.tail, reduce = ref$.reduce;
  out$.actions = actions = require('./actions');
  out$.reducers = reducers = require('./reducers');
  out$.define = define = function(metaReducer, metaAction, options){
    var ref$;
    return {
      actions: metaAction(options),
      reducers: (ref$ = {}, ref$[options.name + ""] = metaReducer(options), ref$)
    };
  };
}).call(this);
