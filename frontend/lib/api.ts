// lib/api.ts

export async function askBackend(question: string): Promise<string> {
  try {
    const res = await fetch("https://sfdc-faiss.onrender.com/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.answer;
  } catch (err) {
    console.error("Backend query error:", err);
    throw err;
  }
}
