Plugin.registerSourceHandler("pencil", function(compileStep) {

  // XXX use archinfo rather than rolling our own
  if (! compileStep.arch.match(/^browser(\.|$)/))
    // XXX might be nice to throw an error here, but then we'd have to
    // make it so that packages.js ignores html files that appear in
    // the server directories in an app tree.. or, it might be nice to
    // make html files actually work on the server (against jsdom or
    // something)
    return;

  // XXX the way we deal with encodings here is sloppy .. should get
  // religion on that



  var contents = compileStep.read().toString('utf8');
  try {
    var results = template_scanner.scan(contents, compileStep.inputPath);
  } catch (e) {
    if (true || e instanceof template_scanner.ParseError) {
      compileStep.error({
        message: e.message,
        sourcePath: compileStep.inputPath,
        line: e.line
      });
      return;
    } else
      throw e;
  }

  if (results.head.length) compileStep.appendDocument({ section: "head", data: results.head.join('\n') });

  if (results.body) compileStep.appendDocument({ section: "body", data: results.body.join('\n') });

  // XXX generate a source map

  var code = '';
  if (results.body.length) {
    var text = results.body.join('\n');
    
    var compiled = 'function() { return ' + JSON.stringify (text) + '; }'
    console.log('cmp',compiled);
    code += "Meteor.startup(function(){" +
      "document.body.appendChild(Spark.render(" +
      "Template.__define__(null," + compiled + ")));});";
  }
  
  code += Object.keys(results.templates).map(function(n) {
    var t = results.templates[n];
    try {
      var compiled = 'function(data,args) { var tmpl='+JSON.stringify(n) + '; console.time("t");var res = ('+PencilParser.parse(t.source)+ ').apply(data,args); console.timeEnd("t"); return res}';
    } catch (e) {
      var lines = contents.slice(0,e.offset + t.offset).split('\n');
      compileStep.error({
        message: e.message,
        sourcePath: compileStep.inputPath,
        offset: e.offset + t.offset,
        line: lines.length,
        column: lines.pop().length
      })
      return;
    }
    return "Template.__define__(" + JSON.stringify(n) + ',' + compiled + ')\n';
  }).join('\n');

  if (!code.trim()) return;
  
  compileStep.addJavaScript({
    path: compileStep.inputPath+'.__compiled__.js',
    sourcePath: compileStep.inputPath,
    data: code
  });
});
