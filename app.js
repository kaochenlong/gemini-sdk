import { GoogleGenAI } from "@google/genai";
import { input } from "@inquirer/prompts";
import ora from "ora";

const ai = new GoogleGenAI({});
const spinner = ora("思考中..");

let question = await input({ message: "->" });
while (question.trim() != "") {
  if (question == "exit") {
    break;
  }

  spinner.start();
  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: question,
    config: {
      systemInstruction: "回答一律使用台灣繁體中文",
    },
  });
  spinner.stop();

  console.log(resp.text);

  question = await input({ message: "->" });
}
