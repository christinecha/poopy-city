const messages = [
  'baking brownies...',
  'letting loose...',
  'making gravy...',
  'cleaning the tuba...',
  'feeding the fish...'
]

const $loadingMessage = document.getElementById('loading-message')

let index = 0
$loadingMessage.innerText = messages[index]

const handleTransitionEnd = () => {
  $loadingMessage.innerText = messages[index]
  $loadingMessage.style.opacity = 1
  $loadingMessage.removeEventListener('transitionend', handleTransitionEnd)
}

setInterval(() => {
  $loadingMessage.style.opacity = 0
  index ++
  if (!messages[index]) index = 0

  $loadingMessage.addEventListener('transitionend', handleTransitionEnd)
}, 4000)
