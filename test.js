const fetch = require("node-fetch");

async function testChat(query) {
  const response = await fetch("http://localhost:3001/chat-with-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  console.log("Response:", data);
}

testChat("What is the total spend in the last 30 days?");
