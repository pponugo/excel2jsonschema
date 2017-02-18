/* eslint-disable no-use-before-define, newline-per-chained-call, no-nested-ternary */

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const jsonfile = require('jsonfile');
const XLSX = require('xlsx');
const assert = require('assert');

const primitiveTypes = ['boolean', 'integer', 'number', 'string'];
jsonfile.spaces = 4;
  // TODO: add validations
export default (inputExcelFile, sheetName, outputDir) => {
  assert(inputExcelFile, 'Please provide Input Excel Sheet location');
  assert(sheetName, 'Please provide Sheet Name');
  assert(outputDir, 'Please provide Output dir location');

  console.log(`Generating json schema from ${inputExcelFile} to ${outputDir}`);
  const workbook = XLSX.readFile(inputExcelFile);
  let modelInfo = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  modelInfo = _.chain(modelInfo)
    .reject(value => value.Ignore)
    .groupBy(value => value.Name)
    .value();

  modelInfo = _.chain(modelInfo)
    .mapValues((value, key) => ({
      $schema: 'http://json-schema.org/draft-04/schema#',
      title: key,
      description: key,
      type: 'object',
      properties: processProperties(value, modelInfo),
      required: processRequiredFields(value),
    }))
    .value();

  // write to files
  fs.emptyDirSync(outputDir);
  _.forEach(modelInfo, (value, key) => {
    jsonfile.writeFileSync(path.join(outputDir, `${_.kebabCase(key)}.json`), value);
  });
};

function processProperties(value, modelInfo) {
  const properties = _.chain(value)
    .groupBy(value1 => value1.Property)
    .mapValues((value2) => {
      if (_.lowerCase(value2[0].ParentType) === 'object') {
        return processChildProperties(value2, modelInfo);
      }
      return {
        description: value2[0].Description,
        type: value2[0].ParentType ? (_.lowerCase(value2[0].ParentType) === 'array') ? 'array' : undefined : value2[0].Type,
        items: processArrayItems(value2[0], modelInfo),
        enum: value2[0].EnumList ? _.chain(value2[0].EnumList).trim('[').trimEnd(']').split(', ').value() : undefined,
        default: value2[0].Default,
        format: value2[0].Format,
        pattern: value2[0].Pattern,
        maximum: value2[0].Maximum,
        minimum: value2[0].Minimum,
        maxLength: value2[0].MaxLength,
        minLength: value2[0].MinLength,
        maxItems: value2[0].MaxItems,
        minItems: value2[0].MinItems,
      };
    })
    .value();
  return _.isEmpty(properties) ? undefined : properties;
}

function processChildProperties(value, modelInfo) {
  return {
    type: 'object',
    properties: processProperties(modelInfo[value[0].Type], modelInfo),
  };
}

function processArrayItems(value, modelInfo) {
  if (_.lowerCase(value.ParentType) === 'array') {
    if (_.includes(primitiveTypes, _.lowerCase(value.Type))) {
      return {
        type: value.Type,
      };
    }
    return {
      type: 'object',
      properties: processProperties(modelInfo[value.Type], modelInfo),
    };
  }
  return undefined;
}

function processRequiredFields(value) {
  return _.chain(value)
    .filter(value1 => _.lowerCase(value1.Required) === 'true')
    .map(value2 => value2.Property)
    .value();
}
