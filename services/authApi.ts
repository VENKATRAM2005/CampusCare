const AUTH_URL = "http://localhost:8080/api/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  name: string;
  email: string;
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return await response.json();
}