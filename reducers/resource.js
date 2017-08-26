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
      var sort;
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
      state = (function(){
        var ref$, ref1$, ref2$;
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
          return state;
        }
      }());
      return next(state, action);
    });
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jbGllbnRzaWRlL25vZGVfbW9kdWxlcy9yZWR1eC1tZXRhL3JlZHVjZXJzL3Jlc291cmNlLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR0UsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxZQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxZQUFaLEVBQTBCLEdBQTFCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEIsR0FBMUIsRUFBK0IsU0FBL0IsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUErQixTQUEvQixFQUEwQyxJQUExQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTBDLElBQTFDLEVBQWdELE1BQWhELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZ0Q7RUFDaEQsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsRUFBcUIsU0FBckIsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFhO0VBR2YsU0FBVSxDQUFBLENBQUEsQ0FBRSxRQUFBLENBQUEsQ0FBQTtXQUNWLFFBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQTthQUFtQixFQUFFLFNBQVMsUUFBQSxDQUFBLEtBQUEsRUFBQSxNQUFBO1FBQW1CLElBQUcsSUFBSDtpQkFBYSxLQUFLLE9BQU0sTUFBUDtTQUFlO2lCQUFLOztPQUFqRTs7O2tCQUVoQixRQUFTLENBQUEsQ0FBQSxDQUFFLFVBQVUsUUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBOztJQUFDLG9CQUFBLFVBQVE7SUFDakMsSUFBTyxDQUFBLENBQUEsQ0FBRSxPQUFYLENBQUU7V0FDRixRQUFBLENBQUEsS0FBQSxFQUFBLE1BQUE7TUFFRSxJQUFHLENBQUksS0FBUDtRQUFrQixNQUFPLENBQUEsQ0FBQSxDQUFFO1VBQUUsTUFBTTtRQUFSO09BQzNCLE1BQUEsSUFBUSxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSyxXQUFBLENBQUEsQ0FBQSxDQUFhLElBQXRDO1FBQW1ELE1B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QixLQUFBLFFBQUE7QUFBQSxpQkFBWSxLQUFLLEtBQUQ7UUFDaEIsS0FBQSxRQUFBO0FBQUEsaUJBQVksS0FBSyxLQUFEO1FBQ2hCLEtBQUEsUUFBQTtBQUFBLGlCQUFZLEtBQUssS0FBRDtRQUNoQixLQUFBLE1BQUE7QUFBQSxpQkFBWSxjQUFVO1lBQUUsUUFBUCxNQUFPO1lBQVEsV0FBZixNQUFlO1VBQVYsU0FBMEMsaUJBQWhCLE1BQU0sQ0FBQyxTQUFTLGNBQVEsWUFBUyxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULFNBQVMsQ0FBQSxRQUFBLENBQUEsRUFBQSxLQUFBLENBQUMsRUFBQSxTQUFqRTs7aUJBQ1o7OzthQUVULEtBQUssT0FBTyxNQUFQO0tBdkJRO0dBRHVCIiwic291cmNlc0NvbnRlbnQiOlsiI2F1dG9jb21waWxlXG5cbnJlcXVpcmUhIHtcbiAgbGVzaGRhc2g6IHsgZGVmYXVsdHNEZWVwLCBtYXAsIG1hcFZhbHVlcywgZWFjaCwgcmVkdWNlIH1cbiAgaW1tdXRhYmxlOiB7IGZyb21KUzogaW1tdXRhYmxlIH06IGlcbn1cblxubWF5YmVOZXh0ID0gKGYpIC0+XG4gIChvcHRpb25zLCBuZXh0KSAtPiBmIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPiBpZiBuZXh0IHRoZW4gbmV4dChzdGF0ZSxhY3Rpb24pIGVsc2Ugc3RhdGVcblxuZXhwb3J0IFJlc291cmNlID0gbWF5YmVOZXh0IChvcHRpb25zPXt9LCBuZXh0KSAtPlxuICB7IG5hbWUgfSA9IG9wdGlvbnNcbiAgKCBzdGF0ZSwgYWN0aW9uICkgLT5cblxuICAgIGlmIG5vdCBzdGF0ZSB0aGVuIGFjdGlvbiA9IHsgdmVyYjogJ2luaXQnIH1cbiAgICBlbHNlIGlmIGFjdGlvbi50eXBlIGlzbnQgXCJyZXNvdXJjZV8jeyBuYW1lIH1cIiB0aGVuIHJldHVybiBzdGF0ZVxuICAgICAgXG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8IFwiaW5pdFwiID0+IG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cbiAgICAgIHwgXCJlbXB0eVwiID0+IHsgc3RhdGU6ICdlbXB0eScgfVxuICAgICAgfCBcImxvYWRpbmdcIiA9PiB7IHN0YXRlOiAnbG9hZGluZycgfSA8PDwgKGlmIHN0YXRlLmRhdGEgdGhlbiBkYXRhOiBzdGF0ZS5kYXRhKVxuICAgICAgfCBcImVycm9yXCIgPT4geyBzdGF0ZTogJ2Vycm9yJywgZGF0YTogc3RhdGU/ZGF0YSwgZXJyb3I6IGFjdGlvbi5wYXlsb2FkIH1cbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cbiAgICAgICAgXG5leHBvcnQgT3JkZXJlZE1hcCA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgUmVzb3VyY2Ugb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8IFwiaW5pdFwiID0+IG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cblxuXG5leHBvcnQgVGFpbENvbGxlY3Rpb24gPSBtYXliZU5leHQgKG9wdGlvbnM9e30sIG5leHQpIC0+XG4gIHsgbGltaXQgfSA9IGRlZmF1bHRzRGVlcCBvcHRpb25zLCB7IGxpbWl0OiBJbmZpbml0eSB9XG4gIFxuICBPcmRlcmVkTWFwIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPlxuICAgIHN3aXRjaCBhY3Rpb24udmVyYlxuICAgICAgfCAnY3JlYXRlJyA9PlxuICAgICAgICB7IGRhdGEgfSA9IHN0YXRlXG4gICAgICAgIHsgcGF5bG9hZCB9ID0gYWN0aW9uXG4gICAgICAgICh7IGlkIH0gPSBwYXlsb2FkKSBvciBuZXcgRGF0ZSFnZXRUaW1lIVxuXG4gICAgICAgIGlmIG5vdCBkYXRhIHRoZW4gZGF0YSA9IGkuT3JkZXJlZE1hcCgpXG4gICAgICAgIGRhdGEgPSBkYXRhLnNldCBpZCwgaW1tdXRhYmxlIHBheWxvYWRcbiAgICAgICAgXG4gICAgICAgIG5leHQgeyBzdGF0ZTogJ2RhdGEnLCBkYXRhOiBpZiBkYXRhLnNpemUgPD0gbGltaXQgdGhlbiBkYXRhIGVsc2UgZGF0YS5zbGljZSBsaW1pdCAtIGRhdGEuc2l6ZSB9LCBhY3Rpb25cbiAgICAgICAgICBcbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cblxuICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgQ29sbGVjdGlvbiA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgVGFpbENvbGxlY3Rpb24gb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8ICdyZW1vdmUnID0+XG4gICAgICAgIHsgaWQgfSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICAgIGRhdGEgPSBzdGF0ZS5kYXRhLnJlbW92ZSBpZFxuICAgICAgICBcbiAgICAgICAgaWYgZGF0YS5zaXplIHRoZW4gbmV4dCB7IHN0YXRlOiAnZGF0YScsIGRhdGE6IGRhdGEgIH0sIGFjdGlvblxuICAgICAgICBlbHNlIG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cblxuICAgICAgfCAncmVwbGFjZScgPT5cbiAgICAgICAgaWYgYWN0aW9uLnBheWxvYWQubGVuZ3RoIGlzIDAgdGhlbiBuZXh0IHsgc3RhdGU6ICdlbXB0eScgfSwgYWN0aW9uXG4gICAgICAgIGVsc2VcblxuICAgICAgICAgIGRhdGEgPSByZWR1Y2UgZG9cbiAgICAgICAgICAgIGFjdGlvbi5wYXlsb2FkXG4gICAgICAgICAgICAoZGF0YSwge2lkfTptb2RlbCkgLT4gZGF0YS5zZXQgaWQsIGltbXV0YWJsZSBtb2RlbFxuICAgICAgICAgICAgaS5PcmRlcmVkTWFwKClcblxuICAgICAgICAgIG5leHQgeyBzdGF0ZTogJ2RhdGEnLCBkYXRhOiBkYXRhIH0sIGFjdGlvblxuICAgICAgXG4gICAgICB8ICd1cGRhdGUnID0+XG4gICAgICAgIHsgZGF0YSB9ID0gc3RhdGVcbiAgICAgICAgeyBwYXlsb2FkIH0gPSBhY3Rpb25cbiAgICAgICAgeyBpZCB9ID0gcGF5bG9hZFxuXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tvcHRpb25zLm5hbWV9IE1FUkdJTkcgSU4gREFUQVwiLCBwYXlsb2FkLCBcIlRPXCIsIGlkXG4gICAgICAgIG5leHQgeyBzdGF0ZTogJ2RhdGEnIGRhdGE6IGRhdGEubWVyZ2VJbiBbaWRdLCBwYXlsb2FkIH0sIGFjdGlvblxuICAgICAgICAgIFxuICAgICAgfCBfID0+IG5leHQgc3RhdGUsIGFjdGlvblxuXG5leHBvcnQgU2VlZENvbGxlY3Rpb24gPSBtYXliZU5leHQgKG9wdGlvbnM9e30sIG5leHQpIC0+XG4gIENvbGxlY3Rpb24gb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgeyBzZWVkIH0gPSBvcHRpb25zXG4gICAgXG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8ICdpbml0JyA9PlxuICAgICAgICBpZiBzZWVkIHRoZW4gbmV4dCB7IHN0YXRlOiAnZGF0YScsIGRhdGE6IHNlZWQgfSwgYWN0aW9uXG4gICAgICAgIGVsc2UgbmV4dCBzdGF0ZSwgYWN0aW9uXG4gICAgICAgIFxuICAgICAgfCBfID0+IG5leHQgc3RhdGUsIGFjdGlvblxuICAgICAgXG5cbmV4cG9ydCBTb3J0ZWRTZWVkQ29sbGVjdGlvbiA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgU2VlZENvbGxlY3Rpb24gb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgXG4gICAgc29ydCA9ICh7IHNvcnRCeSwgc29ydE9yZGVyLCBkYXRhIH0pIC0+XG4gICAgICBpZiBub3Qgc29ydEJ5IHRoZW4gc29ydEJ5ID0gb3B0aW9ucy5zb3J0QnlcbiAgICAgIGlmIHNvcnRCeSBhbmQgbm90IHNvcnRPcmRlciB0aGVuIHNvcnRPcmRlciA9IG9wdGlvbnMuc29ydE9yZGVyIG9yIDFcblxuICAgICAgY29tcGFyYXRvciA9ICh4LHkpIC0+XG4gICAgICAgIHggPSB4LmdldCBzb3J0QnlcbiAgICAgICAgeSA9IHkuZ2V0IHNvcnRCeVxuICAgICAgICBpZiB4IGlzIHkgdGhlbiByZXR1cm4gMFxuICAgICAgICBpZiB4IDwgeSB0aGVuIHNvcnRPcmRlciBlbHNlIHNvcnRPcmRlciAqIC0xXG5cbiAgICAgIGlmIHN0YXRlLmRhdGEuc2l6ZSB0aGVuIHsgc3RhdGU6ICdkYXRhJywgZGF0YTogKGlmIHNvcnRCeSB0aGVuIGRhdGEuc29ydChjb21wYXJhdG9yKSBlbHNlIGRhdGEpIH0gPDw8IHsgc29ydE9yZGVyLCBzb3J0QnkgfVxuICAgICAgZWxzZSB7IHN0YXRlOiAnZW1wdHknIH0gPDw8IHsgc29ydE9yZGVyLCBzb3J0QnkgfVxuICAgICAgXG4gICAgc3RhdGUgPSBzd2l0Y2ggYWN0aW9uLnZlcmJcbiAgICAgIHwgJ2luaXQnICAgPT4gc29ydChzdGF0ZSlcbiAgICAgIHwgJ2NyZWF0ZScgPT4gc29ydChzdGF0ZSlcbiAgICAgIHwgJ3VwZGF0ZScgPT4gc29ydChzdGF0ZSlcbiAgICAgIHwgJ3JlbW92ZScgPT4gc29ydChzdGF0ZSlcbiAgICAgIHwgJ3NvcnQnICAgPT4gc29ydCBzdGF0ZXsgc29ydEJ5LCBzb3J0T3JkZXIgfSA8PDwgYWN0aW9uLnBheWxvYWR7IHNvcnRCeSwgc29ydE9yZGVyPTEgfVxuICAgICAgfCBfID0+IHN0YXRlXG5cbiAgICBuZXh0IHN0YXRlLCBhY3Rpb25cblxuXG4iXX0=
