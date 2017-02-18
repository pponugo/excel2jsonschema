/* eslint-disable no-use-before-define, no-param-reassign */

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const jsonfile = require('jsonfile');
const XLSX = require('xlsx');
const assert = require('assert');

const primitiveTypes = ['boolean', 'integer', 'number', 'string', 'any'];
jsonfile.spaces = 4;
  // TODO: add validations
export default (inputExcelFile, sheetName, outputDir) => {
  assert(inputExcelFile, 'Please provide Input Excel Sheet location');
  assert(sheetName, 'Please provide Sheet Name');
  assert(outputDir, 'Please provide Output dir location');

  console.log(`Generating json schema from ${inputExcelFile} to ${outputDir}`);
  const workbook = XLSX.readFile(inputExcelFile);
  const modelInfo = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Group by Model Names
  const modelList = _.chain(modelInfo)
    .reject(value => value.Ignore)
    .groupBy(value => value.Name)
    .value();

  // Generate JSON Examples
  const output = _.mapValues(modelList, (v, k) => generateJSON(k, v, modelList));

  // write to files
  fs.emptyDirSync(outputDir);
  _.forEach(output, (value, key) => {
    jsonfile.writeFileSync(path.join(outputDir, `${_.kebabCase(key)}.json`), value);
  });
};

function generateJSON(modelName, model, modelList) {
  return _.reduce(model, (result, value) => {
    let jsonValue;
    if (_.includes(primitiveTypes, _.lowerCase(value.Type))) {
      if (value.Example) {
        jsonValue = value.Example;
      } else {
        switch (value.Type) {
          case 'any':
            jsonValue = {};
            break;
          case 'boolean':
            jsonValue = false;
            break;
          case 'string':
            jsonValue = value.Format === 'date-time' ? new Date() : 'example';
            break;
          case 'number':
          case 'integer':
            jsonValue = -1;
            break;
          default:
        }
      }
    } else if (modelList[value.Type]) {
      if (value.Relation) return result;
      jsonValue = generateJSON(value.Type, modelList[value.Type], modelList);
    } else {
      console.log('somthing wrong processing', value.Property);
      return result;
    }
    if (_.lowerCase(value.ParentType) === 'array') jsonValue = [jsonValue];
    result[value.Property] = jsonValue;
    return result;
  }, {});
}
