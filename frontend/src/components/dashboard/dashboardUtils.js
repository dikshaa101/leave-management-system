export function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

export function getMonthlyLeaveTrend(leaves) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
      count: 0,
    };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));

  leaves.forEach((leave) => {
    const rawDate = leave.appliedOn || leave.startDate;
    if (!rawDate) return;
    const date = new Date(rawDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap.has(key)) monthMap.get(key).count += 1;
  });

  return months;
}

export function getBalanceBands(employees) {
  const bands = [
    { label: '0-5', min: 0, max: 5, count: 0 },
    { label: '6-10', min: 6, max: 10, count: 0 },
    { label: '11-15', min: 11, max: 15, count: 0 },
    { label: '16+', min: 16, max: Infinity, count: 0 },
  ];

  employees.forEach((employee) => {
    const balance = Number(employee.leaveBalance || 0);
    const band = bands.find((item) => balance >= item.min && balance <= item.max);
    if (band) band.count += 1;
  });

  return bands;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
