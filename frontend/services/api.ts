import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = __DEV__ ? "http://192.168.10.8:8000" : "http://192.168.10.8:8000";

const TOKEN_KEY = "auth_token";

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──

export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<User> {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<User> {
  return request("/users/me");
}

// ── Projects ──

export type Project = {
  id: number;
  name: string;
  description: string;
  company: string;
  ownerId: number;
  ndaIpfsHash: string;
  createdAt: string;
};

export async function getProjects(): Promise<Project[]> {
  return request("/projects");
}

export async function getProject(id: number): Promise<Project> {
  return request(`/projects/${id}`);
}

export async function createProject(data: {
  name: string;
  description: string;
  company: string;
  nda_text?: string;
}): Promise<Project> {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Members ──

export type Member = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  ndaSigned: boolean;
};

export async function getMembers(projectId: number): Promise<Member[]> {
  return request(`/projects/${projectId}/members`);
}

export async function inviteMember(
  projectId: number,
  email: string,
  role?: string,
): Promise<{ token: string; message: string }> {
  return request(`/projects/${projectId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

// ── Tasks ──

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  important: boolean;
  deadline: string | null;
  projectId: number;
  assigneeId: number | null;
  createdAt: string;
};

export async function getTasks(
  projectId: number,
  params?: { status?: string; important?: boolean },
): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.important !== undefined)
    query.set("important", String(params.important));
  const qs = query.toString();
  return request(`/projects/${projectId}/tasks${qs ? `?${qs}` : ""}`);
}

export async function createTask(
  projectId: number,
  data: {
    title: string;
    description?: string;
    status?: string;
    important?: boolean;
    deadline?: string;
  },
): Promise<Task> {
  return request(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  projectId: number,
  taskId: number,
  data: Partial<{
    title: string;
    description: string;
    status: string;
    important: boolean;
    deadline: string;
  }>,
): Promise<Task> {
  return request(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(
  projectId: number,
  taskId: number,
): Promise<void> {
  return request(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// ── Files ──

export type FileItem = {
  id: number;
  projectId: number;
  fileName: string;
  ipfsHash: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: string;
};

export async function getFiles(projectId: number): Promise<FileItem[]> {
  return request(`/projects/${projectId}/files`);
}

export async function uploadFile(
  projectId: number,
  file: { uri: string; name: string; type: string },
): Promise<FileItem> {
  const formData = new FormData();
  formData.append("file", file as any);
  return request(`/projects/${projectId}/files`, {
    method: "POST",
    body: formData,
  });
}

// ── Reports ──

export type Report = {
  id: number;
  projectId: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
};

export async function getReports(projectId: number): Promise<Report[]> {
  return request(`/projects/${projectId}/reports`);
}

export async function createReport(
  projectId: number,
  data: { title: string; content: string },
): Promise<Report> {
  return request(`/projects/${projectId}/reports`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── NDA ──

export async function getNdaAccess(
  projectId: number,
  token: string,
): Promise<{ project_name: string; nda_ipfs_hash: string; user_id: number }> {
  return request(`/projects/${projectId}/nda-access?token=${token}`);
}

export async function signNda(
  projectId: number,
  token: string,
  signatureBase64: string,
): Promise<{
  message: string;
  ipfsHash: string;
  ndaHash: string;
  txHash: string | null;
}> {
  return request(`/projects/${projectId}/nda-sign`, {
    method: "POST",
    body: JSON.stringify({
      token,
      signature_image_base64: signatureBase64,
    }),
  });
}
