'use strict'

// Go to the Cloud Status page when the icon is clicked
chrome.browserAction.onClicked.addListener(function () {
  chrome.tabs.create({ url: 'https://status.cloud.google.com/' })
})

var STATUS = {
  normal: {
    priority: 0,
    color: '#0DA960'
  },

  low: {
    priority: 1,
    color: '#FF9800'
  },

  medium: {
    priority: 2,
    color: '#FF9800'
  },

  high: {
    priority: 3,
    color: '#FF3300'
  }
}

var createIcon = function (color) {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  var size = 15

  context.beginPath()
  context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false)
  context.fillStyle = color
  context.fill()

  return context.getImageData(0, 0, size, size)
}

var updateIcon = function (status) {
  chrome.browserAction.setIcon({
    imageData: createIcon(status.color)
  })

  chrome.browserAction.setBadgeText({ text: status.priority > 0 ? '!' : '' })
}

var getStatus = function (incidents) {
  var incompleteIncidents = incidents.filter(function (incident) {
    return !incident.end
  })

  if (incompleteIncidents.length === 0)
    return STATUS.normal

  var mostSevereIncident = incompleteIncidents.sort(function (a, b) {
    var aPriority = STATUS[a.severity].priority
    var bPriority = STATUS[b.severity].priority

    if (aPriority > bPriority) return -1
    if (aPriority < bPriority) return 1
  })[0]

  return STATUS[mostSevereIncident.severity]
}

var refresh = function () {
  fetch('https://status.cloud.google.com/incidents.json')
    .then(function (resp) { return resp.json() })
    .then(getStatus)
    .then(updateIcon)

  var HOUR_MS = 1000 * 60 * 60
  setTimeout(refresh, HOUR_MS)
}

refresh()
