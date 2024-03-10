import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }
  console.log('req.body: ', req.body);

  let payloadInput = req.body;

  if(typeof payloadInput !== 'object'){
    console.log('Parsing JSON');
    payloadInput = JSON.parse(payloadInput);
  }

  const reportName = payloadInput.reportName || '';
  const reportDesc = payloadInput.reportDesc || '';
  const fields = payloadInput.fields || null;
  
  
  if (!reportName || !reportDesc || !fields){
    console.log('Returning bad response')
    res.status(400).json({
      error: {
        message: "Please enter a valid input",
      }
    });
    return;
  }

  console.log('Inputs: ', reportName, reportDesc, fields)

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(reportName, reportDesc, fields),
      temperature: 0.6,
    });
    var result = completion.data.choices[0].text;
    console.log('Result: ', result)
    res.status(200).json({ resultResponse:result });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(reportName, reportDesc, fields) {  
  return `Suggest best suitable fields based on ${reportName} and ${reportDesc} from given fields: ${fields}.

Report Name: Average cost of items
Description: Determine average cost of item
Fields: ${fields}
Suggested Fields:[{id: 134,label: "Actual Cost", type: "Currency"},{id: 134,label: "Actual Hours", type: "Numeric"}]
Report Name:: Status of items
Description: Understand status of records
Fields: ${fields}
Suggested Fields:[{id: 23,label: "Project Phase", type: "Text"},{id: 12,label: "Status",type: "Text - Multiple Choice"}]
Report Name: ${reportName}
Description: ${reportDesc}
Fields: ${fields}
Suggested Fields:`;
}
