export type ItemStatus = 'lost' | 'found';

export type StickyColor = string;

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  contact: string;
  status: ItemStatus;
  color: StickyColor;
  imageUrl?: string;
  createdAt: string;
  claimed?: boolean;
  claimerNickname?: string;
  claimDate?: string;
}

export interface FilterOptions {
  status: ItemStatus | 'all';
  search: string;
  sortBy: 'date' | 'title' | 'claimed';
  sortOrder: 'asc' | 'desc';
}
