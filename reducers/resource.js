(function(){
  var ref$, defaultsDeep, map, mapValues, each, reduce, i, immutable, maybeNext, Resource, OrderedMap, TailCollection, Collection, SortedCollection, SeedCollection, out$ = typeof exports != 'undefined' && exports || this;
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
        return {
          state: 'data',
          data: data.size <= limit
            ? data
            : data.slice(limit - data.size)
        };
      default:
        if (next) {
          return next(state, action);
        } else {
          return state;
        }
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
          return {
            state: 'data',
            data: data
          };
        } else {
          return {
            state: 'empty'
          };
        }
        break;
      case 'replace':
        if (action.payload.length === 0) {
          return {
            state: 'empty'
          };
        } else {
          data = reduce(action.payload, function(data, model){
            var id;
            id = model.id;
            return data.set(id, immutable(model));
          }, i.OrderedMap());
          return {
            state: 'data',
            data: data
          };
        }
        break;
      case 'update':
        data = state.data;
        payload = action.payload;
        id = payload.id;
        console.log(options.name + " MERGING IN DATA", payload, "TO", id);
        return {
          state: 'data',
          data: data.mergeIn([id], payload)
        };
      default:
        return next(state, action);
      }
    });
  });
  out$.SortedCollection = SortedCollection = maybeNext(function(options, next){
    options == null && (options = {});
    return Collection(options, function(state, action){
      var sort, ref$, ref1$, sortBy, order, comparator;
      switch (action.verb) {
      case 'sort':
        console.log("SORT ACTION", action);
        ref$ = sort = {
          sortBy: (ref$ = action.payload).sortBy,
          order: (ref1$ = ref$.order) != null ? ref1$ : 1
        }, sortBy = ref$.sortBy, order = ref$.order;
        console.log("SORT", sort);
        comparator = function(x, y){
          x = x.get(sortBy);
          y = y.get(sortBy);
          console.log('comparing', x, y);
          if (x === y) {
            return 0;
          }
          if (x < y) {
            return order;
          } else {
            return order * -1;
          }
        };
        if (state.data.size) {
          return {
            state: 'data',
            data: state.data.sort(comparator),
            sort: sort
          };
        } else {
          return {
            state: 'empty',
            sort: sort
          };
        }
        break;
      default:
        return next(state, action);
      }
    });
  });
  out$.SeedCollection = SeedCollection = maybeNext(function(options, next){
    options == null && (options = {});
    return SortedCollection(options, function(state, action){
      var seed;
      seed = options.seed;
      switch (action.verb) {
      case 'init':
        if (seed) {
          return next({
            state: 'data',
            data: seed,
            sort: {
              sortBy: 'createdAt',
              order: 1
            }
          });
        } else {
          return next(state, action);
        }
        break;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9yZWR1eC1tZXRhL3JlZHVjZXJzL3Jlc291cmNlLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR0UsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxZQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxZQUFaLEVBQTBCLEdBQTFCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEIsR0FBMUIsRUFBK0IsU0FBL0IsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUErQixTQUEvQixFQUEwQyxJQUExQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTBDLElBQTFDLEVBQWdELE1BQWhELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZ0Q7RUFDaEQsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsRUFBcUIsU0FBckIsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFhO0VBR2YsU0FBVSxDQUFBLENBQUEsQ0FBRSxRQUFBLENBQUEsQ0FBQTtXQUNWLFFBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQTthQUFtQixFQUFFLFNBQVMsUUFBQSxDQUFBLEtBQUEsRUFBQSxNQUFBO1FBQW1CLElBQUcsSUFBSDtpQkFBYSxLQUFLLE9BQU0sTUFBUDtTQUFlO2lCQUFLOztPQUFqRTs7O2tCQUVoQixRQUFTLENBQUEsQ0FBQSxDQUFFLFVBQVUsUUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBOztJQUFDLG9CQUFBLFVBQVE7SUFDakMsSUFBTyxDQUFBLENBQUEsQ0FBRSxPQUFYLENBQUU7V0FDRixRQUFBLENBQUEsS0FBQSxFQUFBLE1BQUE7TUFFRSxJQUFHLENBQUksS0FBUDtRQUFrQixNQUFPLENBQUEsQ0FBQSxDQUFFO1VBQUUsTUFBTTtRQUFSO09BQzNCLE1BQUEsSUFBUSxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSyxXQUFBLENBQUEsQ0FBQSxDQUFhLElBQXRDO1FBQW1ELE1BQUEsQ0FBTyxLQUFQOztNQUVuRCxRQUFP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QVE7Y0FBYSxPQUFPO1lBQTlCO1VBQW5DLENBQUE7U0FDbEI7aUJBQUssS0FBSyxPQUFPLE1BQVA7Ozs7ZUFFTCxLQUFLLE9BQU8sTUFBUDs7S0FSQztHQURlIiwic291cmNlc0NvbnRlbnQiOlsiI2F1dG9jb21waWxlXG5cbnJlcXVpcmUhIHtcbiAgbGVzaGRhc2g6IHsgZGVmYXVsdHNEZWVwLCBtYXAsIG1hcFZhbHVlcywgZWFjaCwgcmVkdWNlIH1cbiAgaW1tdXRhYmxlOiB7IGZyb21KUzogaW1tdXRhYmxlIH06IGlcbn1cblxubWF5YmVOZXh0ID0gKGYpIC0+XG4gIChvcHRpb25zLCBuZXh0KSAtPiBmIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPiBpZiBuZXh0IHRoZW4gbmV4dChzdGF0ZSxhY3Rpb24pIGVsc2Ugc3RhdGVcblxuZXhwb3J0IFJlc291cmNlID0gbWF5YmVOZXh0IChvcHRpb25zPXt9LCBuZXh0KSAtPlxuICB7IG5hbWUgfSA9IG9wdGlvbnNcbiAgKCBzdGF0ZSwgYWN0aW9uICkgLT5cblxuICAgIGlmIG5vdCBzdGF0ZSB0aGVuIGFjdGlvbiA9IHsgdmVyYjogJ2luaXQnIH1cbiAgICBlbHNlIGlmIGFjdGlvbi50eXBlIGlzbnQgXCJyZXNvdXJjZV8jeyBuYW1lIH1cIiB0aGVuIHJldHVybiBzdGF0ZVxuICAgICAgXG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8IFwiaW5pdFwiID0+IG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cbiAgICAgIHwgXCJlbXB0eVwiID0+IHsgc3RhdGU6ICdlbXB0eScgfVxuICAgICAgfCBcImxvYWRpbmdcIiA9PiB7IHN0YXRlOiAnbG9hZGluZycgfSA8PDwgKGlmIHN0YXRlLmRhdGEgdGhlbiBkYXRhOiBzdGF0ZS5kYXRhKVxuICAgICAgfCBcImVycm9yXCIgPT4geyBzdGF0ZTogJ2Vycm9yJywgZGF0YTogc3RhdGU/ZGF0YSwgZXJyb3I6IGFjdGlvbi5wYXlsb2FkIH1cbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cbiAgICAgICAgXG5leHBvcnQgT3JkZXJlZE1hcCA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgUmVzb3VyY2Ugb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8IFwiaW5pdFwiID0+IG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cbiAgICAgIFxuZXhwb3J0IFRhaWxDb2xsZWN0aW9uID0gbWF5YmVOZXh0IChvcHRpb25zPXt9LCBuZXh0KSAtPlxuICB7IGxpbWl0IH0gPSBkZWZhdWx0c0RlZXAgb3B0aW9ucywgeyBsaW1pdDogSW5maW5pdHkgfVxuICBcbiAgT3JkZXJlZE1hcCBvcHRpb25zLCAoc3RhdGUsIGFjdGlvbikgLT5cbiAgICBzd2l0Y2ggYWN0aW9uLnZlcmJcbiAgICAgIHwgJ2NyZWF0ZScgPT5cbiAgICAgICAgeyBkYXRhIH0gPSBzdGF0ZVxuICAgICAgICB7IHBheWxvYWQgfSA9IGFjdGlvblxuICAgICAgICAoeyBpZCB9ID0gcGF5bG9hZCkgb3IgbmV3IERhdGUhZ2V0VGltZSFcblxuICAgICAgICBpZiBub3QgZGF0YSB0aGVuIGRhdGEgPSBpLk9yZGVyZWRNYXAoKVxuICAgICAgICBkYXRhID0gZGF0YS5zZXQgaWQsIGltbXV0YWJsZSBwYXlsb2FkXG4gICAgICAgIFxuICAgICAgICBkb1xuICAgICAgICAgIHN0YXRlOiAnZGF0YSdcbiAgICAgICAgICBkYXRhOiBpZiBkYXRhLnNpemUgPD0gbGltaXQgdGhlbiBkYXRhIGVsc2UgZGF0YS5zbGljZSBsaW1pdCAtIGRhdGEuc2l6ZVxuICAgICAgICAgIFxuICAgICAgfCBfID0+IGlmIG5leHQgdGhlbiBuZXh0KHN0YXRlLCBhY3Rpb24pIGVsc2Ugc3RhdGVcblxuICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgQ29sbGVjdGlvbiA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgVGFpbENvbGxlY3Rpb24gb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8ICdyZW1vdmUnID0+XG4gICAgICAgIHsgaWQgfSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICAgIGRhdGEgPSBzdGF0ZS5kYXRhLnJlbW92ZSBpZFxuICAgICAgICBcbiAgICAgICAgaWYgZGF0YS5zaXplIHRoZW4geyBzdGF0ZTogJ2RhdGEnLCBkYXRhOiBkYXRhICB9XG4gICAgICAgIGVsc2UgeyBzdGF0ZTogJ2VtcHR5JyB9XG5cbiAgICAgIHwgJ3JlcGxhY2UnID0+XG4gICAgICAgIGlmIGFjdGlvbi5wYXlsb2FkLmxlbmd0aCBpcyAwIHRoZW4geyBzdGF0ZTogJ2VtcHR5JyB9XG4gICAgICAgIGVsc2VcblxuICAgICAgICAgIGRhdGEgPSByZWR1Y2UgZG9cbiAgICAgICAgICAgIGFjdGlvbi5wYXlsb2FkXG4gICAgICAgICAgICAoZGF0YSwge2lkfTptb2RlbCkgLT4gZGF0YS5zZXQgaWQsIGltbXV0YWJsZSBtb2RlbFxuICAgICAgICAgICAgaS5PcmRlcmVkTWFwKClcblxuICAgICAgICAgIGRvXG4gICAgICAgICAgICBzdGF0ZTogJ2RhdGEnXG4gICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICBcbiAgICAgIHwgJ3VwZGF0ZScgPT5cbiAgICAgICAgeyBkYXRhIH0gPSBzdGF0ZVxuICAgICAgICB7IHBheWxvYWQgfSA9IGFjdGlvblxuICAgICAgICB7IGlkIH0gPSBwYXlsb2FkXG5cbiAgICAgICAgY29uc29sZS5sb2cgXCIje29wdGlvbnMubmFtZX0gTUVSR0lORyBJTiBEQVRBXCIsIHBheWxvYWQsIFwiVE9cIiwgaWRcbiAgICAgICAgZG9cbiAgICAgICAgICBzdGF0ZTogJ2RhdGEnXG4gICAgICAgICAgZGF0YTogZGF0YS5tZXJnZUluIFtpZF0sIHBheWxvYWRcbiAgICAgICAgICBcbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cblxuZXhwb3J0IFNvcnRlZENvbGxlY3Rpb24gPSBtYXliZU5leHQgKG9wdGlvbnM9e30sIG5leHQpIC0+XG4gIENvbGxlY3Rpb24gb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8ICdzb3J0JyA9PlxuICAgICAgICBjb25zb2xlLmxvZyBcIlNPUlQgQUNUSU9OXCIsYWN0aW9uXG4gICAgICAgIHsgc29ydEJ5LCBvcmRlciB9ID0gc29ydCA9IGFjdGlvbi5wYXlsb2FkeyBzb3J0QnksIG9yZGVyPTEgfVxuICAgICAgICBjb25zb2xlLmxvZyBcIlNPUlRcIiwgc29ydFxuXG4gICAgICAgIGNvbXBhcmF0b3IgPSAoeCx5KSAtPlxuICAgICAgICAgIHggPSB4LmdldChzb3J0QnkpXG4gICAgICAgICAgeSA9IHkuZ2V0KHNvcnRCeSlcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zb2xlLmxvZyAnY29tcGFyaW5nJyx4LHlcbiAgICAgICAgICBpZiB4IGlzIHkgdGhlbiByZXR1cm4gMFxuICAgICAgICAgIGlmIHggPCB5IHRoZW4gb3JkZXIgZWxzZSBvcmRlciAqIC0xXG5cbiAgICAgICAgaWYgc3RhdGUuZGF0YS5zaXplIHRoZW4geyBzdGF0ZTogJ2RhdGEnLCBkYXRhOiBzdGF0ZS5kYXRhLnNvcnQoY29tcGFyYXRvciksIHNvcnQ6IHNvcnQgfVxuICAgICAgICBlbHNlIHsgc3RhdGU6ICdlbXB0eScsIHNvcnQ6IHNvcnQgfSBcbiAgICAgICAgXG4gICAgICB8IF8gPT4gbmV4dCBzdGF0ZSwgYWN0aW9uXG5cblxuZXhwb3J0IFNlZWRDb2xsZWN0aW9uID0gbWF5YmVOZXh0IChvcHRpb25zPXt9LCBuZXh0KSAtPlxuICBTb3J0ZWRDb2xsZWN0aW9uIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPlxuICAgIHsgc2VlZCB9ID0gb3B0aW9uc1xuICAgIFxuICAgIHN3aXRjaCBhY3Rpb24udmVyYlxuICAgICAgfCAnaW5pdCcgPT5cbiAgICAgICAgaWYgc2VlZCB0aGVuIG5leHQgeyBzdGF0ZTogJ2RhdGEnLCBkYXRhOiBzZWVkLCBzb3J0OiB7IHNvcnRCeTogJ2NyZWF0ZWRBdCcsIG9yZGVyOiAxIH0gfVxuICAgICAgICBlbHNlIG5leHQgc3RhdGUsIGFjdGlvblxuICAgICAgICBcbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cblxuICAgICAgXG4gIFxuIl19
