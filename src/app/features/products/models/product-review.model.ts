export interface ProductReview {
  id: number;
  productId: number;
  userName: string;
  userEmail: string;
  rating: number; // Rating from 1 to 5
  comment: string;
  date: Date;
}
