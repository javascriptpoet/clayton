  Package.describe({
  name: 'jspoet:af-relations',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});
var both=['client','server'],
    client=['client'],
    server=['server'];

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'ecmascript',
    'underscore',
    'aldeed:autoform',
    'fortawesome:fontawesome',
    //'aldeed:tabular',
    'aslagle:reactive-table',
    'reactive-var',
      'mongo'
  ],both);
  api.use(['session','jquery','templating'],client);
  api.addFiles(['both.js'],both);
  api.addFiles(['templates.js','templates.html','stylesheet.css'],client);
  api.export(['jspAfRelations'],both);
});


Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('jspoet:af-relations');
  api.addFiles('af-relations-tests.js');
});
