import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const { method = 'GET', body, headers = {} } = options;
  
  // Para debugging
  console.log(`API Request: ${method} ${url}`);
  
  // Asegurarse que solo hay un /api al principio de la URL
  const apiUrl = url.startsWith('/api/') 
    ? url 
    : url.startsWith('/') 
      ? `/api${url}` 
      : `/api/${url}`;
  
  console.log(`Normalized URL: ${apiUrl}`);
  
  const res = await fetch(apiUrl, {
    method,
    headers: {
      ...headers,
      // Asegúrate de que la API sabe que esta es una solicitud AJAX
      "X-Requested-With": "XMLHttpRequest",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    // Esto es crucial - asegura que las cookies de sesión se envían con cada solicitud
    credentials: "same-origin",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      headers: {
        // Añadir encabezado para indicar que es una solicitud AJAX
        "X-Requested-With": "XMLHttpRequest"
      },
      // Usar same-origin para consistencia con apiRequest
      credentials: "same-origin",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
