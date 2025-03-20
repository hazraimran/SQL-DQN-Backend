import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getGeneratedQuery(
    promptTheme: string = "Matrix (Movie)",
    promptSchema: { tableName: string; columns: string[] } = {tableName: 'residue', columns: ['name', 'status']},
    promptConcepts: string[] = ["basic SELECT and FROM",]
    //  "basic WHERE clause", "pattern matching with LIKE", "handle NULL values", "ORDER BY clause", "INSERT Statement", "UPDATE Statement", "DELETE Statement", "basic TRANSACTION usage (ROLLBACK)", "basic TRANSACTION usage (COMMIT)"]
): Promise<string> {
    const prompt =
    `You are an expert in the field of teaching SQL concepts, and you are creating quizzes for your students. You have chosen the theme of ${promptTheme} and the schema of a table named ${promptSchema.tableName} with columns ${promptSchema.columns.join(", ")}. You have decided to focus on the following concepts: ${promptConcepts.join(", ")}. Generate 5 queries for each concept respectively. You can assume that the table ${promptSchema.tableName} already exists in the database. The queries should be engagingly related to the ${promptTheme}.`;

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "open-r1/olympiccoder-7b:free",
                messages: [{ role: "user", content: prompt }],
            }),
        }
    );
    const data = await response.json();
    const generatedQuery = data.choices[0].message.content;
    console.log("Generated query:", generatedQuery);

    // Store the query in src/resources/llm_queries.txt
    const filePath = path.join(__dirname, "..", "resources", "llm_queries.txt");
    fs.appendFileSync(filePath, generatedQuery + "\n");

    return generatedQuery;
}
