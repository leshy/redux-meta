(function(){
  var ref$, defaultsDeep, map, mapValues, each, reduce, i, immutable, maybeNext, Resource, OrderedMap, TailCollection, Collection, SeedCollection, SortedSeedCollection, out$ = typeof exports != 'undefined' && exports || this;
  ref$ = require('leshdash'), defaultsDeep = ref$.defaultsDeep, map = ref$.map, mapValues = ref$.mapValues, each = ref$.each, reduce = ref$.reduce;
  i = require('immutable'), immutable = i.fromJS;
  maybeNext = function(f){
    return function(options, next){
      return f(options, function(state, action){
        if (next) {
          return next(state, action);
        } else {
          return state;
        }
      });
    };
  };
  out$.Resource = Resource = maybeNext(function(options, next){
    var name;
    options == null && (options = {});
    name = options.name;
    return function(state, action){
      if (!state) {
        action = {
          verb: 'init'
        };
      } else if (action.type !== "resource_" + name) {
        return state;
      }
      switch (action.verb) {
      case "init":
        return next({
          state: 'empty'
        }, action);
      case "empty":
        return {
          state: 'empty'
        };
      case "loading":
        return import$({
          state: 'loading'
        }, state.data ? {
          data: state.data
        } : void 8);
      case "error":
        return {
          state: 'error',
          data: state != null ? state.data : void 8,
          error: action.payload
        };
      default:
        return next(state, action);
      }
    };
  });
  out$.OrderedMap = OrderedMap = maybeNext(function(options, next){
    options == null && (options = {});
    return Resource(options, function(state, action){
      switch (action.verb) {
      case "init":
        return next({
          state: 'empty'
        }, action);
      default:
        return next(state, action);
      }
    });
  });
  out$.TailCollection = TailCollection = maybeNext(function(options, next){
    var limit;
    options == null && (options = {});
    limit = defaultsDeep(options, {
      limit: Infinity
    }).limit;
    return OrderedMap(options, function(state, action){
      var data, payload, id;
      switch (action.verb) {
      case 'create':
        data = state.data;
        payload = action.payload;
        (id = payload.id, payload) || new Date().getTime();
        if (!data) {
          data = i.OrderedMap();
        }
        data = data.set(id, immutable(payload));
        return next({
          state: 'data',
          data: data.size <= limit
            ? data
            : data.slice(limit - data.size)
        }, action);
      default:
        return next(state, action);
      }
    });
  });
  out$.Collection = Collection = maybeNext(function(options, next){
    options == null && (options = {});
    return TailCollection(options, function(state, action){
      var id, data, payload;
      switch (action.verb) {
      case 'remove':
        id = action.payload.id;
        data = state.data.remove(id);
        if (data.size) {
          return next({
            state: 'data',
            data: data
          }, action);
        } else {
          return next({
            state: 'empty'
          }, action);
        }
        break;
      case 'replace':
        if (action.payload.length === 0) {
          return next({
            state: 'empty'
          }, action);
        } else {
          data = reduce(action.payload, function(data, model){
            var id;
            id = model.id;
            return data.set(id, immutable(model));
          }, i.OrderedMap());
          return next({
            state: 'data',
            data: data
          }, action);
        }
        break;
      case 'update':
        data = state.data;
        payload = action.payload;
        id = payload.id;
        console.log(options.name + " MERGING IN DATA", payload, "TO", id);
        return next({
          state: 'data',
          data: data.mergeIn([id], payload)
        }, action);
      default:
        return next(state, action);
      }
    });
  });
  out$.SeedCollection = SeedCollection = maybeNext(function(options, next){
    options == null && (options = {});
    return Collection(options, function(state, action){
      var seed;
      seed = options.seed;
      switch (action.verb) {
      case 'init':
        if (seed) {
          return next({
            state: 'data',
            data: seed
          }, action);
        } else {
          return next(state, action);
        }
        break;
      default:
        return next(state, action);
      }
    });
  });
  out$.SortedSeedCollection = SortedSeedCollection = maybeNext(function(options, next){
    options == null && (options = {});
    return SeedCollection(options, function(state, action){
      var sort, ref$, ref1$, ref2$;
      sort = function(arg$){
        var sortBy, sortOrder, data, comparator;
        sortBy = arg$.sortBy, sortOrder = arg$.sortOrder, data = arg$.data;
        if (!sortBy) {
          sortBy = options.sortBy;
        }
        if (sortBy && !sortOrder) {
          sortOrder = options.sortOrder || 1;
        }
        comparator = function(x, y){
          x = x.get(sortBy);
          y = y.get(sortBy);
          if (x === y) {
            return 0;
          }
          if (x < y) {
            return sortOrder;
          } else {
            return sortOrder * -1;
          }
        };
        if (state.data.size) {
          return {
            state: 'data',
            data: sortBy ? data.sort(comparator) : data,
            sortOrder: sortOrder,
            sortBy: sortBy
          };
        } else {
          return {
            state: 'empty',
            sortOrder: sortOrder,
            sortBy: sortBy
          };
        }
      };
      switch (action.verb) {
      case 'init':
        return sort(state);
      case 'create':
        return sort(state);
      case 'update':
        return sort(state);
      case 'remove':
        return sort(state);
      case 'sort':
        return sort((ref1$ = {
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        }, ref1$.sortBy = (ref$ = action.payload).sortBy, ref1$.sortOrder = (ref2$ = ref$.sortOrder) != null ? ref2$ : 1, ref1$));
      default:
        return next(state, action);
      }
    });
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
