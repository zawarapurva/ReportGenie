const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Set up the server
const app = express();
app.use(bodyParser.json());
app.use(cors())


const defaultPrompt1 = 'Based on name and description, recommend best fields from given fields. Separete fields by comma';
const defaultPrompt2 = 'Suggest a subset of fields from the given fields that will be best suitable for creating a report with the provided report name and description';
const defaultPrompt3 = 'Suggest a set of fields only from the provided fields that will be best suitable based on provided report name and report description';
const defaultPrompt4 = 'Which 10 relevant fields from the provided fields could be used to create a report with the provided report name and report description? Give me a comma separated list';

const defaultPrompt = defaultPrompt4;

// Set up the ChatGPT endpoint
app.post("/chat", async (req, res) => {

  console.log('req.body: ', req.body);
  let payloadInput = req.body;

  if(typeof payloadInput !== 'object'){
    console.log('Parsing JSON');
    payloadInput = JSON.parse(payloadInput);
  }

  // Get the prompt from the request
  
  const prompt = defaultPrompt;
  // console.log('payloadInput.prompt', payloadInput.prompt)
  console.log('payloadInput.name', payloadInput.name)
  console.log('payloadInput.description', payloadInput.description)
  console.log('payloadInput.fields', payloadInput.fields)

  // const promptToUse = 

  // if(!prompt){
  //   console.log('Returning bad response')
  //   res.status(400).json({ 
  //     error: {
  //       message: "Please enter a valid input",
  //     }
  //   });
  //   return;
  // }

  const reportName = payloadInput.name || '';
  const reportDesc = payloadInput.description || '';
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

  
  // Generate a response with ChatGPT
  // const completion = await openai.createCompletion({
  //   model: "text-davinci-002",
  //   prompt: prompt,
  // });
  // res.send(completion.data.choices[0].text);


  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(prompt, reportName, reportDesc, fields),
      temperature: 0.3,
//      max_tokens: null, // disable clipping
      max_tokens: 3000, // disable clipping
      stop: "END OF TEXT"
    });
    var result = completion.data.choices[0].text;
    console.log('Completion: ', completion.data)
    console.log('Result: ', result)
    res.status(200).json({ result });
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
});

function generatePrompt(prompt, reportName, reportDesc, fields) {  
  return `{
    "prompt": ${prompt}
    "name": ${reportName},
    "description": ${reportDesc},
    "fields":${fields}
    {Recommended fields}
  }
  `;
}

// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});