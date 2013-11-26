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
    var parts = PencilParser.parse(contents);
  } catch (e) {
    if (true || e instanceof parts.parseError) {
      var lines = contents.slice(0,e.offset).split('\n');
      compileStep.error({
        message: e.message,
        sourcePath: compileStep.inputPath,
        line: lines.length,
        column: lines.pop().length
      });
      return;
    } else throw e;
  } 
  var code = '';
  parts.forEach(function(n) {
    console.log(n.type, n.name, String(n.source));
    switch (n.type) {
    case 'head':
      compileStep.appendDocument({ section: "head", data: n.source({}) });
      break;
    case 'body': 
      code += "Meteor.startup(function(){" +
        "document.body.appendChild(Spark.render(" +
        "Template.__define__(null," + String(n.source) + ")));});";
      break;
    case 'template':
      console.log(n);
      code += "Template.__define__(" + JSON.stringify(n.name) +',' + String(n.source) + ');\n';
    }
  })
  
  if (!code.trim()) return;
  console.log('success',code);
  compileStep.addJavaScript({
    path: compileStep.inputPath+'.__compiled__.js',
    sourcePath: compileStep.inputPath,
    data: code
  });
});
