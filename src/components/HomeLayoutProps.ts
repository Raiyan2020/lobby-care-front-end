// Shared props interface used by ALL home layout components
import type { ApiBanner, ApiCategory, ApiProduct, ApiBrand } from '../api/types';

export interface HomeLayoutProps {
  banners: ApiBanner[];
  categories: ApiCategory[];
  brands: ApiBrand[];
  featuredProducts: ApiProduct[];
  latestOffers: ApiProduct[];
  mostOrdered: ApiProduct[];
  isLoading?: boolean;
}
