'use strict'
let _ = require('lodash')
let fs = require('fs-extra')
let path = require('path')
let jsonfile = require('jsonfile')
let XLSX = require('xlsx')
let assert = require('assert')

const primitiveTypes = ['boolean', 'integer', 'number', 'string']
jsonfile.spaces = 4
  // TODO: add validations
module.exports = function (inputExcelFile, sheetName, outputDir) {
  assert(inputExcelFile, 'Please provide Input Excel Sheet location')
  assert(sheetName, 'Please provide Sheet Name')
  assert(outputDir, 'Please provide Output dir location')

  console.log(`Generating json schema from ${inputExcelFile} to ${outputDir}`)
  let workbook = XLSX.readFile(inputExcelFile)
  let modelInfo = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

  // Group by Model Names
  let modelList = _.chain(modelInfo)
    .reject(value => value.Ignore)
    .groupBy(value => value['Name'])
    .value()

  // Generate JSON Examples
  let output = _.mapValues(modelList, (v) => generateJSON(v, modelList))

  // write to files
  fs.emptyDirSync(outputDir)
  _.forEach(output, (value, key) => {
    jsonfile.writeFileSync(path.join(outputDir, _.kebabCase(key) + '.json'), value)
  })
}

function generateJSON (model, modelList) {
  return _.reduce(model, (result, value, key) => {
    let jsonValue
    if (_.includes(primitiveTypes, _.lowerCase(value.Type))) {
      switch (value.Type) {
        case 'boolean':
          jsonValue = false
          break
        case 'string':
          jsonValue = value.Format === 'date-time' ? new Date() : 'example'
          break
        case 'number':
        case 'integer':
          jsonValue = -1
          break
        default:
      }
    } else if (modelList[value.Type]) {
      jsonValue = generateJSON(modelList[value.Type], modelList)
    } else {
      console.log('somthing wrong processing', value.Property)
    }
    if (_.lowerCase(value.ParentType) === 'array') jsonValue = [jsonValue]
    result[value.Property] = jsonValue
    return result
  }, {})
}
