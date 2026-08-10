import { Suspense } from 'react';
import { Brands } from '../../views/Brands';

export default function BrandsPage() {
  return (
    <Suspense>
      <Brands />
    </Suspense>
  );
}
