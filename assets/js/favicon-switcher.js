;(function () {
  function collectLinks() {
    return Array.prototype.slice.apply(
      document.head.querySelectorAll('link[rel*="icon"]')
    )
  }

  function applyLink(source, target) {
    target.setAttribute('type', source.getAttribute('type'))
    target.setAttribute('href', source.getAttribute('href'))
  }

  function initSwitcher() {
    if (typeof window.matchMedia !== 'function') {
      return function noop() {}
    }

    var links = collectLinks()
    var current = document.createElement('link')
    current.setAttribute('rel', 'shortcut icon')
    document.head.appendChild(current)

    function matchFavicon() {
      var matched
      links.forEach(function (link) {
        if (window.matchMedia(link.media).matches) {
          matched = link
        }
      })
      if (matched) {
        applyLink(matched, current)
      }
    }

    // Apply once on load
    matchFavicon()

    // Listen for OS theme changes instead of polling
    var query = window.matchMedia('(prefers-color-scheme: dark)')
    if (query.addEventListener) {
      query.addEventListener('change', matchFavicon)
    } else if (query.addListener) {
      query.addListener(matchFavicon)
    }

    // Remove original link elements (they're managed by the switcher now)
    links.forEach(function (link) {
      document.head.removeChild(link)
    })

    return function unsubscribe() {
      if (query.removeEventListener) {
        query.removeEventListener('change', matchFavicon)
      } else if (query.removeListener) {
        query.removeListener(matchFavicon)
      }
      links.forEach(function (link) {
        document.head.appendChild(link)
      })
    }
  }

  initSwitcher()
})()
