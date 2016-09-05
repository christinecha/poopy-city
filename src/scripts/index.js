// Import Modules
const mapConfig = require('./configs/map')
const { setCookie, getCookie } = require('./cookies')
require('./animatedLoad')

// Grab DOM Elements
const $warning = document.getElementById('warning')
const $titleInput = document.getElementById('title-input')
const $mapInput = document.getElementById('map-input')
const $rating = document.getElementById('rating')
const $ratingIcons = Array.from($rating.querySelectorAll('.rating-icon'))
const $map = document.getElementById('map')
const $submit = document.getElementById('submit')

// Set Up Google Maps Objects
const geocoder = new google.maps.Geocoder
const infowindow = new google.maps.InfoWindow
const autocomplete = new google.maps.places.Autocomplete($mapInput, {})

// Set Defaults
const defaultLatLng = { lat: 40.7128, lng: -74.0059 } // New York City. Center of the Universe.

// Set Variables
let chosenPlace
let rating = 0
let myMarker

/** SHARED FUNCTIONS ------------------------------ **/
const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(position => {
      const { accuracy, latitude, longitude } = position.coords
      const latlng = { lat: latitude, lng: longitude }
      const circle = new google.maps.Circle({
        center: latlng,
        radius: accuracy
      })

      autocomplete.setBounds(circle.getBounds())
      resolve(latlng)
    }, err => {
      resolve(null)
    })
  })
}


/* This function watches the value of /nodes and will
* fire the callback every time the value changes.
*/
const now = new Date().getTime()
const tenMinutesAgo = now - (1000 * 60 * 10)

const cleanMarkers = () => {
  firebase.database().ref('/poop-markers')
  .orderByChild('createdAt')
  .endAt(tenMinutesAgo)
  .once('value', snapshot => {
    const markers = snapshot.val()
    for (let i in markers) {
      firebase.database().ref(`/poop-markers/${i}`).remove()
    }
  })
}

const watchMarkers = (callback) => {
  firebase.database().ref('/poop-markers')
  .orderByChild('createdAt')
  .startAt(tenMinutesAgo)
  .on('value', snapshot => {
    const markers = snapshot.val()
    callback(markers)
  })
}

const warn = (msg) => {
  $warning.style.display = 'inline-block'
  $warning.innerText = msg

  setTimeout(() => {
    $warning.style.display = 'none'
  }, 3000)
}

$titleInput.addEventListener('keyup', e => {
  if (myMarker) myMarker.render()
})

$rating.addEventListener('click', e => {
  if (!e.target.classList.contains('rating-icon')) return

  $ratingIcons.forEach(icon => icon.classList.remove('is-selected'))
  e.target.classList.add('is-selected')
  rating = e.target.getAttribute('data-rating')
  if (myMarker) myMarker.render()
})

$submit.addEventListener('click', e => {
  e.preventDefault()

  if (!chosenPlace) {
    warn('Choose a location, silly!')
    return
  }

  if (getCookie('isPooping') === 'true') {
    warn('Hey, you said you\'re already pooping!')
    return
  }

  const poopy = {
    createdAt: new Date().getTime(),
    formatted_address: chosenPlace.formatted_address,
    geometry: {
      location: {
        lat: chosenPlace.geometry.location.lat(),
        lng: chosenPlace.geometry.location.lng()
      }
    },
    rating: parseInt(rating),
    title: $titleInput.value || ''
  }
  console.log(poopy)
  firebase.database().ref('/poop-markers').push(poopy)

  setCookie('isPooping', 'true', 10)

  $titleInput.value = ''
  $mapInput.value = ''
  rating = 0
  myMarker.hide()
})


class Marker {
  constructor(place, map) {
    this.map = map
    this.place = place
    this.formatted_address = place.formatted_address
    this.position = place.geometry.location

    this.marker = new google.maps.Marker({
      icon: './assets/poop-icon.png',
      position: this.position,
      map: this.map
    })
  }

  hide() {
    infowindow.close()
  }

  updatePlace(place) {
    this.position = place.geometry.location
    this.formatted_address = place.formatted_address
    this.marker.setPosition(this.position)
  }

  render() {
    this.map.panTo(this.position)
    this.map.setCenter(this.position)

    this.title = this.place.title || $titleInput.value
    this.rating = this.place.rating || rating

    infowindow.setContent(
      '<p>' + this.title + '</p>' +
      '<p class="xsmall">' + this.formatted_address + '</p>' +
      '<div class="rating-icon in-info-window" data-rating="' + this.rating + '"></div>'
    )
    infowindow.open(this.map, this.marker)
  }
}



/** RUN, FUNCTIONS, RUN ------------------------------ **/
console.log('----------------------------------------------------------------------')
console.log('source code ----> https://github.com/christinecha/poopy-city')
console.log('----------------------------------------------------------------------')


getBrowserLocation().then(latlng => {
  const poopMap = new google.maps.Map($map, {
    center: latlng || defaultLatLng,
    zoom: 14,
    styles: mapConfig.styles,
    streetViewControl: false
  })

  poopMap.addListener('click', e => {
    const latlng = { lat: e.latLng.lat(), lng: e.latLng.lng() }

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status !== 'OK' || !results[0]) return

      chosenPlace = results[0]
      if (myMarker) myMarker.updatePlace(chosenPlace)
      else myMarker = new Marker(chosenPlace, poopMap)
      myMarker.render()
      $mapInput.value = myMarker.formatted_address
    })
  })

  autocomplete.addListener('place_changed', e => {
    const place = autocomplete.getPlace()

    if (!place.geometry) return

    chosenPlace = place
    if (myMarker) myMarker.updatePlace(chosenPlace)
    else myMarker = new Marker(chosenPlace, poopMap)
    myMarker.render()
  })

  autocomplete.bindTo('bounds', poopMap)

  cleanMarkers()
  watchMarkers(markers => {
    if (!markers) return

    for (let i in markers) {
      const m = new Marker(markers[i], poopMap)
      m.marker.addListener('click', e => {
        m.render()
      })
    }
  })
})
