(function(){
  var moment, ref$, each, wait, union, assign, omit, map, curry, times, keys, cloneDeep, defaultsDeep, mapValues, pick, path, SimpleAction, Resource, TailCollection, Collection, SailsCollection, out$ = typeof exports != 'undefined' && exports || this;
  moment = require('moment');
  ref$ = require('leshdash'), each = ref$.each, wait = ref$.wait, union = ref$.union, assign = ref$.assign, omit = ref$.omit, map = ref$.map, curry = ref$.curry, times = ref$.times, keys = ref$.keys, cloneDeep = ref$.cloneDeep, defaultsDeep = ref$.defaultsDeep, mapValues = ref$.mapValues, pick = ref$.pick, omit = ref$.omit;
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
        return store.dispatch(actions.update({
          payload: (ref$ = event.data, ref$.id = event.id, ref$)
        }));
      case "created":
        return store.dispatch(actions.push({
          payload: event.data
        }));
      default:
        return console.error("received an unknown collection event", event);
      }
    });
    return actions = import$(Collection(options), {
      remoteCreate: function(payload){
        return function(dispatch){
          dispatch(actions.loading());
          return io.socket.post(path.join(pathPrefix, "/" + name), payload, function(resData, jwRes){
            if (checkErr(dispatch, jwRes, 201)) {
              return;
            }
            return dispatch(actions.create(parseDates(jwRes.body)));
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
