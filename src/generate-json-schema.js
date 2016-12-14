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

  modelInfo = _.chain(modelInfo)
    .reject(value => value.Ignore)
    .groupBy(value => value['Name'])
    .value()

  modelInfo = _.chain(modelInfo)
    .mapValues((value, key) => {
      return {
        '$schema': 'http://json-schema.org/draft-04/schema#',
        title: key,
        description: key,
        type: 'object',
        properties: processProperties(value, modelInfo),
        required: processRequiredFields(value)
      }
    })
    .value()

  // write to files
  fs.emptyDirSync(outputDir)
  _.forEach(modelInfo, (value, key) => {
    jsonfile.writeFileSync(path.join(outputDir, _.kebabCase(key) + '.json'), value)
  })
}

function processProperties (value, modelInfo) {
  let properties = _.chain(value)
    .groupBy(value => value['Property'])
    .mapValues((value, key) => {
      return {
        description: value[0].Description,
        type: value[0].ParentType ? (_.lowerCase(value[0].ParentType) === 'array') ? 'array' : undefined : value[0].Type,
        items: processArrayItems(value[0]),
        // '$ref': (_.lowerCase(value[0].ParentType) === 'object') ? _.kebabCase(value[0].Type) + '.json#' : undefined,
        properties: (_.lowerCase(value[0].ParentType) === 'object') ? processChildProperties(value, modelInfo) : undefined,
        enum: value[0].EnumList ? _.chain(value[0].EnumList).trim('[').trimEnd(']').split(', ').value() : undefined,
        default: value[0].Default,
        format: value[0].Format,
        pattern: value[0].Pattern,
        maximum: value[0].Maximum,
        minimum: value[0].Minimum,
        maxLength: value[0].MaxLength,
        minLength: value[0].MinLength,
        maxItems: value[0].MaxItems,
        minItems: value[0].MinItems
      }
    })
    .value()
  return _.isEmpty(properties) ? undefined : properties
}

function processChildProperties (value, modelInfo) {
  return {
    "type": "object",
    properties: processProperties(modelInfo[value[0].Type], modelInfo)
  }
}

function processArrayItems (value) {
  if (_.lowerCase(value.ParentType) === 'array') {
    if (_.includes(primitiveTypes, _.lowerCase(value.Type))) {
      return {
        type: value.Type
      }
    } else {
      return {
        '$ref': _.kebabCase(value.Type) + '.json#'
      }
    }
  }
}

function processRequiredFields (value) {
  return _.chain(value)
    .filter(value => _.lowerCase(value.Required) === 'true')
    .map(value => value.Property)
    .value()
}
