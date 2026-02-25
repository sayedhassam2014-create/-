
import { SocialPost, User, Comment, Product } from './types';

export const currentUser: User = {
  name: 'You',
  avatarUrl: 'https://i.pravatar.cc/150?u=me',
};

const sampleUsers: User[] = [
    { name: 'Alia', avatarUrl: 'https://i.pravatar.cc/150?u=alia'},
    { name: 'Khaled', avatarUrl: 'https://i.pravatar.cc/150?u=khaled'},
    { name: 'Fatima', avatarUrl: 'https://i.pravatar.cc/150?u=fatima'},
];

const sampleComments: Comment[] = [
    { id: 'c1', user: sampleUsers[0], text: 'Great look!' },
    { id: 'c2', user: sampleUsers[1], text: 'I like the coordination.' },
];

export const initialSocialPosts: SocialPost[] = [
  {
    id: 'post_001',
    user: sampleUsers[2],
    outfitImageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
    caption: 'Loving this new outfit! What do you think? 😍',
    likes: 124,
    comments: sampleComments,
  },
  {
    id: 'post_002',
    user: sampleUsers[1],
    outfitImageUrl: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
    caption: 'Ready for the weekend with this look.',
    likes: 88,
    comments: [{id: 'c3', user: sampleUsers[0], text: 'Very nice!'}],
  },
];

// Fix: Add topRatedProducts constant
export const topRatedProducts: Product[] = [
    {
      id: 'top_prod_001',
      name: 'Classic White T-Shirt',
      price: '£25.00',
      imageUrl: 'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 'top_prod_002',
      name: 'Slim-Fit Blue Jeans',
      price: '£60.00',
      imageUrl: 'https://images.pexels.com/photos/52573/jeans-pants-blue-shop-52573.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 'top_prod_003',
      name: 'Leather Biker Jacket',
      price: '£150.00',
      imageUrl: 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
];