export type TicketStatus = "Open" | "Closed" | "InProgress";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketType = "Incident" | "ServiceRequest";
export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Network"
  | "Access"
  | "Email"
  | "Security"
  | "Other";
export type UserRole = "Admin" | "Technician"| "Employee";
export type UserStatus = "Active" | "Inactive";
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
  createdByUserId: string;
  assignedTechnicianId: string | null;
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
}
export interface TicketDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  priority: string;
  status: string;
  createdByUserId: string;
  assignedTechnicianId: string | null;
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
  comments: TicketComment[];
  ticketHistories: TicketHistory[];
}


export interface TicketHistory {
  id: string;
  ticketId: string;
  performedByUserId: string;
  actionType: string;
  createdAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorUserId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
    ticketId: string;
  content: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  type: TicketType;
  category: TicketCategory;
}
export interface UpdateTicketInput {
  title?: string;
  description?: string;
  type?: TicketType;
  category?: TicketCategory;
  priority?: TicketPriority;

  status?: TicketStatus;
  comment?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}
export interface ChangeUserRoleInput {
  role: string;
}
export interface ChangeUserStatusInput {
  isActive: boolean;
}
export interface UpdateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  
}
export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}


export interface LoginInput {
    email: string;
    password: string;
}
export interface LoginResponse {
    token: string;
}
export interface ApiErrorResponse {
    message: string;
}


export interface UserDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    role: string;
}
export interface LoginResponse {
  accessToken: string;
}
export interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
}
export interface Technician {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
}