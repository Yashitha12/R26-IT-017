const API_URL = "http://127.0.0.1:8000";

export async function predictLoan(loanData) {
  const response = await fetch(`${API_URL}/predict-loan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loanData),
  });

  if (!response.ok) {
    throw new Error("Loan prediction failed");
  }

  return response.json();
}