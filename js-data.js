define([
    'lib/underscore'
  , 'component/js-data-odata/index'
],
function(_, ODataAdapater){
  // todo [akamel] is _.findKey when available
  _findKey = function(obj, predicate, context) {
    // predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  function toSimpleHash(schema) {
   // todo [akamel] use mapObject when we get latest underscore
   var ret = {};

   _.each(schema.properties, function(value, key, list){
     var obj = _.pick(value, 'type')
      if (value.schema) {
        obj.type = value.schema.name;
      }

      ret[key] = obj;
   });

   return ret;
  }

  function defineType(schema, Schemator) {
    Schemator.defineDataType(schema.name, function (x) {
      
    });
  }

  function defineResource(schema, Store, Schemator) {
    var ret = Store.defineResource({
        name          : schema.name
      , idAttribute   : _findKey(schema.properties, function(i){ return i.key; }) || 'Id'
    });

    Schemator.defineSchema(schema.name, toSimpleHash(schema));

    var types = [];
    // seed types
    _.each(schema.properties, function(value, key){
      value.schema && !Schemator.getDataType(value.schema.name) && types.push(value.schema);
    });

    var s$type = undefined;
    while(s$type = types.shift()) {
      if (!Schemator.getDataType(s$type.name)) {
        defineType(s$type, Schemator);

         _.each(s$type.properties, function(value, key){
          value.schema && !Schemator.getDataType(value.schema.name) && types.push(value.schema);
        });
      }
    }

    return ret;
  }

  return {
      defineResource  : defineResource
  };
});