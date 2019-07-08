define({ "api": [  {    "type": "post",    "url": "/api/agreements/ngs/:provider_id",    "title": "Get Provider Earnings",    "version": "1.0.0",    "name": "Get_Earnings",    "group": "Agreements",    "permission": [      {        "name": "authenticated user"      }    ],    "parameter": {      "fields": {        "Request Params": [          {            "group": "Request Params",            "type": "String",            "optional": false,            "field": "provider_id",            "description": "<p>id of the provider to get earnings</p>"          }        ]      }    },    "examples": [      {        "title": "Example usage:",        "content": "const data = {\n  \"provider_id\": \"57e903941ca43a5f0805ba5a\"\n}\n\n$http.defaults.headers.common[\"Authorization\"] = token;",        "type": "js"      }    ],    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "message",            "description": "<p>successfully got the earnings!</p>"          },          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "success",            "description": "<p>true</p>"          }        ]      },      "examples": [        {          "title": "Success response:",          "content": "  HTTPS 200 OK\n  {\n   \"success\": true,\n   \"message\": \"successfully got the earnings!\",\n   \"data\": [\n{\n     \"_id\": \"5cbb02193fdd1541f48e3707\",\n     \"total_contracts\": 2,\n     \"total_revenue\": 10000,\n     \"total_earnings\": 8500,\n     \"overall_rating\": 4.85,\n     \"amount_due\": 825\n}\n]\n }",          "type": "json"        }      ]    },    "filename": "routes/agreements.js",    "groupTitle": "Agreements",    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "Unauthorized",            "description": "<p>Only authenticated users can access the endpoint.</p>"          }        ]      },      "examples": [        {          "title": "Unauthorized response:",          "content": "HTTP 401 Unauthorized\n{\n  \"message\": \"You are not authorized to access this endpoint\"\n}",          "type": "json"        }      ]    }  }] });
