var first = function() {
  for (var i = 0; i< arguments.length; i++) if (arguments[i]!==undefined) return arguments[i];
}
var run = function(ctx,fn,args) {
  if (typeof fn != 'function') return fn;
  var res = fn.apply(ctx,args||[]);
  return res;
}
Pencil = {
  GET: function(ctx,root) {
    var td = Template[ctx._0]._tmpl_data;
    var obj = first(td.helpers[root],ctx[root]);
    console.log('found',obj);
    var obj = run(ctx,obj);
    console.log('run',obj);
    for (var i=2; i< arguments.length; i++) {  
      if (!obj) break;
      obj = obj[arguments[i]];
    }
    return (!obj && isNaN(obj)) ? '' : obj;
  },
  HELP: function(ctx,n,named,numbered) {
    var td = Template[ctx._0]._tmpl_data;
    var fn = first(td.helpers[n],Handlebars._default_helpers[n],ctx[n]);
    console.log(fn,numbered);
    var res = run(ctx,fn,numbered.concat(ctx));
    console.log('res',res,fn(7,34,4));
    return res;
  },
  BLOCK: function(ctx,n,yes,no,value) {
    var td = Template[ctx._0]._tmpl_data;
    var fn = Handlebars._default_helpers[n];
    if(!fn) return '';
    block = function(data){ return yes && yes.apply(_.extend({},ctx,data)) || ''};
    block.fn = block;
    block.inverse = function(data){ return no && no.apply(_.extend({},ctx,data)) || ''};
    var args = [value,block]
    var res = run(ctx,fn,args);
    return res;
  },
  ESC: function(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  RAW: function(s) {
    return new Handlebars.SafeString(s);
  }
}
