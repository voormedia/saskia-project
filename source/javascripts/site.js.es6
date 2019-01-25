//= require babel/polyfill

class InteractiveVideos {
  constructor(tree, container, options, placeholderText, location) {
    // remove placeholder once we have content
    this.location = location
    this.placeholderText = placeholderText
    this.container = container
    this.options = options
    // this.questionContainer = document.getElementById('question')
    this.actionsContainer = document.getElementById('actions')
    // this.summaryContainer = document.getElementById('summary')
    this.setClientInformation()
    this.filterTree(tree)
    this.playList = [this.parseTree(this.filteredTree)]
    this.currentVideo = undefined
    this.updateCurrentVideo()
    this.resizeVideo()
    this.attachEventHandlers()
    // this.videoWidth = $('video').width()
  }

  // directlink, linkedin, ip_brabant, ip_amsterdam, ip_english_general, google
  setClientInformation() {
    this.location.city = "Amsterdam"
    this.location.country = "The Netherlands"

    if (this.location.city == "Amsterdam") {
      this.clientInformation = "ip_amsterdam"
    } else if (this.location.city == "Brabant") {
      this.clientInformation = "ip_brabant"
    } else if (this.location.country == "The Netherlands") {
      // live
      // const referrer = document.referrer

      // test
      // const referrer = "http://www.linkedin.com/"
      // const referrer = "http://www.google.com/"
      const referrer = ""

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

  filterTree(tree) {
    const decisions = tree.decisions.filter(decision => typeof(decision.condition) === "undefined" || decision.condition === this.clientInformation)
    this.filteredTree = decisions[0]
  }

  log(arg) {
    console.log(this.constructor.name, arg.callee.name, "()")
  }

  playPrevious() {
    this.log(arguments)
    this.pauseAllVideos()
    this.playList.pop()
    this.updateCurrentVideo()
    this.playVideo(true)
  }

  resetActions() {
    this.log(arguments)
    this.questionIsShowing = false
    this.actionsContainer.innerHTML = ""
    this.appendChoices()
  }

  appendSummary() {
    this.log(arguments)
    // Remove else statement once we have content
    if (this.currentVideo.choice) {
      const header = document.createElement("H2")
      const title = document.createTextNode(this.currentVideo.choice)
      header.appendChild(title)
      this.summaryContainer.append(header)
    }
    if (this.currentVideo.summary != undefined) {
      this.currentVideo.summary.map(summary => this.summaryContainer.append(this.generateParagraph(summary)))
    } else {
      this.placeholderText.map(summary => this.summaryContainer.append(this.generateParagraph(this.placeholderText)))
    }
  }

  generateParagraph(text) {
    this.log(arguments)
    const paragraph = document.createElement("P")
    paragraph.append(text)
    return paragraph
  }

  appendChoices() {
    this.log(arguments)
    this.currentVideo.buttons.map(element => this.actionsContainer.append(element))
    this.actionsContainer.style.opacity = 1
  }

  pauseAllVideos() {
    this.log(arguments)
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

  }

  attachEventHandlers() {
    $(window).on('resize', () => {this.resizeVideo()})
    this.log(arguments)
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

  toggleReplayButton(show) {
    if (show) {
      document.getElementById('replay').style.opacity = 1;
    } else {
      document.getElementById('replay').style.opacity = 0;
    }
  }

  startVideo() {
    document.getElementById('play').classList.add('hidden')
    this.currentVideo.startVideo()
  }

  playVideo(play = false) {
    clearInterval(this.decisionIntervalId)
    document.getElementById("progress").style.width = "0%"
    this.log(arguments)
    this.toggleReplayButton(false)
    this.currentVideo.play()
    this.resizeVideo()

    this.startCountdown()
    if (play) {
      this.currentVideo.startVideo()
    }
    console.log('Now playing: ', this.currentVideo)
    if (this.playList.length > 1) {
      setTimeout(() => this.resetActions(), 500)
      document.getElementById('actions-container').classList.remove('slideInUp')
      document.getElementById('actions-container').classList.add('slideOutDown')

      document.getElementById('previous').style.opacity = "1"
      document.getElementById('previous').classList.add('bounceInLeft')

    } else {
      this.resetActions()
      document.getElementById('previous').style.opacity = "0"
      document.getElementById('previous').classList.remove('bounceInLeft')
    }

  }

  updateCurrentVideo(video, play = false) {
    this.log(arguments)
    if (video) {
      this.playList.push(video)
    }

    this.currentVideo = this.playList[this.playList.length - 1]
    this.playVideo()
    if (play) {
      this.currentVideo.startVideo()
    }
  }

  decisionsToButtons(decisions) {
    return decisions.map((decision, index) => this.generateButton(decision.choice, index))
  }

  generateButton(choice, index) {
    const btn = document.createElement("BUTTON")
    const choiceText = document.createTextNode(choice)
    btn.setAttribute('id', 'decision-' + index)
    if (index == 0) {
      btn.classList.add('active')
    }
    btn.dataset.decision = index
    btn.appendChild(choiceText)
    return btn
  }

  decisionCountdown(interval) {
    if (this.decisionTimer > 0) {
      this.decisionTimer -= interval
      document.getElementById("progress").style.width = (100 - (this.decisionTimer / this.decisionTotal * 100)) + "%"
    } else {
      document.getElementById('decision-0').click()
    }
  }

  startCountdown() {
    this.log(arguments)
    this.currentVideo.element.addEventListener('timeupdate', () => { this.updateCountdown() })
  }

  updateCountdown() {
    this.log(arguments)
    countdown = Math.round(this.currentVideo.element.duration - this.currentVideo.element.currentTime)
    if (this.options.countdown) {
      const timeSpan = document.querySelector('#countdown span')
      timeSpan.innerText = countdown
    }

    if (countdown < 10 && !this.questionIsShowing){
      this.questionIsShowing = true
      document.getElementById('actions-container').style.opacity = 1
      document.getElementById('actions-container').classList.remove('slideOutDown')
      document.getElementById('actions-container').classList.add('slideInUp')
      this.decisionTimer = this.decisionTotal = (this.currentVideo.element.duration >= 10 ? 10000 : this.currentVideo.element.duration * 1000)
      let interval = 10
      this.decisionIntervalId = setInterval(() => this.decisionCountdown(interval), interval)
    }
  }

  showConclusionPage(decisionsLeft) {
    if (decisionsLeft == 0) {
      $('#contact-page-container').addClass('active')
    } else {
      $('#contact-page-container').removeClass('active')
    }
  }

  parseTree(tree) {
    const decisions = tree.decisions ? tree.decisions.map(decision => this.parseTree(decision)) : []
    const buttons = this.decisionsToButtons(decisions)
    return new Video(document.getElementById(this.container), this.showConclusionPage, {
                                                                choice: tree.choice,
                                                                question: tree.question,
                                                                src: tree.video.src,
                                                                decisions: decisions,
                                                                buttons: buttons,
                                                                summary: tree.summary
                                                              })
  }
}

class Video {
  constructor(container, finalVideoCallback, args) {
    this.container = container
    this.question = args.question
    this.finalVideoCallback = finalVideoCallback
    this.src = args.src
    this.choice = args.choice
    this.finishedLoading = false
    this.decisions = args.decisions
    this.buttons = args.buttons
    this.summary = args.summary
    this.hasAlreadyBeenPlayed = false
    console.log(this)
    this.decisionEventListener()
  }

  initVideo() {
    this.log(arguments)
    this.element = document.createElement("video")
    this.element.src = this.src
    this.element.type = 'video/mp4'
    this.element.autoplay = false
    this.element.muted = true
    this.element.style.opacity = 0
    // to remove once we have subtititles for all vids
    if (this.src == "/images/question1.mp4") {
      this.subtitles = document.createElement("track")
      this.subtitles.label = "English"
      this.subtitles.kind = "captions"
      this.subtitles.default = "true"
      this.subtitles.srclang = "en"
      this.subtitles.src = '/javascripts/question1.vtt'
      this.element.append(this.subtitles)
      // this.element.textTracks.map(track => track,)
      this.element.textTracks[0].mode = "showing"
    }

    this.element.oncanplay = () => {this.hideLoader()}
    console.log(this.element.textTracks[0])
    // this.element.style.transition = "opacity " + (this.options.delay / 1000) + "s" + " ease"
    // this.element.addEventListener('timeupdate', () => { this.updateCountdown() })
  }

  hideLoader() {
    document.getElementById('logo').classList.remove('hidden')
    document.getElementById('loader').classList.add('hidden')
    setTimeout(() => document.getElementById('loader').style.display = "none" , 500)
  }

  decisionEventListener() {
    this.buttons.map(button =>
      button.addEventListener("click", (e) => {
        this.stop()
        window.dispatchEvent( new CustomEvent('nextVideo', { detail: this.decisions[e.target.dataset.decision] }) )
      })
    )
  }

  buffer() {
    if (this.element == undefined) {
      this.log(arguments)
      this.initVideo()
      this.container.appendChild(this.element)
    }
  }

  play() {
    this.finalVideoCallback(this.decisions.length)
    this.log(arguments)
    this.buffer()
    this.element.style.opacity = 1
    this.element.classList.add('active')
    this.bufferNextVideos()
  }

  startVideo() {
    this.element.play()
  }

  log(arg) {
    console.log(this.constructor.name,arg.callee.name, "()")
  }

  stop() {
    this.log(arguments)
    this.element.pause()
    this.element.currentTime = 0
    this.element.style.opacity = 0
    this.questionIsShowing = false
    this.hasAlreadyBeenPlayed = true
    this.element.classList.remove("active")
  }

  bufferNextVideos() {
    this.log(arguments)
    if (this.element.readyState == 4) {
      this.decisions.map(decision => decision.buffer())
    } else {
      this.element.addEventListener('canplaythrough', () => { this.decisions.map(decision => decision.buffer())})
    }
  }

  // updateCountdown() {
  //   const timeSpan = document.querySelector('#countdown span')
  //   countdown = Math.round(this.element.duration - this.element.currentTime)
  //   if (countdown < 5 && !this.questionIsShowing){
  //     this.questionIsShowing = true
  //   }
  //   timeSpan.innerText = countdown
  // }
}

// const placeholderText = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et urna id sem ornare vehicula. Donec at hendrerit magna, ut pellentesque nibh. Ut sit amet commodo dui. Donec laoreet blandit neque ac aliquam. Vestibulum ut quam pretium, porttitor sem vel, sollicitudin nulla. Donec pretium felis vitae lectus sodales, a vehicula orci vehicula. Fusce dictum, tortor sed rutrum sodales, orci diam faucibus dolor, a pellentesque odio enim quis lacus."]
// new InteractiveVideos(tree, 'interactive-videos', { transition: "easeIn", delay: false, countdown: false }, placeholderText)

jQuery.getJSON("http://api.db-ip.com/v2/free/self", function(data) {
  const location = {
    country: data.countryName ? data.countryName : "",
    city: data.city ? data.city : ""
  }
  const placeholderText = []
  new InteractiveVideos(treeSaskia, 'interactive-videos', { transition: "easeIn", delay: false, countdown: false }, placeholderText, location)
});
