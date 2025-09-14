import type { 
  ConversationListResponse, 
  ConversationCreateResponse, 
  ChatHistoryItem,
  Message
} from '@/types/chat'

// API Base URL - matches the mcp.json configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

class ChatApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: any
  ) {
    super(message)
    this.name = 'ChatApiError'
  }
}

// Helper function to safely parse error responses
async function parseErrorResponse(response: Response): Promise<{ message?: string; errors?: any }> {
  try {
    return await response.json()
  } catch {
    return { message: 'API request failed' }
  }
}

// Helper function to handle successful responses
async function parseSuccessResponse<T>(response: Response): Promise<T> {
  // Handle 204 No Content responses (common for DELETE operations)
  if (response.status === 204) {
    return {} as T
  }

  // Parse JSON for other successful responses
  try {
    return await response.json()
  } catch {
    // If JSON parsing fails, return empty object as fallback
    return {} as T
  }
}

async function makeApiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  accessToken?: string
): Promise<T> {
  const { method = 'GET', headers = {}, body } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw new ChatApiError(
        errorData.message || 'API request failed',
        response.status,
        errorData.errors
      )
    }

    // Handle successful responses
    return await parseSuccessResponse<T>(response)
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error
    }
    throw new ChatApiError(
      error instanceof Error ? error.message : 'Network error occurred'
    )
  }
}

// Transform API response to frontend format
function transformConversation(apiConversation: any): ChatHistoryItem {
  return {
    id: apiConversation.id,
    title: apiConversation.title,
    lastMessage: undefined, // Will be populated from messages if needed
    timestamp: new Date(apiConversation.last_message_at || apiConversation.created_at),
    messageCount: apiConversation.message_count,
    is_archived: apiConversation.is_archived,
    user: apiConversation.user,
    user_id: apiConversation.user_id,
    created_at: apiConversation.created_at,
    updated_at: apiConversation.updated_at,
    last_message_at: apiConversation.last_message_at,
  }
}

// Transform API message to frontend format
function transformMessage(apiMessage: any): Message {
  return {
    id: apiMessage.id.toString(),
    role: apiMessage.message_type === 'user' ? 'user' : 'assistant',
    content: apiMessage.content,
    timestamp: new Date(apiMessage.created_at),
    // Note: API doesn't provide knowledgeSource or metadata, so we'll leave them undefined
    // These can be added later if the backend supports them
  }
}

export const chatApi = {
  /**
   * Fetch all conversations for the authenticated user
   */
  async getConversations(accessToken: string): Promise<ChatHistoryItem[]> {
    const response = await makeApiRequest<ConversationListResponse>(
      '/chat/conversations/list/',
      { method: 'GET' },
      accessToken
    )

    return response.data.map(transformConversation)
  },

  /**
   * Create a new conversation
   */
  async createConversation(
    title: string,
    accessToken: string
  ): Promise<ChatHistoryItem> {
    const response = await makeApiRequest<ConversationCreateResponse>(
      '/chat/conversations/',
      {
        method: 'POST',
        body: { title }
      },
      accessToken
    )

    return transformConversation(response.data)
  },

  /**
   * Update a conversation (title, archive status, etc.)
   */
  async updateConversation(
    conversationId: number,
    updates: { title?: string; is_archived?: boolean },
    accessToken: string
  ): Promise<ChatHistoryItem> {
    const response = await makeApiRequest<ConversationCreateResponse>(
      `/chat/conversations/${conversationId}/update/`,
      {
        method: 'PATCH',
        body: updates
      },
      accessToken
    )

    return transformConversation(response.data)
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(
    conversationId: number,
    accessToken: string
  ): Promise<void> {
    await makeApiRequest(
      `/chat/conversations/${conversationId}/delete/`,
      { method: 'DELETE' },
      accessToken
    )
  },

  /**
   * Get conversation detail with messages
   */
  async getConversationDetail(
    conversationId: number,
    accessToken: string
  ): Promise<{ conversation: ChatHistoryItem; messages: Message[] }> {
    const response = await makeApiRequest<{
      success: boolean
      message: string
      data: {
        id: number
        title: string
        is_archived: boolean
        user: number
        created_at: string
        updated_at: string
        last_message_at: string | null
        messages: any[]
      }
    }>(
      `/chat/conversations/${conversationId}/`,
      { method: 'GET' },
      accessToken
    )

    return {
      conversation: transformConversation(response.data),
      messages: response.data.messages.map(transformMessage)
    }
  },

  /**
   * Get messages for a specific conversation
   */
  async getConversationMessages(
    conversationId: number,
    accessToken: string
  ): Promise<Message[]> {
    const response = await makeApiRequest<{
      success: boolean
      message: string
      data: any[]
    }>(
      `/chat/conversations/${conversationId}/messages/`,
      { method: 'GET' },
      accessToken
    )

    return response.data.map(transformMessage)
  },

  /**
   * Create a new message in a conversation
   */
  async createMessage(
    conversationId: number,
    content: string,
    accessToken: string
  ): Promise<{ assistantMessage?: Message }> {
    const response = await makeApiRequest<{
      success: boolean
      message: string
      data: {
        assistant_message?: any
      }
    }>(
      `/chat/conversations/${conversationId}/messages/create/`,
      {
        method: 'POST',
        body: { content }
      },
      accessToken
    )

    return {
      assistantMessage: response.data.assistant_message 
        ? transformMessage(response.data.assistant_message)
        : undefined
    }
  },
}

export { ChatApiError }
