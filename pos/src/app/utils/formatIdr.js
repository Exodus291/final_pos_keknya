export const formatToIDR = (value) => {
  if (!value || value === 'Rp 0') return 'Rp 0';
  
  // Remove non-digits and convert to number
  const number = typeof value === 'string' ? 
    parseInt(value.replace(/\D/g, '')) : 
    value;

  // Format to IDR
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number).replace('IDR', 'Rp');
};

export const parseIDR = (formattedValue) => {
  if (!formattedValue) return 0;
  return parseInt(formattedValue.replace(/\D/g, ''));
};

export const sumPrices = (items) => {
  return items.reduce((sum, item) => 
    sum + parseIDR(item.price), 0
  );
};
