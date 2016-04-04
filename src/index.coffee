gutil = require 'gulp-util'
through = require 'through'
path = require 'path'
async = require 'async'
_ = require 'underscore'

module.exports = (filename, opts) ->
	templates = []
	first = null
	options = _.extend
		varName: 'templates'
		precompile: true, opts

	clean = (string) -> string.replace /\n|\t/gi, ''
	escapeContent = (string) -> clean string.replace /"/gi, "\\\""

	compile = (callback) ->
		compiled = ["var " + options.varName + " = {};"]
		makeString = (file, done) ->
			val = if options.precompile is true
				clean _.template(file.content, opts).source
			else
				escapeContent file.content

			compiled.push options.varName + "['#{file.name}'] = #{val};"
			done null

		async.each templates, makeString, (error) -> callback null, compiled.join "\n"

	contents = (file) ->
		return yes if file.isNull()
		return @emit 'error', new gutil.PluginError 'gulp-html2obj', 'Steaming not supported' if file.isStream()
		first = file if file?
		templates.push
			name: path.basename file.path, path.extname(file.path)
			content: file.contents.toString 'utf-8'

	endStream = ->
		@emit 'end' if templates.length is 0
		compile (error, content) =>
			newFile = new gutil.File
				cwd: first.cwd
				base: first.base
				path: path.join first.base, filename
				contents: new Buffer content

			@emit 'data', newFile
			@emit 'end'

	through contents, endStream
