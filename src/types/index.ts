export type ItemStatus = 'lost' | 'found';

export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

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
}

export interface FilterOptions {
  status: ItemStatus | 'all';
  search: string;
  sortBy: 'date' | 'title';
}
