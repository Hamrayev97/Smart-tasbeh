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
  {
    id: 'kokota',
    name: "Koʻk Ota",
    image: require('../../assets/counter-background-kokota.jpg'),
    aspect: 1023 / 1537,
    circleDiameterFrac: 0.4423,
    circleCenterXFrac: 0.5029,
    circleCenterYFrac: 0.8041,
    chipsTopFrac: 0.02,
  },
  {
    id: 'khojaqorgon',
    name: 'Xoʻjaqoʻrgon',
    image: require('../../assets/counter-background-khojaqorgon.jpg'),
    aspect: 1023 / 1537,
    circleDiameterFrac: 0.3989,
    circleCenterXFrac: 0.4985,
    circleCenterYFrac: 0.8442,
    chipsTopFrac: 0.02,
  },
];

export const getCounterBackground = (id) => COUNTER_BACKGROUNDS.find((bg) => bg.id === id) || COUNTER_BACKGROUNDS[0];
