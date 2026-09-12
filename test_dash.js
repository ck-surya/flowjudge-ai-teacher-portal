const fs = require('fs');
fetch('https://refutable-confound-parched.ngrok-free.dev/api/docs-json')
  .then(res => res.json())
  .then(data => {
    // Find the response schema for /api/teachers/dashboard
    const schema = data.paths['/api/teachers/dashboard'].get.responses['200'].content?.['application/json']?.schema;
    if (schema && schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      console.log(JSON.stringify(data.components.schemas[refName], null, 2));
    } else {
      console.log("No explicit schema found, try running fetch to get live data if you have auth.");
    }
  });
