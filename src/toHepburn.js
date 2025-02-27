function toHepburn(str) {
  return str
    .replace(/l|x/g, '')
    .replace(/ti/g, 'chi')
    .replace(/tu/g, 'tsu')
    .replace(/si/g, 'shi')
    .replace(/zi/g, 'ji')
    .replace(/hu/g, 'fu')
    .replace(/sy/g, 'sh')
    .replace(/ty/g, 'ch')
    .replace(/zy/g, 'j');
};

module.exports = toHepburn;
