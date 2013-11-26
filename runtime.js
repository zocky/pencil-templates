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
    if ((data || Handlebars._defaultThis) ===
        (old_data || Handlebars._defaultThis))
      return fn(data);
    else
      return Spark.setDataContext(data, fn(data));
  };
};

Pencil = {
  GET: function GET(tmpl,ctx,root) {
    var path = arguments;
    var td = Template[tmpl]._tmpl_data;
    var obj = first(td.helpers && td.helpers[root],Handlebars._default_helpers[root],ctx[root]);
    var ctx = _.extend({},ctx);
    var res = function() { 
      var ret = run(ctx,obj,[{hash:{}}]);
      for (var i=3; i< path.length; i++) {  
        if (!ret) break;
        ret = ret[path[i]];
      }
      return (!ret && isNaN(ret)) ? '' : ret;
    }
    return branch(tmpl+'-'+root,res);
  },
  HELPER: function HELPER(tmpl,ctx,n,named,numbered) {
    var td = Template[tmpl]._tmpl_data;
    var fn = first(td.helpers && td.helpers[n],Handlebars._default_helpers[n],ctx[n]);
    var ctx = _.extend({},ctx);
    var named = _.extend({},named);
    var res = function() { return run(ctx,fn,numbered.concat({hash:named})); }
    return branch(tmpl+'-'+n,res);
  },
  BLOCK: function BLOCK(tmpl,ctx,n,yes,no,value) {
    var td = Template[tmpl]._tmpl_data;
    var fn = Handlebars._default_helpers[n];
    if(!fn) return '';
    
    var block = decorateBlockFn( yes, ctx);
    
    block.fn = block;
    block.inverse = decorateBlockFn( no, ctx);
    var args = [value,block]
    var res = run(ctx,fn,args);
    return res;
  },
  PARTIAL: function PARTIAL(tmpl,ctx,n,named,numbered) {
    var args = _.extend({},ctx,named);
    
    var html = branch(n, (function () {
      return String(Template[n].bind(Template,args)());
    }));
    return html
  },
  ESC: function ESC(s) {
    return s;
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  RAW: function(s) {
    return new Handlebars.SafeString(s);
  },
  NOP: function(){return ''}
}
