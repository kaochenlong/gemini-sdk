import { GoogleGenAI, Type } from "@google/genai";
import { input } from "@inquirer/prompts";
import ora from "ora";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const getDatetimeTool = {
  name: "get_current_datetime",
  description: "取得現在的日期與時間",
};

function getCurrentDateTime() {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
  });
}

function getWeather(city, location) {
  const results = ["晴", "雨", "颱風"];
  return { temp: Math.random() * 30 + 10, weather: results[getRandomInt(2)] };
}

function getCalendar(date) {
  return [];
}

const getCalendarTool = {
  name: "get_calendar",
  description: "查詢行事曆",
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: {
        type: Type.STRING,
        description: "日期",
      },
    },
    required: ["date"],
  },
};

const getWeatherTool = {
  name: "get_weather",
  description: "取得天氣資訊",
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: {
        type: Type.STRING,
        description: "城市名稱，例如台北或東京",
      },
      location: {
        type: Type.STRING,
        description: "地址",
      },
    },
    required: ["city"],
  },
};

const ai = new GoogleGenAI({});
const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  config: {
    systemInstruction:
      "你是一位不喜歡說話的助理，話不多，只會回答重點，話越少越好，回答一律使用台灣繁體中文",
    tools: [
      {
        functionDeclarations: [
          getDatetimeTool,
          getWeatherTool,
          getCalendarTool,
        ],
      },
    ],
  },
});

const spinner = ora("思考中..");

let question = await input({ message: "->" });
while (question.trim() != "") {
  if (question == "exit") {
    break;
  }

  spinner.start();
  const resp = await chat.sendMessage({ message: question });
  spinner.stop();

  if (resp.functionCalls?.length > 0) {
    // 執行！
    const result = resp.functionCalls.map((fc) => {
      switch (fc.name) {
        case "get_current_datetime":
          return getCurrentDateTime();
        case "get_calendar":
          return getCalendar(fc.args.date);
        case "get_weather":
          return getWeather(fc.args.city, fc.args.location);
      }
    });

    // 把查詢結果 → 人話
    const finalResp = await chat.sendMessage({
      message: JSON.stringify(result),
    });
    console.log(finalResp.text);
  } else {
    console.log(resp.text);
  }

  question = await input({ message: "->" });
}
