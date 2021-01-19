
// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga')

ga('create', 'UA-264464-79', 'auto')
ga('set', 'checkProtocolTask', null)

const contentURL = 'https://roblox-api.herokuapp.com/api/top'

let gamesData = []
let currentGameData
let chart = null

function loadGames (display = true) {
  fetch(contentURL).then(response => response.json())
    .then(data => {
      gamesData = data
      chrome.storage.local.set({ gameData: gamesData })
      if (display) {
        displayRandomGame()
      }
      //background-image: url("./images/game.jpg")
    })
    .catch(error => {
      console.error(error)
    })
}

function displayRandomGame () {

  // Move the selected game to the back of the list so wont see it again for a while
  const num = Math.floor(Math.random() * 8)
  const record = gamesData.splice(num, 1)[0]
  gamesData.push(record)

  currentGameData = record
  // Saves game data so reordered array is saved and wont see the game again for a while
  chrome.storage.local.set({ gameData: gamesData })

  ga('send', 'event', 'game', 'view-game', record.id)

  const gameLink = 'https://rbdash.dubitlimited.com/Roblox-Games/Game-Page?gameID=' + record.id
  const growthPercent = Math.round((record.growth / record.from) * 100, 0)

  document.getElementById('title').innerText = record.name
  document.getElementById('description').innerText = record.description
  document.getElementById('created').innerText = record.gameCreatedAt
  document.getElementById('favourites').innerText = record.favorites
  document.getElementById('visits').innerText = record.visits
  document.getElementById('play-button').setAttribute('href', gameLink)
  document.getElementById('top').style.backgroundImage = 'url("' + record.thumbs[0] + '")'
  document.getElementById('game-info').style.opacity = '1'
  document.getElementById('growth-rate').innerText = growthPercent.toLocaleString() + '% GROWTH'

  document.getElementById('bottom-content').classList.add('visible')
  document.getElementById('bottom-content').classList.remove('hidden')
  document.getElementById('top').classList.remove('hidden')
  document.getElementById('top').classList.add('visible')

  // Recently added so only show the chart the data exists
  if (record.visitData) {
    document.getElementById('growthChart').style.display = 'block'
    var ctx = document.getElementById('growthChart').getContext('2d')

    const labels = []
    const data = []
    for (const r of record.visitData) {
      labels.push(r[0])
      data.push(r[1])
    }

    if (chart) {
      chart.destroy()
    }
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '# of Plays',
          data: data,
          backgroundColor: [
            'rgba(0, 214, 143, 0.2)'
          ],
          borderColor: [
            'rgba(0, 214, 143, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        legend: {
          display: false
        },
        elements: {
          point: {
            radius: 3,
            pointHitRadius: 5,
            borderColor: 'rgba(0, 0, 0, 0)',
            backgroundColor: 'rgba(0, 0, 0, 0)'
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              display: false
            },
            gridLines: {
              display:false
            }
          }],
          xAxes: [{
            ticks: {
              display: false //this will remove only the label
            },
            gridLines: {
              display:false
            }
          }]
        },
        tooltips: {
          // Disable the on-canvas tooltip
          enabled: false,
          callbacks: {
            label: function (tooltipItem, data) {
              //return "Daily Ticket Sales: $ " + tooltipItem.yLabel
              return numeral(tooltipItem.yLabel).format('0.0a') + ' Plays'
            },
          },
          custom: function(tooltipModel) {
            // Tooltip Element
            var tooltipEl = document.getElementById('chartjs-tooltip')

            // Create element on first render
            if (!tooltipEl) {
              tooltipEl = document.createElement('div')
              tooltipEl.id = 'chartjs-tooltip'
              tooltipEl.innerHTML = '<table></table>'
              document.body.appendChild(tooltipEl)
            }

            // Hide if no tooltip
            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = 0
              return
            }

            // Set caret Position
            tooltipEl.classList.remove('above', 'below', 'no-transform')
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign)
            } else {
              tooltipEl.classList.add('no-transform')
            }

            function getBody (bodyItem) {
              return bodyItem.lines
            }

            // Set Text
            if (tooltipModel.body) {
              var titleLines = tooltipModel.title || []
              var bodyLines = tooltipModel.body.map(getBody)

              var innerHtml = '<thead>'

              titleLines.forEach(function (title) {
                innerHtml += '<tr><th>' + title + '</th></tr>'
              })
              innerHtml += '</thead><tbody>'

              bodyLines.forEach(function (body, i) {
                var colors = tooltipModel.labelColors[i]
                var style = 'background:' + colors.backgroundColor
                style += '; border-color:' + colors.borderColor
                style += '; border-width: 2px'
                var span = '<span style="' + style + '"></span>'
                innerHtml += '<tr><td>' + span + body + '</td></tr>'
              })
              innerHtml += '</tbody>'

              var tableRoot = tooltipEl.querySelector('table')
              tableRoot.innerHTML = innerHtml
            }

            // `this` will be the overall tooltip
            var position = this._chart.canvas.getBoundingClientRect()

            // Display, position, and set styles for font
            tooltipEl.style.opacity = 1
            tooltipEl.style.position = 'absolute'
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px'
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px'
            tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily
            tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px'
            tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle
            tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px'
            tooltipEl.style.pointerEvents = 'none'
          }
        }
      }
    })
  } else {
    loadGames(false)
  }
}

function listenToRefresh () {
  document.getElementById('refresh').addEventListener('mouseup', function () {
    document.getElementById('bottom-content').classList.add('hidden')
    document.getElementById('top').classList.add('hidden')
    setTimeout(function () {
      displayRandomGame()
      document.getElementById('bottom-content').classList.remove('hidden')
      document.getElementById('top').classList.remove('hidden')
    }, 200)

  })
}

document.getElementById('play-button').addEventListener('click', event => {
  ga('send', 'event', 'game', 'play-game', currentGameData.id)
})

document.addEventListener('DOMContentLoaded', function () {
  listenToRefresh()

  chrome.storage.local.get(['gameData'], function (result) {

    // 4 in 10 times load data from API. Speeds up page load and saves API hits
    var cacheBust = 100 * Math.random() > 60

    if (result.gameData) {
      gamesData = result.gameData
      displayRandomGame()

      if (cacheBust) {
        // Load new data, but don't display a new game.
        // Allows loading to happen in background without delaying displaying content.
        // This way only the first time the extension is installed is there any delay
        loadGames(false)
      }
    } else {
      loadGames()
    }
  })
})
