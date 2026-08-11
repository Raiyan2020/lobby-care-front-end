import { Suspense } from 'react';
import { Welcome } from '../../views/Welcome';

// Welcome reads the `redirect` search param, so it needs a Suspense boundary
// for Next to prerender this route.
export default function WelcomePage() {
  return (
    <Suspense>
      <Welcome />
    </Suspense>
  );
}
