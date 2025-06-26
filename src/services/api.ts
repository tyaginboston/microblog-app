import type { Post, Comment, User } from '../types/api';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

async function fetchApi<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export async function fetchPosts(): Promise<Post[]> {
  return fetchApi<Post[]>(`${BASE_URL}/posts`);
}

export async function fetchPost(id: number): Promise<Post> {
  return fetchApi<Post>(`${BASE_URL}/posts/${id}`);
}

export async function fetchComments(postId: number): Promise<Comment[]> {
  return fetchApi<Comment[]>(`${BASE_URL}/posts/${postId}/comments`);
}

export async function fetchUsers(): Promise<User[]> {
  return fetchApi<User[]>(`${BASE_URL}/users`);
}

export async function fetchUser(id: number): Promise<User> {
  return fetchApi<User>(`${BASE_URL}/users/${id}`);
}

export async function fetchPostsByUser(userId: number): Promise<Post[]> {
  return fetchApi<Post[]>(`${BASE_URL}/posts?userId=${userId}`);
}
