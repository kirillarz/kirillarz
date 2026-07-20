export function wrapCarouselIndex(index: number, slideCount: number) {
  if (slideCount < 1) {
    throw new RangeError("slideCount must be positive");
  }

  return (index + slideCount) % slideCount;
}
