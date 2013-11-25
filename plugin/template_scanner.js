function parse (s,re,nn,t) {
  var c = re.source.split(/(?:^|[^\\])\((?!\?)/).length; //]/
  re = new RegExp('('+re.source+')',(re.multiline?'m':'')+(re.ignoreCase?'i':''))
  nn = ['whole'].concat(nn || []);
  var p = s.split(re);
  var ret = [];
  var pos = 0;
  for (var i = 0; i < p.length; i += c+1) {
    if (t) { var o = {pos:pos}; o[t] =  p[i]; ret.push(o); } pos+=p[i].length;
    if ( i+1 >= p.length ) break;
    var o = {pos:pos};
    for (var j = 0; j < c; j++) o[nn[j]||j]= p[i+j+1];
    ret.push(o);
    pos+=p[i+1].length;
  }
  return ret;
}


template_scanner = {
  // Scan a template file for <head>, <body>, and <template>
  // tags and extract their contents.
  // All other tags are treated as text.
  //
  // This is a primitive, regex-based scanner.  
  // It scans for tags and ignores all other top-level content.
  ParseError: function(msg,line){this.message=msg;this.line=line;},
  scan: function (contents, source_name) {
    var ret = { head:[],body:[], templates:{} };
    var parts = parse( contents,/<(\/?)\s*(head|body|template)\b([^>]*)>/i, ['close','tag','attr'], 'text' );
    var inside = false; 
    var open = null;
    try {
      for (var i = 0; i<parts.length; i++) { 
        var n = parts[i];
        if ('text' in n) continue;
        var nextn = parts[i+1];
      
        var t = n.tag.toLowerCase();
        if (n.close) {
          if (!open) throw 'unexpected close tag';
          if (t != open ) throw 'mismatched close tag, expecting </' + open + '>';
          open = null;
          continue;
        } else {
          if (open) throw 'cannot nest ' + n.tag + ' in ' + open;
          open = t;
          switch (t) {
          case 'body':
          case 'head':
            if (n.attr) throw 'attributes not supported';
            ret[t].push({
              source: nextn.text,
              offset: nextn.pos
            });
            break;
          case 'template':
            var aa = parse(n.attr,/([\w]+)\s*=\s*"([^"]*)"/,['name','value']);
            var name = null; for (var j in aa) if (aa[j].name == 'name') { name = aa[j].value; break };
            if (!name) throw 'template must have a name';
            aa.filter(function(a){return a.name.toLowerCase });
            ret.templates[name]={
              source: nextn.text,
              offset: nextn.pos,
            }
          }
        }
      }
    } catch (e) {
      if (typeof e == 'string') {
        var l = contents.slice(0,n.pos).split(/\n/);
        throw new template_scanner.ParseError(e + ' at line ' + l.length + ', col ' + (l.pop().length+1) +': ' + n.whole, l.length);
      }
      throw e;
    }
    return ret;
  }
};

// If we are running at bundle time, set module.exports.
// For unit testing in server environment, don't.
if (typeof module !== 'undefined')
  module.exports = html_scanner;
