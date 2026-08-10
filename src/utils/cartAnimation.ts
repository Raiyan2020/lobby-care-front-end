export function animateFlyToCart(
  sourceImage: HTMLImageElement | null,
  onComplete?: () => void
) {
  if (!sourceImage) {
    if (onComplete) onComplete();
    return;
  }
  
  const cartIcon = document.getElementById('header-cart-icon');
  if (!cartIcon) {
    if (onComplete) onComplete();
    return;
  }

  // Get positions
  const sourceRect = sourceImage.getBoundingClientRect();
  const targetRect = cartIcon.getBoundingClientRect();

  // Find the parent's border radius just in case the original border-radius was applied to an overflow hidden wrapper.
  const parent = sourceImage.parentElement;
  let borderRadius = '1rem';
  let parentBoxShadow = 'none';
  if (parent) {
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.borderRadius && parentStyle.borderRadius !== '0px') {
      borderRadius = parentStyle.borderRadius;
    } else {
      const imgStyle = getComputedStyle(sourceImage);
      if (imgStyle.borderRadius && imgStyle.borderRadius !== '0px') {
        borderRadius = imgStyle.borderRadius;
      }
    }
  }

  // Create wrapper to preserve overflow hidden for rounded corners
  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.top = `${sourceRect.top}px`;
  cloneWrapper.style.left = `${sourceRect.left}px`;
  cloneWrapper.style.width = `${sourceRect.width}px`;
  cloneWrapper.style.height = `${sourceRect.height}px`;
  cloneWrapper.style.zIndex = '9999';
  cloneWrapper.style.pointerEvents = 'none';
  cloneWrapper.style.borderRadius = borderRadius;
  cloneWrapper.style.overflow = 'hidden';
  cloneWrapper.style.boxShadow = parentBoxShadow;
  cloneWrapper.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)'; // smooth easing
  cloneWrapper.style.margin = '0';
  cloneWrapper.style.padding = '0';
  
  // Clone image
  const clone = sourceImage.cloneNode(true) as HTMLImageElement;
  clone.id = ''; // remove ID
  clone.style.width = '100%';
  clone.style.height = '100%';
  clone.style.position = 'absolute';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.objectFit = 'cover';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.transition = 'none'; // remove whatever hover transitions
  clone.style.transform = 'none'; // remove whatever hover scales
  
  cloneWrapper.appendChild(clone);
  document.body.appendChild(cloneWrapper);

  // Trigger animation next frame
  requestAnimationFrame(() => {
    // Provide a tiny delay to ensure first paint of clone
    setTimeout(() => {
      // Calculate delta to target center
      const deltaX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
      const deltaY = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);

      // We want the final size to be small enough
      const finalScale = 20 / Math.max(sourceRect.width, sourceRect.height);

      // Animate position, scale, opacity
      cloneWrapper.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${finalScale})`;
      cloneWrapper.style.opacity = '0.5';

      // After animation ends
      setTimeout(() => {
        cloneWrapper.remove();
        if (onComplete) onComplete();
        
        // Bounce the cart icon
        cartIcon.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
          cartIcon.style.transform = 'scale(1)';
        }, 200);
        
      }, 800);
    }, 50);
  });
}
