Package.describe({
  summary: "Write your templates using Pencil Templates"
});

Package._transitional_registerBuildPlugin({
  name: "pencil-templates",
  use: ['templating','spark'],
  sources: [
    "plugin/pencil-parser.js",
    "plugin/compile-templates.js"
  ],
});

// This on_use describes the *runtime* implications of using this package.
Package.on_use(function (api) {
  api.imply(['meteor','spark','handlebars'], 'client');
  api.add_files(['pencil-runtime.js'],'client');
  api.export('Pencil');
});

/*
Package.on_test(function (api) {
  api.use(['pencil','tinytest','test-helpers'], ['client','server']);
  api.add_files("plugin/pencil.js",'server');
  api.add_files(['pencil-test.js'],['client','server']);
});
*/
