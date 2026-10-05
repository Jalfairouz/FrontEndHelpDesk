
import { LoginResponse, RegisterResponse , TicketDetails  , MeResponse
  , CreateTicketInput, TicketComment , Ticket, UpdateTicketInput, UserDetails, CreateUserInput
, ChangeUserRoleInput, ChangeUserStatusInput, UpdateUserInput, TicketStatus} from "@/types";
import { getToken, clearToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...options.headers,
    },
  });
  if (res.status === 401) {
    clearToken();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;

    try {
      const errorBody = await res.json();

      if (errorBody.message) {
        message = errorBody.message;
      } else if (errorBody.errors) {
        const firstError = Object.values(
          errorBody.errors
        )[0];

        message = Array.isArray(firstError)
          ? String(firstError[0])
          : message;
      }
    } catch {
    }

    throw new ApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function getUser(): Promise<any> {
  const response = await request("/api/auth/user");
  return response;
  
}
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  let data: any;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Login failed (${response.status})`
    );
  }

  if (!data?.accessToken) {
    throw new Error("لم يتم استلام accessToken من الـ Backend");
  }

  return data;
}




export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<RegisterResponse> {
  
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    }
  );

  let data: any;

  try {
    data = await response.json();
  } catch {
    data = {};
  }
if (!response.ok) {
    let errorMessage = "حدث خطأ أثناء التسجيل";

    if (data?.errors && typeof data.errors === 'object') {
      const allErrors: string[] = [];
      Object.values(data.errors).forEach((errorMessages: any) => {
        if (Array.isArray(errorMessages)) {
          allErrors.push(...errorMessages);
        } else {
          allErrors.push(errorMessages);
        }
      });
      errorMessage = allErrors.join(' | ');
    } 
    else if (data?.message) {
      errorMessage = Array.isArray(data.message) ? data.message.join(' | ') : data.message;
    } else if (data?.title) {
      errorMessage = data.title;
    }

    throw new Error(errorMessage);
}
  return data;
}

export async function getTickets(): Promise<Ticket[]> {
  return request<Ticket[]>("/api/tickets");
}
export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/users/me");
}
export async function createTicket(
  data: CreateTicketInput
): Promise<Ticket> {
  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getTicketById( ticketId: string): Promise<TicketDetails > {
  return request<TicketDetails >(
    `/api/tickets/${ticketId}`
  );
}
export async function updateTicket(ticketId: string, data: UpdateTicketInput): Promise<TicketDetails> {
  return request<TicketDetails>(
    `/api/tickets/${ticketId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<TicketDetails> {
  return request<TicketDetails>(
    `/api/tickets/${ticketId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function deleteTicket(ticketId: string): Promise<void> {
  return request<void>(
    `/api/tickets/${ticketId}`,
    {
      method: "DELETE",
    }
  );
}
export async function getCommentsByTicketId(ticketId: string): Promise<TicketComment[]> {
  return request<TicketComment[]>(
    `/api/tickets/${ticketId}/comments`
  );
}
export async function addCommentToTicket(ticketId: string, content: string): Promise<TicketComment> {
  return request<TicketComment>(
    `/api/tickets/${ticketId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }
  );
}
export async function getUsers(): Promise<UserDetails[]> {
  return request<UserDetails[]>("/api/users");
}
export async function getUserById(userId: string): Promise<UserDetails> {
  return request<UserDetails>(
    `/api/users/${userId}`
  );
}
export async function createUser(data: CreateUserInput): Promise<UserDetails> {
  return request<UserDetails>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function updateUser(userId: string, data: UpdateUserInput): Promise<UserDetails> {
  return request<UserDetails>(
    `/api/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
export async function changeUserRole(userId: string, data: ChangeUserRoleInput): Promise<UserDetails> {
  return request<UserDetails>(
    `/api/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function changeUserStatus(userId: string, data: ChangeUserStatusInput): Promise<UserDetails> {
  return request<UserDetails>(
    `/api/users/${userId}/active-status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}
export async function deleteUser(userId: string): Promise<void> {
  return request<void>(
    `/api/users/${userId}`,
    {
      method: "DELETE",
    }
  );
}