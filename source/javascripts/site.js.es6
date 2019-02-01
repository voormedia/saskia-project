//= require babel/polyfill

class InteractiveVideos {
  constructor(tree, container, options, placeholderText, location) {
    this.location = location
    this.placeholderText = placeholderText
    this.container = container
    this.options = options
    this.onLastVideo = false
    this.backgroundMusic = $('audio')[0]
    this.playedVideosButtons = []
    this.actionsContainer = document.getElementById('actions')
    if (jQuery.browser.mobile) {
      $('#mobile').show()
      $('#page').hide()
      this.hideLoader()
    } else {
      $('#mobile').hide()
      $('#page').css('display', 'flex')
      this.setClientInformation()
      this.getFilteredTree(tree)
      this.playList = [this.parseTree(this.filteredTree)]
      this.currentVideo = undefined
      this.updateCurrentVideo()
      this.attachEventHandlers()
    }
  }

  hideLoader() {
    document.getElementById('logo').classList.remove('hidden')
    document.getElementById('loader').classList.add('hidden')
    setTimeout(() => document.getElementById('loader').style.display = "none" , 500)
  }


  setClientInformation() {
    // test
    // this.location.city = "Amsterdam"
    // this.location.countryCode = "NL"
    if (this.location.city == "Amsterdam") {
      this.clientInformation = "ip_amsterdam"
    } else if (this.location.city == "Brabant") {
      this.clientInformation = "ip_brabant"
    } else if (this.location.countryCode == "NL") {

      const referrer = document.referrer

      // test
      // const referrer = "http://www.linkedin.com/"
      // const referrer = "http://www.google.com/"
      // const referrer = ""
      if (referrer.includes("google")) {
        this.clientInformation = "google"
      } else if (referrer.includes("linkedin")) {
        this.clientInformation = "linkedin"
      } else {
        this.clientInformation = "directlink"
      }
    } else {
      this.clientInformation = "ip_english_general"
    }
  }

  getFilteredTree(tree) {
    const decisions = tree.decisions.filter(decision => typeof(decision.condition) === "undefined" || decision.condition === this.clientInformation)
    this.filteredTree = decisions[0]
  }

  playPrevious() {
    this.pauseAllVideos()
    this.playList.pop()
    this.updateCurrentVideo(null, false, true)
    this.playVideo(true)
  }

  resetDecisions() {
    this.questionIsShowing = false
    this.actionsContainer.innerHTML = ""
    this.appendDecisions()
  }

  appendDecisions() {
    this.currentVideo.buttons.map(element => this.actionsContainer.append(element))
    let choice = this.playList[this.playList.length - 1].choice
    if (choice && this.playList.length > 2) {
      this.playedVideosButtons.forEach(function (playedButton) {
        this.actionsContainer.prepend(playedButton)
      }.bind(this));
    }
    this.actionsContainer.style.opacity = 1
  }

  pauseAllVideos() {
    this.playList.map(video => video.stop())
  }

  resizeVideo() {
    const windowWidth = $( window ).width()
    const windowHeight = $( window ).height()
    if ($('video.active').height() < windowHeight) {
      $('video').addClass('fullHeight')
      $('video').removeClass('fullwidth')
    } else if ($('video.active').width() < windowWidth) {
      $('video').addClass('fullwidth')
      $('video').removeClass('fullHeight')
    }
  }

  replayAll() {
    this.pauseAllVideos()
    this.playList = [this.playList[0]]
    this.playedVideosButtons = []
    this.updateCurrentVideo()
    document.getElementById('play').classList.remove('hidden')
    $('#play').show()
  }

  attachEventHandlers() {
    $(window).on('resize', () => {this.resizeVideo()})
    $('body').on('mouseenter','#call-to-action button',function(e){
      $('#call-to-action button').removeClass('active')
      $(e.target).addClass('active')
    });
    $('body').on('mouseleave','#call-to-action button',function(e){
      $('#call-to-action button').removeClass('active')
      $('#call-to-action button:first-child').addClass('active')
    });
    $('#replay-all').on('click', this.replayAll.bind(this))
    window.addEventListener('nextVideo', (e) => { this.updateCurrentVideo(e.detail, true) })
    document.getElementById('previous').addEventListener("click", (e) => { this.playPrevious() })
    document.getElementById('replay').addEventListener("click", (e) => { this.playVideo(true) })
    document.getElementById('play-button').addEventListener("click", (e) => { this.startVideo() })
  }

  startVideo() {
    document.getElementById('play').classList.add('hidden')
    setTimeout(() => $('#play').hide(),1000)
    this.backgroundMusic.play()
    this.backgroundMusic.volume = 0.10
    this.currentVideo.startVideo()
  }

