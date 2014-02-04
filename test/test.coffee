html2tpl = require '../index.js'
should = require 'should'
path = require 'path'
File = require('gulp-util').File
Buffer = require('buffer').Buffer

testFiles = ->
	fakeFile = new File
		cwd: '/home/tje'
		base: '/home/tje/test'
		path: '/home/tje/test/link.html'
		contents: new Buffer "<a href='index.html'><%= text %></a>"

	fakeFile2 = new File
		cwd: '/home/tje'
		base: '/home/tje/test'
		path: '/home/tje/test/flat.html'
		contents: new Buffer "<p>A boring template.</p>"

	{ fakeFile, fakeFile2 }

describe 'gulp-html2tpl', ->
	it 'should create an object containing templates', (done) ->
		stream = html2tpl 'templates.js'
		files = testFiles()

		stream.on 'data', (newFile) ->
			should.exist newFile
			should.exist newFile.path
			should.exist newFile.relative
			should.exist newFile.contents

			check = new RegExp /// ^
				var\stemplates\s=\s{};\n
				templates\['link'\]\s=\sfunction\(obj\){(.|\n)*?};\n
				templates\['flat'\]\s=\sfunction\(obj\){(.|\n)*?};
			$ ///i

			check.test(newFile.contents.toString()).should.be.true

			newFilePath = path.resolve newFile.path
			expectedFilePath = path.resolve '/home/tje/test/templates.js'
			newFilePath.should.equal expectedFilePath
			newFile.relative.should.equal 'templates.js'
			Buffer.isBuffer(newFile.contents).should.be.true
			done()

		stream.write files.fakeFile
		stream.write files.fakeFile2
		stream.end()

	it 'should change define the variable name', (done) ->
		stream = html2tpl 'templates.js', varName: 'underscoreTpls'
		files = testFiles()

		stream.on 'data', (newFile) ->
			should.exist newFile
			check = new RegExp /var\sunderscoreTpls\s=\s{};/i
			check.test(newFile.contents.toString()).should.be.true
			done()

		stream.write files.fakeFile
		stream.write files.fakeFile2
		stream.end()

	it 'should disable precompile', (done) ->
		stream = html2tpl 'templates.js', precompile: false
		files = testFiles()

		stream.on 'data', (newFile) ->
			should.exist newFile
			check = new RegExp ///templates\['flat'\]\s=\s<p>A\sboring\stemplate(.|\n)<\/p>;$///i
			check.test(newFile.contents.toString()).should.be.true
			done()

		stream.write files.fakeFile
		stream.write files.fakeFile2
		stream.end()
