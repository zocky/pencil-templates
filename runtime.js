var PC = 0;

var branch = function(name, func) {
  // Construct a unique branch identifier based on what partial
  // we're in, what partial or helper we're calling, and our index
  // into the template AST (essentially the program counter).
  // If "foo" calls "bar" at index 3, it looks like: bar@foo#3.
  return Spark.labelBranch(name + "@" + (PC++), func);
};

var first = function() {
  for (var i = 0; i< arguments.length; i++) if (arguments[i]!==undefined) return arguments[i];
}
var run = function(ctx,fn,args) {
  if (typeof fn != 'function') return fn;
  var res = fn.apply(ctx,args||[]);
  return res;
}

var bind = function(ctx,fn) {
  if (typeof fn == 'function') return fn.bind(ctx);
  return function() { return fn; }
}


var decorateBlockFn = function(fn, old_data) {
  return function(data) {
    // don't create spurious annotations when data is same
    // as before (or when transitioning between e.g. `window` and
    // `undefined`)
    if ((data || Handlebars._defaultThis) ===
        (old_data || Handlebars._defaultThis))
      return fn(data);
    else
      return Spark.setDataContext(data, fn(data));
  };
};

Pencil = {
  GET: function(tmpl,ctx,root) {
    var td = Template[tmpl]._tmpl_data;
    var obj = first(td.helpers[root],ctx[root]);
    var obj = run(ctx,obj);
    for (var i=3; i< arguments.length; i++) {  
      if (!obj) break;
      obj = obj[arguments[i]];
    }
    return (!obj && isNaN(obj)) ? '' : obj;
  },
  HELPER: function(tmpl,ctx,n,named,numbered) {
    var td = Template[tmpl]._tmpl_data;
    var fn = first(td.helpers[n],Handlebars._default_helpers[n],ctx[n]);
    var res = bind(ctx,fn,numbered.concat(ctx));
    return branch(tmpl+'-'+n,res);
  },
  BLOCK: function(tmpl,ctx,n,yes,no,value) {
    var td = Template[tmpl]._tmpl_data;
    var fn = Handlebars._default_helpers[n];
    if(!fn) return '';
    
    var block = decorateBlockFn( function (data) {
      return yes.apply(value);
    }, ctx);
    
    block = function(data){ return yes && yes.apply(_.extend({},ctx,data)) || ''};
        
    block.fn = block;
    block.inverse = decorateBlockFn( function (data) {
      return no.apply(value);
    }, ctx);
    var args = [value,block]
    var res = run(ctx,fn,args);
    return res;
  },
  PARTIAL: function(tmpl,ctx,n,named,numbered) {
    var ctx = _.extend({},ctx,named);
    return branch(tmpl+'-'+n,Template[tmpl]);
  },
  ESC: function(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  RAW: function(s) {
    return new Handlebars.SafeString(s);
  },
}
