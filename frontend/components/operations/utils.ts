export const parseMonetary = (value: string) => {
  if (!value) return 0;
  const normalised = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  const amount = Number(normalised);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
