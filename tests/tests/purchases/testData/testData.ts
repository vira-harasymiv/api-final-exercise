//A date one year in the future - satisfies the "must be in the future" rule for a promo code's expiresAt
export const futureDate = () =>
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

//Short unique promo code that stays within the 20-char limit regardless of prefix length
export const randomCode = (prefix: string) =>
  (prefix + Math.floor(Math.random() * 1_000_000)).toUpperCase().slice(0, 20);
