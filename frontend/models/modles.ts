export interface UserRegister {
  user_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Permission {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  ID: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  images: string[];
  colors: string[];
  attributes: Record<string, string>;
  category_id: number;
  category: Category;
  tags: Tag[];
  sku: string;
  is_active: boolean;
  created_at: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  product?: Product;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  permission?: Permission[];
}

export interface ModelUser {
  ID: number;
  first_name: string;
  last_name: string;
  image: string;
  user_name: string;
  phone_number: string;
  date_of_birth: string;
  email: string;
  role_id: number;
  role: Role;
  favorites: Favorite[];
  created_at: string;
  updated_at: string;
}

export interface UpdateUser {
  email: string;
  first_name: string;
  last_name: string;
  image: string;
  phone_number: string;
  role_id: number;
  user_name: string;
}
