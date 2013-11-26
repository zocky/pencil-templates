Pencil Templates for Meteor
===========================
Like Handlebars, but with expressions.

General
-------
This is a (not yet complete) reimplementation of Handlebars templates, extended to support JS-like expressions.
It does not share any code with Handlebars, but it uses helpers and block functions defined in Handlebars, so
all Handlebars templates should (eventually) work the same. 

It uses the old SPARK engine for now. In time, it will be upgraded to Meteor.UI and spacebars.

How-to
------
Put your templates in `.pencil` files. The rest happens automagically, as expected in Meteor.

The syntax is generally the same as in Handlebars, but you can use expressions:
    
    {{a}} plus one equals {{a+1}}.
    
    {{#if b>3}} b is a big number {{else}} b is no bigger than 3{{/if}}

If you define a helper for the `Session` object (e.g. using `Handlebars.registerHelper()`), you could do:
    
    {{#if Session.get('foo') == 'bar' }}

Expression syntax
-----------------
Expressions are generally the same as in JS, but:
* You can safely use dotted paths with undefined values, like in Handlebars (`undefined.foo` will not throw an error).
* Strings can span lines.
* There must not be any whitespace before `()` in function calls. This is required to allow helper arguments to
  be separated by space. 


Caveats
-------
Currently unsupported features of Handlebars:
* @variables - These don't work in Meteor's handlebars either, but would be nice.
* ../ and ./ access
* short-style comments `{{!...}}` - these clash with expressions 
  (i.e. with the negation operator `!`) and will not be supported.
  There will eventually be some sort of warning for this.

Currently unsupported features in expressions:
* You can include Array and Object literals, but not RegExps for now. Will probably change.
* No bitwise operators. Could change.

Also, error reporting is sketchy.
