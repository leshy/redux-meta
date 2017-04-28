(function(){
  var moment, ref$, cbc, each, wait, union, assign, omit, map, curry, times, keys, cloneDeep, defaultsDeep, mapValues, pick, path, SimpleAction, Resource, TailCollection, Collection, SailsCollection, out$ = typeof exports != 'undefined' && exports || this;
  moment = require('moment');
  ref$ = require('leshdash'), cbc = ref$.cbc, each = ref$.each, wait = ref$.wait, union = ref$.union, assign = ref$.assign, omit = ref$.omit, map = ref$.map, curry = ref$.curry, times = ref$.times, keys = ref$.keys, cloneDeep = ref$.cloneDeep, defaultsDeep = ref$.defaultsDeep, mapValues = ref$.mapValues, pick = ref$.pick, omit = ref$.omit;
  path = require('path');
  SimpleAction = curry$(function(arg$, data, payload){
    var name;
    name = arg$.name;
    return import$(import$({
      type: "resource_" + name
    }, data), payload
      ? {
        payload: payload
      }
      : {});
  });
  out$.Resource = Resource = function(options){
    var sa;
    sa = SimpleAction(options);
    return {
      empty: sa({
        verb: 'empty'
      }),
      loading: sa({
        verb: 'loading'
      }),
      error: sa({
        verb: 'error'
      })
    };
  };
  out$.TailCollection = TailCollection = function(options){
    return import$(Resource(options), {
      create: SimpleAction(options, {
        verb: 'create'
      })
    });
  };
  out$.Collection = Collection = function(options){
    var sa;
    sa = SimpleAction(options);
    return import$(TailCollection(options), {
      sort: sa({
        verb: 'sort'
      }),
      remove: sa({
        verb: 'remove'
      }),
      replace: sa({
        verb: 'replace'
      }),
      update: sa({
        verb: 'update'
      })
    });
  };
  out$.SailsCollection = SailsCollection = function(options){
    var sa, parseDates, checkErr, ref$, sub, name, io, pathPrefix, actions;
    sa = SimpleAction(options);
    parseDates = function(data){
      return function(it){
        return import$(data, it);
      }(
      mapValues(function(it){
        return {
          createdAt: it.createdAt,
          updatedAt: it.updatedAt
        };
      }(
      data), function(it){
        return moment(it);
      }));
    };
    checkErr = function(dispatch, jwRes, expectedCode){
      expectedCode == null && (expectedCode = 200);
      if (jwRes.statusCode === expectedCode) {
        return false;
      }
      dispatch(actions.error(import$({
        statusCode: jwRes.statusCode
      }, jwRes.error)));
      return true;
    };
    ref$ = defaultsDeep(options, {
      sub: true,
      pathPrefix: '/'
    }), sub = ref$.sub, name = ref$.name, io = ref$.io, pathPrefix = ref$.pathPrefix;
    io.socket.on(name, function(event){
      var ref$;
      switch (event.verb) {
      case "updated":
        console.log("UPDATED", event);
        return store.dispatch(actions.update({
          payload: (ref$ = event.data, ref$.id = event.id, ref$)
        }));
      case "created":
        console.log("CREATED", event);
        return store.dispatch(actions.create({
          payload: event.data
        }));
      default:
        return console.error("received an unknown collection event", event);
      }
    });
    return actions = import$(Collection(options), {
      remoteCreate: function(payload, callback){
        return function(dispatch){
          dispatch(actions.loading());
          return io.socket.post(path.join(pathPrefix, "/" + name), payload, function(resData, jwRes){
            if (checkErr(dispatch, jwRes, 201)) {
              cbc(callback, jwRes);
              return jwRes;
            }
            dispatch(actions.create(parseDates(jwRes.body)));
            return cbc(callback, void 8, jwRes);
          });
        };
      },
      remoteUpdate: function(payload){
        return function(dispatch){
          dispatch(actions.loading());
          return io.socket.put(path.join(pathPrefix, "/" + name + "/" + payload.id), omit(payload, 'id'), function(resData, jwRes){
            if (checkErr(dispatch, jwRes)) {
              return;
            }
            return dispatch(actions.update(parseDates(jwRes.body)));
          });
        };
      },
      remoteRemove: function(arg$){
        var id;
        id = arg$.id;
        return function(dispatch){
          dispatch(actions.loading());
          return io.socket['delete'](path.join(pathPrefix, "/" + name + "/" + id), function(resData, jwRes){
            if (checkErr(dispatch, jwRes)) {
              return;
            }
            return dispatch(actions.remove({
              id: id
            }));
          });
        };
      },
      get: function(filter){
        return function(dispatch){
          var query;
          dispatch(actions.loading());
          query = "/" + name + "?sort=createdAt DESC";
          if (filter) {
            query = query + "&where=" + JSON.stringify(filter);
          }
          query = path.join(pathPrefix, query);
          return io.socket.get(query, function(resData, jwRes){
            if (checkErr(dispatch, jwRes)) {
              return;
            }
            return dispatch(actions.replace(map(jwRes.body, parseDates)));
          });
        };
      }
    });
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9yZWR1eC1tZXRhL2FjdGlvbnMvcmVzb3VyY2UubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFRSxNQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBO0VBQ0EsSUFBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBWSxHQUFaLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWSxHQUFaLEVBQWlCLElBQWpCLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaUIsSUFBakIsRUFBdUIsSUFBdkIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF1QixJQUF2QixFQUE2QixLQUE3QixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTZCLEtBQTdCLEVBQW9DLE1BQXBDLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBb0MsTUFBcEMsRUFBNEMsSUFBNUMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0QyxJQUE1QyxFQUFrRCxHQUFsRCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWtELEdBQWxELEVBQXVELEtBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsS0FBdkQsRUFBOEQsS0FBOUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE4RCxLQUE5RCxFQUFxRSxJQUFyRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFFLElBQXJFLEVBQTJFLFNBQTNFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMkUsU0FBM0UsRUFBc0YsWUFBdEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFzRixZQUF0RixFQUFvRyxTQUFwRyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9HLFNBQXBHLEVBQStHLElBQS9HLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBK0csSUFBL0csRUFBcUgsSUFBckgsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxSDtFQUNySCxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBR0YsWUFBYSxDQUFBLENBQUEsUUFBRSxR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QUEsSUFBQTs7UUFBRyxVQUFBO2VBQ2YsUUFBQSxDQUFBLFFBQUE7VUFDRSxTQUFTLE9BQU8sQ0FBQyxRQUFPLENBQWY7aUJBRVQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFELEVBQVEsSUFBSSxDQUFDLEtBQUssWUFBWSxHQUFBLENBQUEsQ0FBQSxDQUFJLElBQUksQ0FBQSxDQUFBLENBQUMsR0FBQSxDQUFBLENBQUEsQ0FBRyxFQUF6QixHQUFnQyxRQUFBLENBQUEsT0FBQSxFQUFBLEtBQUE7WUFDeEQsSUFBRyxRQUFILENBQVksUUFBWixFQUFzQixLQUFWLENBQVo7Y0FBaUMsTUFBQTs7bUJBQ2pDLFNBQVMsT0FBTyxDQUFDLE9BQU87Y0FBQSxJQUFJO1lBQUosQ0FBQSxDQUFmO1dBRk07OztNQUlyQixLQUFLLFFBQUEsQ0FBQSxNQUFBO2VBQ0gsUUFBQSxDQUFBLFFBQUE7O1VBQ0UsU0FBUyxPQUFPLENBQUMsUUFBTyxDQUFmO1VBRVQsS0FBTSxDQUFBLENBQUEsQ0FBRSxHQUFBLENBQUEsQ0FBQSxDQUFJLElBQUksQ0FBQSxDQUFBLENBQUM7VUFDakIsSUFBRyxNQUFIO1lBQWUsS0FBTSxDQUFBLENBQUEsQ0FBSyxLQUFLLENBQUEsQ0FBQSxDQUFDLFNBQUEsQ0FBQSxDQUFBLENBQVMsSUFBSSxDQUFDLFNBQWQsQ0FBd0IsTUFBRDs7VUFFdkQsS0FBTSxDQUFBLENBQUEsQ0FBRSxJQUFJLENBQUMsS0FBSyxZQUFZLEtBQWI7aUJBRWpCLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLFFBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQTtZQUNuQixJQUFHLFFBQUgsQ0FBWSxRQUFaLEVBQXNCLEtBQVYsQ0FBWjtjQUFpQyxNQUFBOzttQkFDakMsU0FBUyxPQUFPLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLFVBQVosQ0FBSixDQUFoQjtXQUZHOzs7SUFsQ2xCIiwic291cmNlc0NvbnRlbnQiOlsiI2F1dG9jb21waWxlXG5yZXF1aXJlISB7XG4gIG1vbWVudFxuICBsZXNoZGFzaDogeyBjYmMsIGVhY2gsIHdhaXQsIHVuaW9uLCBhc3NpZ24sIG9taXQsIG1hcCwgY3VycnksIHRpbWVzLCBrZXlzLCBjbG9uZURlZXAsIGRlZmF1bHRzRGVlcCwgbWFwVmFsdWVzLCBwaWNrLCBvbWl0IH1cbiAgcGF0aFxufVxuXG5TaW1wbGVBY3Rpb24gPSAoeyBuYW1lIH0sIGRhdGEsIHBheWxvYWQpIC0tPlxuICB7IHR5cGU6IFwicmVzb3VyY2VfI3sgbmFtZSB9XCIgfSA8PDwgZGF0YSA8PDwgKGlmIHBheWxvYWQgdGhlbiBwYXlsb2FkOiBwYXlsb2FkIGVsc2Uge30pXG5cbmV4cG9ydCBSZXNvdXJjZSA9IChvcHRpb25zKSAtPlxuICBzYSA9IFNpbXBsZUFjdGlvbiBvcHRpb25zXG4gIFxuICBkb1xuICAgIGVtcHR5OiBzYSB2ZXJiOiAnZW1wdHknXG4gICAgbG9hZGluZzogc2EgdmVyYjogJ2xvYWRpbmcnXG4gICAgZXJyb3I6IHNhIHZlcmI6ICdlcnJvcidcblxuZXhwb3J0IFRhaWxDb2xsZWN0aW9uID0gKG9wdGlvbnMpIC0+XG4gIFJlc291cmNlKG9wdGlvbnMpIDw8PCBkb1xuICAgIGNyZWF0ZTogU2ltcGxlQWN0aW9uIG9wdGlvbnMsIHZlcmI6ICdjcmVhdGUnXG5cbmV4cG9ydCBDb2xsZWN0aW9uID0gKG9wdGlvbnMpIC0+XG4gIHNhID0gU2ltcGxlQWN0aW9uIG9wdGlvbnNcbiAgXG4gIFRhaWxDb2xsZWN0aW9uKG9wdGlvbnMpIDw8PCBkb1xuICAgIHNvcnQ6IHNhIHZlcmI6ICdzb3J0J1xuICAgIHJlbW92ZTogc2EgdmVyYjogJ3JlbW92ZSdcbiAgICByZXBsYWNlOiBzYSB2ZXJiOiAncmVwbGFjZSdcbiAgICB1cGRhdGU6IHNhIHZlcmI6ICd1cGRhdGUnXG4gICAgICBcbmV4cG9ydCBTYWlsc0NvbGxlY3Rpb24gPSAob3B0aW9ucykgLT5cbiAgc2EgPSBTaW1wbGVBY3Rpb24gb3B0aW9uc1xuXG4gICMgd2UgY29udmVydCBjcmVhdGVkQXQgYW5kIHVwZGF0ZWRBdCBpbnRvIG1vbWVudCBpbnN0YW5jZXMgIFxuICBwYXJzZURhdGVzID0gKGRhdGEpIC0+XG4gICAgZGF0YVxuICAgICAgfD4gLT4gaXR7IGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAgICAgIHw+IG1hcFZhbHVlcyBfLCAoLT4gbW9tZW50IGl0KVxuICAgICAgfD4gLT4gZGF0YSA8PDwgaXRcblxuICAjIHVzZWQgYnkgYWxsIHRoZSBlbmRwb2ludHMgbWFraW5nIEFQSSBjYWxsc1xuICAjIGNoZWNrcyBpZiB3ZSBnb3QgYW4gZXJyb3IgcmVzcG9uc2UgYW5kIGRpc3BhdGNoZXMgYW4gZXJyb3IgYWN0aW9uIGlmIG5lZWRlZFxuICBjaGVja0VyciA9IChkaXNwYXRjaCwgandSZXMsIGV4cGVjdGVkQ29kZT0yMDApIC0+XG4gICAgaWYgandSZXMuc3RhdHVzQ29kZSBpcyBleHBlY3RlZENvZGUgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBkaXNwYXRjaCBhY3Rpb25zLmVycm9yIChzdGF0dXNDb2RlOiBqd1Jlcy5zdGF0dXNDb2RlKSA8PDwgandSZXMuZXJyb3JcbiAgICByZXR1cm4gdHJ1ZVxuICBcbiAgeyBzdWIsIG5hbWUsIGlvLCBwYXRoUHJlZml4IH0gPSBkZWZhdWx0c0RlZXAgb3B0aW9ucywgeyBzdWI6IHRydWUsIHBhdGhQcmVmaXg6ICcvJyB9XG4gIFxuICBpby5zb2NrZXQub24gbmFtZSwgKGV2ZW50KSAtPlxuICAgIFxuICAgIHN3aXRjaCBldmVudC52ZXJiXG4gICAgICB8IFwidXBkYXRlZFwiID0+XG4gICAgICAgIGNvbnNvbGUubG9nIFwiVVBEQVRFRFwiLGV2ZW50XG4gICAgICAgIHN0b3JlLmRpc3BhdGNoIGFjdGlvbnMudXBkYXRlIHBheWxvYWQ6IChldmVudC5kYXRhIDw8PCBpZDogZXZlbnQuaWQpXG4gICAgICAgIFxuICAgICAgfCBcImNyZWF0ZWRcIiA9PlxuICAgICAgICBjb25zb2xlLmxvZyBcIkNSRUFURURcIixldmVudFxuICAgICAgICBcbiAgICAgICAgc3RvcmUuZGlzcGF0Y2ggYWN0aW9ucy5jcmVhdGUgcGF5bG9hZDogZXZlbnQuZGF0YVxuICAgICAgfCBvdGhlcndpc2UgPT4gY29uc29sZS5lcnJvciBcInJlY2VpdmVkIGFuIHVua25vd24gY29sbGVjdGlvbiBldmVudFwiLCBldmVudFxuICBcbiAgYWN0aW9ucyA9IENvbGxlY3Rpb24ob3B0aW9ucykgPDw8IGRvXG4gIFxuICAgIHJlbW90ZUNyZWF0ZTogKHBheWxvYWQsIGNhbGxiYWNrKSAtPlxuICAgICAgKGRpc3BhdGNoKSAtPiBcbiAgICAgICAgZGlzcGF0Y2ggYWN0aW9ucy5sb2FkaW5nIVxuICAgICAgICBcbiAgICAgICAgaW8uc29ja2V0LnBvc3QgcGF0aC5qb2luKHBhdGhQcmVmaXgsIFwiLyN7bmFtZX1cIiksIHBheWxvYWQsIChyZXNEYXRhLCBqd1JlcykgLT5cbiAgICAgICAgICBpZiBjaGVja0VyciBkaXNwYXRjaCwgandSZXMsIDIwMSB0aGVuIGNiYyhjYWxsYmFjayxqd1Jlcyk7IHJldHVybiBqd1Jlc1xuICAgICAgICAgIGRpc3BhdGNoIGFjdGlvbnMuY3JlYXRlIHBhcnNlRGF0ZXMgandSZXMuYm9keVxuICAgICAgICAgIGNiYyBjYWxsYmFjaywgdm9pZCwgandSZXNcblxuICAgIHJlbW90ZVVwZGF0ZTogKHBheWxvYWQpIC0+XG4gICAgICAoZGlzcGF0Y2gpIC0+IFxuICAgICAgICBkaXNwYXRjaCBhY3Rpb25zLmxvYWRpbmchXG4gICAgICAgIFxuICAgICAgICBpby5zb2NrZXQucHV0IHBhdGguam9pbihwYXRoUHJlZml4LCBcIi8je25hbWV9LyN7cGF5bG9hZC5pZH1cIiksIG9taXQocGF5bG9hZCwgJ2lkJyksIChyZXNEYXRhLCBqd1JlcykgLT5cbiAgICAgICAgICBpZiBjaGVja0VyciBkaXNwYXRjaCwgandSZXMgdGhlbiByZXR1cm5cbiAgICAgICAgICBkaXNwYXRjaCBhY3Rpb25zLnVwZGF0ZSBwYXJzZURhdGVzIGp3UmVzLmJvZHlcbiAgICAgICAgICAgICAgICAgIFxuICAgIHJlbW90ZVJlbW92ZTogKHsgaWQgfSkgLT5cbiAgICAgIChkaXNwYXRjaCkgLT5cbiAgICAgICAgZGlzcGF0Y2ggYWN0aW9ucy5sb2FkaW5nIVxuICAgICAgICBcbiAgICAgICAgaW8uc29ja2V0LmRlbGV0ZSBwYXRoLmpvaW4ocGF0aFByZWZpeCwgXCIvI3tuYW1lfS8je2lkfVwiKSwgKHJlc0RhdGEsIGp3UmVzKSAtPlxuICAgICAgICAgIGlmIGNoZWNrRXJyIGRpc3BhdGNoLCBqd1JlcyB0aGVuIHJldHVyblxuICAgICAgICAgIGRpc3BhdGNoIGFjdGlvbnMucmVtb3ZlIGlkOiBpZFxuICAgICAgICAgIFxuICAgIGdldDogKGZpbHRlcikgLT5cbiAgICAgIChkaXNwYXRjaCkgLT4gXG4gICAgICAgIGRpc3BhdGNoIGFjdGlvbnMubG9hZGluZyFcbiAgICAgICAgXG4gICAgICAgIHF1ZXJ5ID0gXCIvI3tuYW1lfT9zb3J0PWNyZWF0ZWRBdCBERVNDXCJcbiAgICAgICAgaWYgZmlsdGVyIHRoZW4gcXVlcnkgPSBcIiN7cXVlcnl9JndoZXJlPSN7SlNPTi5zdHJpbmdpZnkoZmlsdGVyKX1cIlxuXG4gICAgICAgIHF1ZXJ5ID0gcGF0aC5qb2luKHBhdGhQcmVmaXgsIHF1ZXJ5KVxuXG4gICAgICAgIGlvLnNvY2tldC5nZXQgcXVlcnksIChyZXNEYXRhLCBqd1JlcykgLT5cbiAgICAgICAgICBpZiBjaGVja0VyciBkaXNwYXRjaCwgandSZXMgdGhlbiByZXR1cm5cbiAgICAgICAgICBkaXNwYXRjaCBhY3Rpb25zLnJlcGxhY2UgbWFwIGp3UmVzLmJvZHksIHBhcnNlRGF0ZXNcblxuIl19