  playVideo(play = false, previous = false) {
    clearInterval(this.decisionIntervalId)
    setTimeout(() => document.getElementById("progress").style.width = "100%" ,1000)

    this.currentVideo.play()
    this.resizeVideo()
    this.startCountdown()

    if (play) { this.currentVideo.startVideo()}

    if (!play) {
      if (previous) {
        this.playedVideosButtons.pop()
      } else {
        let choice = this.playList[this.playList.length - 1].choice
        if (choice && this.playList.length > 2) {
         this.generatePlayedDecisionsButtons(choice)
        }
      }
    }

    if (this.playList.length > 1) {
      setTimeout(() => this.resetDecisions(), 500)
      document.getElementById('actions-container').style.opacity = "0"
      document.getElementById('actions-container').classList.remove('slideInUp')
      document.getElementById('actions-container').classList.add('slideOutDown')

      document.getElementById('previous').style.opacity = "1"
      document.getElementById('previous').classList.add('bounceInLeft')

    } else {
      this.resetDecisions()
      document.getElementById('previous').style.opacity = "0"
      document.getElementById('previous').classList.remove('bounceInLeft')
    }
  }

  generatePlayedDecisionsButtons(choice) {
    const playedButton = document.createElement("span")
    const choiceText = document.createTextNode(choice)
    const checkIcon = document.createElement("i")
    checkIcon.classList.add('fa')
    checkIcon.classList.add('fa-check')
    playedButton.classList.add('active')
    playedButton.appendChild(checkIcon)
    playedButton.appendChild(choiceText)
    this.playedVideosButtons.push(playedButton)
  }

  updateCurrentVideo(video, play = false, previous = false) {
    if (video) { this.playList.push(video) }
    this.currentVideo = this.playList[this.playList.length - 1]
    this.playVideo(false, previous)
    if (play) { this.currentVideo.startVideo()}
  }

  decisionsToButtons(decisions) {
    return decisions.map((decision, index) => this.generateButton(decision.choice, index))
  }

  generateButton(choice, index) {
    const btn = document.createElement("BUTTON")
    const choiceText = document.createTextNode(choice)
    btn.setAttribute('id', 'decision-' + index)
    if (index == 0) { btn.classList.add('active')}
    btn.dataset.decision = index
    btn.appendChild(choiceText)
    return btn
  }

  startCountdown() {
    this.currentVideo.element.addEventListener('timeupdate', () => { this.updateCountdown() })
  }

  decisionCountdown(interval) {
    if (this.decisionTimer > 0) {
      this.decisionTimer -= interval
      document.getElementById("progress").style.width = (0 + (this.decisionTimer / this.decisionTotal * 100)) + "%"
    } else {
      document.getElementById('decision-0').click()
    }
  }

  updateCountdown() {
    countdown = Math.round(this.currentVideo.element.duration - this.currentVideo.element.currentTime)
    if (this.options.countdown) {
      const timeSpan = document.querySelector('#countdown span')
      timeSpan.innerText = countdown
    }

    if (countdown < 10 && !this.questionIsShowing){
      this.questionIsShowing = true
      document.getElementById('actions-container').style.opacity = 1
      if (!this.onLastVideo) {
        document.getElementById('actions-container').classList.remove('slideOutDown')
        document.getElementById('actions-container').classList.add('slideInUp')
        this.decisionTimer = this.decisionTotal = (this.currentVideo.element.duration >= 10 ? 10000 : this.currentVideo.element.duration * 1000)
        let interval = 10
        this.decisionIntervalId = setInterval(() => this.decisionCountdown(interval), interval)
      }
    }
  }

  showConclusionPage(decisionsLeft) {
    if (decisionsLeft == 0) {
      this.onLastVideo = true
      setTimeout(function() {
        $('#contact-page-container').addClass('active')
      }, this.currentVideo.element.duration * 1000)
    } else {
      this.onLastVideo = false
      $('#contact-page-container').removeClass('active')
    }
  }

  parseTree(tree) {
    const decisions = tree.decisions ? tree.decisions.map(decision => this.parseTree(decision)) : []
    const buttons = this.decisionsToButtons(decisions)
    return new Video(document.getElementById(this.container), this.showConclusionPage.bind(this), {
                                                                choice: tree.choice,
                                                                question: tree.question,
                                                                src: tree.video,
                                                                decisions: decisions,
                                                                buttons: buttons,
                                                                subtitles: tree.subtitles,
                                                                summary: tree.summary
                                                              })
  }
}



// const placeholderText = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et urna id sem ornare vehicula. Donec at hendrerit magna, ut pellentesque nibh. Ut sit amet commodo dui. Donec laoreet blandit neque ac aliquam. Vestibulum ut quam pretium, porttitor sem vel, sollicitudin nulla. Donec pretium felis vitae lectus sodales, a vehicula orci vehicula. Fusce dictum, tortor sed rutrum sodales, orci diam faucibus dolor, a pellentesque odio enim quis lacus."]
// new InteractiveVideos(tree, 'interactive-videos', { transition: "easeIn", delay: false, countdown: false }, placeholderText)

jQuery.getJSON("https://api.db-ip.com/v2/free/self", function(data) {
  const location = {
    country: data.countryName ? data.countryName : "",
    city: data.city ? data.city : ""
  }
  const placeholderText = []
  new InteractiveVideos(treeSaskia, 'interactive-videos', { transition: "easeIn", delay: false, countdown: false }, placeholderText, location)
});
