This is a fork of the original gulp-html2tpl by TJ Eastmond. It no longer uses
coffee script, it also supports subfolders. It uses wildcard 
package naming.


### Subfolders

When the `options.subfolders = true` is set, the 
html compiler from underscore templates, will 
attempt to match the `options.basepath` against the 
current file path and then construct the subfolders
as sub-object of `templates = {}`. See usage.


### Usage

```
  gulp.src(['static/partials/*.html', 'static/partials/*/*.html'])
      .pipe(html2tpl('templates.js', {
        variable:'data',
        basepath:path.resolve('static/partials'),
        subfolders:true,
        precompile:true,
        varName:"templates"
      }))
      .pipe(gulp.dest('static/dist'))

```

this will output a 'templates.js' file to `static/dist/templates.js`


```
    var templates = {}
    templates['template_name'] = function() {...}
    templates['subfolder'] = {};
    templates['subfolder']['template_name'] = function() {...}
```

## The License (MIT)
Copyright (c) 2014 TJ Eastmond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.