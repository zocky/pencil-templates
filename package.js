Package.describe({
  summary: "Write your templates using Pencil Templates"
});

Package._transitional_registerBuildPlugin({
  name: "pencil-templates",
  use: ['templating','spark'],
  sources: [
    "plugin/pencil.js",
    "plugin/template_scanner.js",
    "plugin/compile-templates.js"
  ],
});

// This on_use describes the *runtime* implications of using this package.
Package.on_use(function (api) {

  api.imply(['meteor','spark','templating'], 'client');
  api.add_files(['runtime.js'],'client');
  api.export('Pencil');
});
