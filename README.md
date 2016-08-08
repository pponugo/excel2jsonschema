[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Dependency Status](https://dependencyci.com/github/pponugo/excel2jsonschema/badge)](https://dependencyci.com/github/pponugo/excel2jsonschema)

# Generate JSON Schema files from Excel Sheet

## Background
In Todays world, RESTful API's and **JSON** have become the format of choice for **APIs** and applications. Initillay, there was no common standard to describe the RESTful API's or request/response data strcutres on par with SOAP servcies (WSDL/XSD). To bring the same standards, [JSON Schema](http://json-schema.org/) came with specification and solved problem of describing RESTful API's clear, human- and machine-readable documentation.

However, JSON Schema is **trickier** to work with for many people. Creating the JSON Schema files **manually** is **cumbersome** and **error prone**. On other hand, tables are just simpler for people to understand and organize. More importantly, Excel provides great tools manipulating and organizing the table structure data.

## What is excel2jsonschema CLI tool?
The **excel2jsonschema** CLI tool, allows one to describe the JSON Schema in table format and the CLI tool generates JSON Schema files from table format (Excel Sheet).
###Example
####Input Excel
|Name|Property|Type|Description|
|----|--------|----|------------|
|Product|product_id|string|Unique identifier representing a specific product for a given latitude & longitude. For example, uberX in San Francisco| |will have a different product_id than uberX in Los Angeles.|
|Product|description|string|Description of product.|
|Product|display_name|string|Display name of product.|
|Product|capacity|string|Capacity of product. For example, 4 people.|
|Product|image|string|Image URL representing the product.|
####Output JSON Schema
```
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Product",
    "description": "Product",
    "type": "object",
    "properties": {
        "product_id": {
            "description": "Unique identifier representing a specific product for a given latitude & longitude. For example, uberX in San Francisco will have a different product_id than uberX in Los Angeles.",
            "type": "string"
        },
        "description": {
            "description": "Description of product.",
            "type": "string"
        },
        "display_name": {
            "description": "Display name of product.",
            "type": "string"
        },
        "capacity": {
            "description": "Capacity of product. For example, 4 people.",
            "type": "string"
        },
        "image": {
            "description": "Image URL representing the product.",
            "type": "string"
        }
    },
    "required": []
}
```

## Install
```npm install -g excel2jsonschema```

## Usage
```
How to Execute:
  excel2jsonschema -i ./sample.xls -s Schema -o ./dist

Usage: excel2jsonschema [options]
  Options:
  -i, --inputExcelFile <inputExcelFile>  'File Localtion' which contains Schema definations
  -s, --sheetName <sheetName>            'Sheet Name' which contains Schema definations
  -o, --outputDir <outputDir>            'Output Directory' where JSON Schema files should be generated## Install

```
## Examples
* [sample.xls](https://github.com/pponugo/excel2jsonschema/blob/master/example/sample.xls)
* [advanced-sample.xls](https://github.com/pponugo/excel2jsonschema/blob/master/example/advanced-sample.xls)
