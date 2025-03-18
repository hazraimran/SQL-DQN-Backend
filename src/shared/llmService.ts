import dotenv from "dotenv";
dotenv.config();

export async function getGeneratedQuery(prompt: string = "What is the meaning of life?"): Promise<string> {
  // Call your LLM API here
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "open-r1/olympiccoder-7b:free",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await response.json();
//   console.log("Generated data:", data);
  const generatedQuery = data.choices[0].message.content;
  console.log("Generated query:", generatedQuery);
  return generatedQuery;
}

  