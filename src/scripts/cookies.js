const setCookie = (cname, cvalue, minutes) => {
  var d = new Date()
  d.setTime(d.getTime() + (minutes * 60 * 1000))
  var expires = "expires="+ d.toUTCString()
  document.cookie = cname + "=" + cvalue + "; " + expires
}

const getCookie = (cname) => {
  var name = cname + "="
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length,c.length)
    }
  }
  return "";
}

module.exports = { setCookie, getCookie }
