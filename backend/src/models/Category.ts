export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string; // Optional icon for the category
  color?: string; // Optional color for the category
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryInput {
  userId: string;
  name: string;
  icon?: string;
  color?: string;
}