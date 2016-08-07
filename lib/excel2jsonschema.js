#!/usr/bin/env node

'use strict'

let args = require('commander')
let path = require('path')
let chalk = require('chalk')
let generateJSONSchema = require('./generate-json-schema')
let validationUtil = require('./validationUtil')

args.option('-i, --inputExcelFile <inputExcelFile>', '\'File Localtion\' which contains Schema definations', './input/Schema.xls')
  .option('-s, --sheetName <sheetName>', '\'Sheet Name\' which contains Schema definations', 'Schema')
  .option('-o, --outputDir <outputDir>', '\'Output Directory\' where JSON Schema files should be generated', './dist')
  .parse(process.argv)

let inputExcelFile = path.resolve('.', args.inputExcelFile)
let sheetName = args.sheetName
let outputDir = path.resolve('.', args.outputDir)

if (validationUtil(inputExcelFile, sheetName, outputDir)) {
  args.help()
} else {
  console.log(`\n inputExcelFile:${chalk.green(inputExcelFile)} \n sheetName:${chalk.green(sheetName)} \n outputDir:${chalk.green(outputDir)}\n`)
  generateJSONSchema(inputExcelFile, args.sheetName, outputDir)
}
