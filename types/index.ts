// 用户类型
export interface User {
  id: number
  username: string
  email: string
  nickname: string | null
  avatar: string | null
  bio: string | null
  role: 'user' | 'admin'
  status: number
  created_at: string
  updated_at: string
}

// 热点类型
export interface Hotspot {
  id: number
  title: string
  summary: string | null
  content: string | null
  source: string | null
  source_url: string | null
  category: string | null
  tags: string | null
  cover_image: string | null
  view_count: number
  like_count: number
  comment_count: number
  status: number
  published_at: string | null
  created_at: string
  updated_at: string
}

// 舆论分析类型
export interface Analysis {
  id: number
  title: string
  summary: string | null
  content: string | null
  hotspot_id: number | null
  category: string | null
  tags: string | null
  cover_image: string | null
  view_count: number
  like_count: number
  comment_count: number
  status: number
  published_at: string | null
  created_at: string
  updated_at: string
}

// 论述题类型
export interface Essay {
  id: number
  title: string
  subject: string | null
  question: string
  analysis: string | null
  answer: string | null
  keywords: string | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  tags: string | null
  view_count: number
  like_count: number
  favorite_count: number
  status: number
  published_at: string | null
  created_at: string
  updated_at: string
}

// 评论类型
export interface Comment {
  id: number
  user_id: number
  target_type: 'hotspot' | 'analysis' | 'essay'
  target_id: number
  content: string
  parent_id: number
  like_count: number
  status: number
  created_at: string
  user?: User
}

// 分类类型
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  type: 'hotspot' | 'analysis' | 'essay'
  sort_order: number
  status: number
  created_at: string
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}