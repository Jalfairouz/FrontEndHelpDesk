import type {
  ChangeUserRoleInput,
  ChangeUserStatusInput,
  CreateTicketInput,
  CreateUserInput,
  LoginResponse,
  MeResponse,
  RegisterResponse,
  Technician,
  Ticket,
  TicketComment,
  TicketDetails,
  TicketStatus,
  UpdateTicketInput,
  UpdateUserInput,
  UserDetails,
} from "@/types";
import { clearToken, getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await res.json();

    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join(" | ")
        : String(body.message);
    }

    if (body?.errors && typeof body.errors === "object") {
      const all = Object.values(body.errors).flat().map(String);
      if (all.length > 0) return all.join(" | ");
    }

    if (body?.error) return String(body.error);
    if (body?.title) return String(body.title);
  } catch {
  }

  return fallback;
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function request<T>(
  path: string,
  { auth = true, ...options }: RequestOptions = {}
): Promise<T> {
  const token = auth ? getToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && auth) {
    clearToken();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new ApiError("Session expired", 401);
  }

  if (res.status === 403) {
    throw new ApiError("You don't have permission to do this.", 403);
  }

  if (!res.ok) {
    throw new ApiError(
      await readErrorMessage(res, `Request failed (${res.status})`),
      res.status
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}


export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

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
  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}




export async function getTickets(): Promise<Ticket[]> {
  return request<Ticket[]>("/api/tickets");
}

export async function getAssignedTickets(): Promise<Ticket[]> {
  return request<Ticket[]>("/api/tickets/assigned");
}

export async function getSystemTickets(params?: {
  status?: TicketStatus;
  unassigned?: boolean;
}): Promise<Ticket[]> {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.set("status", params.status);
  if (params?.unassigned !== undefined) {
    searchParams.set("unassigned", String(params.unassigned));
  }

  const query = searchParams.toString();

  return request<Ticket[]>(`/api/tickets/system${query ? `?${query}` : ""}`);
}

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTicketById(ticketId: string): Promise<TicketDetails> {
  return request<TicketDetails>(`/api/tickets/${ticketId}`);
}

export async function updateTicket(
  ticketId: string,
  data: UpdateTicketInput
): Promise<TicketDetails> {
  return request<TicketDetails>(`/api/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<TicketDetails> {
  return request<TicketDetails>(`/api/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTicket(ticketId: string): Promise<void> {
  return request<void>(`/api/tickets/${ticketId}`, { method: "DELETE" });
}

export async function assignTicketToTechnician(
  ticketId: string,
  technicianId: string
): Promise<TicketDetails> {
  return request<TicketDetails>(`/api/tickets/${ticketId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ technicianId }),
  });
}

export async function getCommentsByTicketId(
  ticketId: string
): Promise<TicketComment[]> {
  return request<TicketComment[]>(`/api/tickets/${ticketId}/comments`);
}

export async function addCommentToTicket(
  ticketId: string,
  content: string
): Promise<TicketComment> {
  return request<TicketComment>(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}




export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/users/me");
}

export async function getUsers(): Promise<UserDetails[]> {
  return request<UserDetails[]>("/api/users");
}

export async function getUserById(userId: string): Promise<UserDetails> {
  return request<UserDetails>(`/api/users/${userId}`);
}

export async function createUser(data: CreateUserInput): Promise<UserDetails> {
  return request<UserDetails>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<UserDetails> {
  return request<UserDetails>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeUserRole(
  userId: string,
  data: ChangeUserRoleInput
): Promise<UserDetails> {
  return request<UserDetails>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changeUserStatus(
  userId: string,
  data: ChangeUserStatusInput
): Promise<UserDetails> {
  return request<UserDetails>(`/api/users/${userId}/active-status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return request<void>(`/api/users/${userId}`, { method: "DELETE" });
}

export async function getTechnicians(): Promise<Technician[]> {
  return request<Technician[]>("/api/users/Technicians");
}