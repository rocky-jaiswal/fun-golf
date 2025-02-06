export const getRandomInt = (max: number) => Math.floor(Math.random() * max);

export const getRandomIntBetween = (min: number, max: number) => {
  // The maximum and minimum are inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
