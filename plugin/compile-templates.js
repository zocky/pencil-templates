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
    if (e instanceof template_scanner.ParseError) {
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
    
    code += "Meteor.startup(function(){" +
      "document.body.appendChild(Spark.render(" +
      "Template.__define__(null," + compiled + ")));});";
  }
  
  code += Object.keys(results.templates).map(function(n) {
    console.log(n,results.templates[n]);
    var compiled = PencilParser.parse(results.templates[n]);
    
    return "Template.__define__(" + JSON.stringify(n) + ", function(ctx){console.log(this,ctx); return (" + compiled + ").apply(ctx);})\n";
  }).join('\n');

  if (!code.trim()) return;
  
  console.log('code',code);

  compileStep.addJavaScript({
    path: compileStep.inputPath+'.__compiled__.js',
    sourcePath: compileStep.inputPath,
    data: code
  });
});
