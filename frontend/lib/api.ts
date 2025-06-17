// lib/api.ts

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function askBackend(question: string): Promise<string> {
  try {
    const res = await fetch(`${backendUrl}/query`, {
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
