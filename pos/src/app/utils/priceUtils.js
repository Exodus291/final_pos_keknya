export const parsePrice = (priceString) => {
  if (typeof priceString === 'number') return priceString;
  return parseInt(priceString.replace(/[^\d]/g, '')) || 0;
};

export const calculateItemTotal = (item) => {
  const price = parsePrice(item.price);
  const quantity = parseInt(item.quantity) || 1;
  return price * quantity;
};

export const calculateOrderTotal = (foodItems = [], drinkItems = []) => {
  const foodTotal = foodItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const drinkTotal = drinkItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  return foodTotal + drinkTotal;
};
