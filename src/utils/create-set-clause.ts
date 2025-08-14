export const createSetClause = <T extends object>(data: T) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  return { keys, values, setClause };
};
