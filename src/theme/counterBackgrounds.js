// Each background's circle* fractions are measured from the artwork's own
// pixel geometry so the tappable circle lines up with the one painted into
// the image, regardless of screen size.
export const COUNTER_BACKGROUNDS = [
  {
    id: 'default',
    name: 'Smart Tasbeh',
    image: require('../../assets/counter-background.png'),
    aspect: 941 / 1672,
    circleDiameterFrac: 0.549,
    circleCenterXFrac: 0.499,
    circleCenterYFrac: 0.602,
    chipsTopFrac: 0.03,
  },
];

export const getCounterBackground = (id) => COUNTER_BACKGROUNDS.find((bg) => bg.id === id) || COUNTER_BACKGROUNDS[0];
