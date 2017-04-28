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
        var sortBy, sortOrder, comparator;
        sortBy = arg$.sortBy, sortOrder = arg$.sortOrder;
        if (!sortBy) {
          sortBy = options.sortBy || "createdAt";
        }
        if (!sortOrder) {
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
            data: state.data.sort(comparator),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9yZWR1eC1tZXRhL3JlZHVjZXJzL3Jlc291cmNlLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR0UsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxZQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxZQUFaLEVBQTBCLEdBQTFCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEIsR0FBMUIsRUFBK0IsU0FBL0IsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUErQixTQUEvQixFQUEwQyxJQUExQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTBDLElBQTFDLEVBQWdELE1BQWhELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZ0Q7RUFDaEQsQ0FBQSxHQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsRUFBcUIsU0FBckIsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFhO0VBR2YsU0FBVSxDQUFBLENBQUEsQ0FBRSxRQUFBLENBQUEsQ0FBQTtXQUNWLFFBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQTthQUFtQixFQUFFLFNBQVMsUUFBQSxDQUFBLEtBQUEsRUFBQSxNQUFBO1FBQW1CLElBQUcsSUFBSDtpQkFBYSxLQUFLLE9BQU0sTUFBUDtTQUFlO2lCQUFLOztPQUFqRTs7O2tCQUVoQixRQUFTLENBQUEsQ0FBQSxDQUFFLFVBQVUsUUFBQSxDQUFBLE9BQUEsRUFBQSxJQUFBOztJQUFDLG9CQUFBLFVBQVE7SUFDakMsSUFBTyxDQUFBLENBQUEsQ0FBRSxPQUFYLENBQUU7V0FDRixRQUFBLENBQUEsS0FBQSxFQUFBLE1BQUE7TUFFRSxJQUFHLENBQUksS0FBUDtRQUFrQixNQUFPLENBQUEsQ0FBQSxDQUFFO1VBQUUsTUFBTTtRQUFSO09BQzNCLE1BQUEsSUFBUSxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSyxXQUFBLENBQUEsQ0FBQSxDQUFhLElBQXRDO1FBQW1ELE1BQUEsQ0FBTyxLQUFQOztNQUVuRCxRQUFP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QTtNQUNqQixLQUFBLFFBQUE7QUFBQSxlQUFZLEtBQUssS0FBQTtNQUNqQixLQUFBLE1BQUE7QUFBQSxlQUFZLGNBQVU7VUFBRSxRQUFQLE1BQU87VUFBUSxXQUFmLE1BQWU7UUFBVixTQUEwQyxpQkFBaEIsTUFBTSxDQUFDLFNBQVMsY0FBUSxZQUFTLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsU0FBUyxDQUFBLFFBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQyxFQUFBLFNBQWpFOztlQUNaLEtBQUssT0FBTyxNQUFQOztLQXJCRDtHQUR1QiIsInNvdXJjZXNDb250ZW50IjpbIiNhdXRvY29tcGlsZVxuXG5yZXF1aXJlISB7XG4gIGxlc2hkYXNoOiB7IGRlZmF1bHRzRGVlcCwgbWFwLCBtYXBWYWx1ZXMsIGVhY2gsIHJlZHVjZSB9XG4gIGltbXV0YWJsZTogeyBmcm9tSlM6IGltbXV0YWJsZSB9OiBpXG59XG5cbm1heWJlTmV4dCA9IChmKSAtPlxuICAob3B0aW9ucywgbmV4dCkgLT4gZiBvcHRpb25zLCAoc3RhdGUsIGFjdGlvbikgLT4gaWYgbmV4dCB0aGVuIG5leHQoc3RhdGUsYWN0aW9uKSBlbHNlIHN0YXRlXG5cbmV4cG9ydCBSZXNvdXJjZSA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgeyBuYW1lIH0gPSBvcHRpb25zXG4gICggc3RhdGUsIGFjdGlvbiApIC0+XG5cbiAgICBpZiBub3Qgc3RhdGUgdGhlbiBhY3Rpb24gPSB7IHZlcmI6ICdpbml0JyB9XG4gICAgZWxzZSBpZiBhY3Rpb24udHlwZSBpc250IFwicmVzb3VyY2VfI3sgbmFtZSB9XCIgdGhlbiByZXR1cm4gc3RhdGVcbiAgICAgIFxuICAgIHN3aXRjaCBhY3Rpb24udmVyYlxuICAgICAgfCBcImluaXRcIiA9PiBuZXh0IHsgc3RhdGU6ICdlbXB0eScgfSwgYWN0aW9uXG4gICAgICB8IFwiZW1wdHlcIiA9PiB7IHN0YXRlOiAnZW1wdHknIH1cbiAgICAgIHwgXCJsb2FkaW5nXCIgPT4geyBzdGF0ZTogJ2xvYWRpbmcnIH0gPDw8IChpZiBzdGF0ZS5kYXRhIHRoZW4gZGF0YTogc3RhdGUuZGF0YSlcbiAgICAgIHwgXCJlcnJvclwiID0+IHsgc3RhdGU6ICdlcnJvcicsIGRhdGE6IHN0YXRlP2RhdGEsIGVycm9yOiBhY3Rpb24ucGF5bG9hZCB9XG4gICAgICB8IF8gPT4gbmV4dCBzdGF0ZSwgYWN0aW9uXG4gICAgICAgIFxuZXhwb3J0IE9yZGVyZWRNYXAgPSBtYXliZU5leHQgKG9wdGlvbnM9e30sIG5leHQpIC0+XG4gIFJlc291cmNlIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPlxuICAgIHN3aXRjaCBhY3Rpb24udmVyYlxuICAgICAgfCBcImluaXRcIiA9PiBuZXh0IHsgc3RhdGU6ICdlbXB0eScgfSwgYWN0aW9uXG4gICAgICB8IF8gPT4gbmV4dCBzdGF0ZSwgYWN0aW9uXG4gICAgICBcbmV4cG9ydCBUYWlsQ29sbGVjdGlvbiA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgeyBsaW1pdCB9ID0gZGVmYXVsdHNEZWVwIG9wdGlvbnMsIHsgbGltaXQ6IEluZmluaXR5IH1cbiAgXG4gIE9yZGVyZWRNYXAgb3B0aW9ucywgKHN0YXRlLCBhY3Rpb24pIC0+XG4gICAgc3dpdGNoIGFjdGlvbi52ZXJiXG4gICAgICB8ICdjcmVhdGUnID0+XG4gICAgICAgIHsgZGF0YSB9ID0gc3RhdGVcbiAgICAgICAgeyBwYXlsb2FkIH0gPSBhY3Rpb25cbiAgICAgICAgKHsgaWQgfSA9IHBheWxvYWQpIG9yIG5ldyBEYXRlIWdldFRpbWUhXG5cbiAgICAgICAgaWYgbm90IGRhdGEgdGhlbiBkYXRhID0gaS5PcmRlcmVkTWFwKClcbiAgICAgICAgZGF0YSA9IGRhdGEuc2V0IGlkLCBpbW11dGFibGUgcGF5bG9hZFxuICAgICAgICBcbiAgICAgICAgbmV4dCB7IHN0YXRlOiAnZGF0YScsIGRhdGE6IGlmIGRhdGEuc2l6ZSA8PSBsaW1pdCB0aGVuIGRhdGEgZWxzZSBkYXRhLnNsaWNlIGxpbWl0IC0gZGF0YS5zaXplIH0sIGFjdGlvblxuICAgICAgICAgIFxuICAgICAgfCBfID0+IG5leHQgc3RhdGUsIGFjdGlvblxuXG4gICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBDb2xsZWN0aW9uID0gbWF5YmVOZXh0IChvcHRpb25zPXt9LCBuZXh0KSAtPlxuICBUYWlsQ29sbGVjdGlvbiBvcHRpb25zLCAoc3RhdGUsIGFjdGlvbikgLT5cbiAgICBzd2l0Y2ggYWN0aW9uLnZlcmJcbiAgICAgIHwgJ3JlbW92ZScgPT5cbiAgICAgICAgeyBpZCB9ID0gYWN0aW9uLnBheWxvYWRcbiAgICAgICAgZGF0YSA9IHN0YXRlLmRhdGEucmVtb3ZlIGlkXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhLnNpemUgdGhlbiBuZXh0IHsgc3RhdGU6ICdkYXRhJywgZGF0YTogZGF0YSAgfSwgYWN0aW9uXG4gICAgICAgIGVsc2UgbmV4dCB7IHN0YXRlOiAnZW1wdHknIH0sIGFjdGlvblxuXG4gICAgICB8ICdyZXBsYWNlJyA9PlxuICAgICAgICBpZiBhY3Rpb24ucGF5bG9hZC5sZW5ndGggaXMgMCB0aGVuIG5leHQgeyBzdGF0ZTogJ2VtcHR5JyB9LCBhY3Rpb25cbiAgICAgICAgZWxzZVxuXG4gICAgICAgICAgZGF0YSA9IHJlZHVjZSBkb1xuICAgICAgICAgICAgYWN0aW9uLnBheWxvYWRcbiAgICAgICAgICAgIChkYXRhLCB7aWR9Om1vZGVsKSAtPiBkYXRhLnNldCBpZCwgaW1tdXRhYmxlIG1vZGVsXG4gICAgICAgICAgICBpLk9yZGVyZWRNYXAoKVxuXG4gICAgICAgICAgbmV4dCB7IHN0YXRlOiAnZGF0YScsIGRhdGE6IGRhdGEgfSwgYWN0aW9uXG4gICAgICBcbiAgICAgIHwgJ3VwZGF0ZScgPT5cbiAgICAgICAgeyBkYXRhIH0gPSBzdGF0ZVxuICAgICAgICB7IHBheWxvYWQgfSA9IGFjdGlvblxuICAgICAgICB7IGlkIH0gPSBwYXlsb2FkXG5cbiAgICAgICAgY29uc29sZS5sb2cgXCIje29wdGlvbnMubmFtZX0gTUVSR0lORyBJTiBEQVRBXCIsIHBheWxvYWQsIFwiVE9cIiwgaWRcbiAgICAgICAgbmV4dCB7IHN0YXRlOiAnZGF0YScgZGF0YTogZGF0YS5tZXJnZUluIFtpZF0sIHBheWxvYWQgfSwgYWN0aW9uXG4gICAgICAgICAgXG4gICAgICB8IF8gPT4gbmV4dCBzdGF0ZSwgYWN0aW9uXG5cbmV4cG9ydCBTZWVkQ29sbGVjdGlvbiA9IG1heWJlTmV4dCAob3B0aW9ucz17fSwgbmV4dCkgLT5cbiAgQ29sbGVjdGlvbiBvcHRpb25zLCAoc3RhdGUsIGFjdGlvbikgLT5cbiAgICB7IHNlZWQgfSA9IG9wdGlvbnNcbiAgICBcbiAgICBzd2l0Y2ggYWN0aW9uLnZlcmJcbiAgICAgIHwgJ2luaXQnID0+XG4gICAgICAgIGlmIHNlZWQgdGhlbiBuZXh0IHsgc3RhdGU6ICdkYXRhJywgZGF0YTogc2VlZCB9LCBhY3Rpb25cbiAgICAgICAgZWxzZSBuZXh0IHN0YXRlLCBhY3Rpb25cbiAgICAgICAgXG4gICAgICB8IF8gPT4gbmV4dCBzdGF0ZSwgYWN0aW9uXG4gIFxuXG5leHBvcnQgU29ydGVkU2VlZENvbGxlY3Rpb24gPSBtYXliZU5leHQgKG9wdGlvbnM9e30sIG5leHQpIC0+XG4gIFNlZWRDb2xsZWN0aW9uIG9wdGlvbnMsIChzdGF0ZSwgYWN0aW9uKSAtPlxuICAgIFxuICAgIHNvcnQgPSAoeyBzb3J0QnksIHNvcnRPcmRlciB9KSAtPlxuICAgICAgaWYgbm90IHNvcnRCeSB0aGVuIHNvcnRCeSA9IG9wdGlvbnMuc29ydEJ5IG9yIFwiY3JlYXRlZEF0XCJcbiAgICAgIGlmIG5vdCBzb3J0T3JkZXIgdGhlbiBzb3J0T3JkZXIgPSBvcHRpb25zLnNvcnRPcmRlciBvciAxXG5cbiAgICAgIGNvbXBhcmF0b3IgPSAoeCx5KSAtPlxuICAgICAgICB4ID0geC5nZXQgc29ydEJ5XG4gICAgICAgIHkgPSB5LmdldCBzb3J0QnlcbiAgICAgICAgaWYgeCBpcyB5IHRoZW4gcmV0dXJuIDBcbiAgICAgICAgaWYgeCA8IHkgdGhlbiBzb3J0T3JkZXIgZWxzZSBzb3J0T3JkZXIgKiAtMVxuXG4gICAgICBpZiBzdGF0ZS5kYXRhLnNpemUgdGhlbiB7IHN0YXRlOiAnZGF0YScsIGRhdGE6IHN0YXRlLmRhdGEuc29ydChjb21wYXJhdG9yKSB9IDw8PCB7IHNvcnRPcmRlciwgc29ydEJ5IH1cbiAgICAgIGVsc2UgeyBzdGF0ZTogJ2VtcHR5JyB9IDw8PCB7IHNvcnRPcmRlciwgc29ydEJ5IH1cbiAgICAgIFxuICAgIHN3aXRjaCBhY3Rpb24udmVyYlxuICAgICAgfCAnaW5pdCcgICA9PiBzb3J0IHN0YXRlXG4gICAgICB8ICdjcmVhdGUnID0+IHNvcnQgc3RhdGVcbiAgICAgIHwgJ3VwZGF0ZScgPT4gc29ydCBzdGF0ZVxuICAgICAgfCAncmVtb3ZlJyA9PiBzb3J0IHN0YXRlXG4gICAgICB8ICdzb3J0JyAgID0+IHNvcnQgc3RhdGV7IHNvcnRCeSwgc29ydE9yZGVyIH0gPDw8IGFjdGlvbi5wYXlsb2FkeyBzb3J0QnksIHNvcnRPcmRlcj0xIH1cbiAgICAgIHwgXyA9PiBuZXh0IHN0YXRlLCBhY3Rpb25cblxuIl19
