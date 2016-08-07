var gulp = require('gulp')
var path = require('path')
var combiner = require('stream-combiner2')
var runSequence = require('run-sequence')
var del = require('del')
var jsonminify = require('gulp-jsonminify')
var prettify = require('gulp-jsbeautifier')
var generateJSONSchema = require('./lib/generate-json-schema')
var minimist = require('minimist')
var assert = require('assert')

var knownOptions = {
  string: ['inputExcelFile', 'sheetName', 'outputDir'],
  default: {
    inputExcelFile: 'input/Schema.xls',
    sheetName: 'Schema',
    outputDir: 'dist'
  }
}

var args = minimist(process.argv.slice(2), knownOptions)

gulp.task('clean', function () {
  return del(args.outputDir)
})

gulp.task('generate-json-schema', function () {
  // console.log(args)
  assert(args.inputExcelFile, 'Please provide Input Excel Sheet location')
  assert(args.sheetName, 'Please provide Sheet Name')
  assert(args.outputDir, 'Please provide Output dir location')
  return generateJSONSchema(path.join(__dirname, args.inputExcelFile), args.sheetName, path.join(__dirname, args.outputDir))
})

gulp.task('lint', function () {
  var combined = combiner.obj([
    gulp.src(['./dist/*.json']),
    jsonminify(),
    prettify(),
    gulp.dest(args.outputDir)
  ])
  combined.on('error', console.error.bind(console))
  return combined
})

gulp.task('default', function task (done) {
  runSequence('clean', 'generate-json-schema', 'lint', done)
})
