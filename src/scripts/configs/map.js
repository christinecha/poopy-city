const styles = [
  {
    featureType: 'all',
    stylers: [
      { saturation: -80 }
    ]
  },
  {
    featureType: 'all',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'off' }
    ]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { hue: '#00ffee' },
      { saturation: 50 }
    ]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [
      { visibility: 'off' }
    ]
  }
]

module.exports = { styles }
