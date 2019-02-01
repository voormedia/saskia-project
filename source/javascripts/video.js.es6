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
    this.subtitles_src = args.subtitles
    this.summary = args.summary
    this.decisionEventListener()
  }

  initVideo() {
    this.element = document.createElement("video")
    this.element.src = this.src
    this.element.type = 'video/mp4'
    this.element.autoplay = false
    this.element.muted = false
    this.element.style.opacity = 0
    this.subtitles = document.createElement("track")
    this.subtitles.label = "English"
    this.subtitles.kind = "captions"
    this.subtitles.default = "true"
    this.subtitles.srclang = "en"
    this.subtitles.src = this.src.replace('.mp4', '.vtt').replace('videos', 'subtitles')
    this.element.append(this.subtitles)
    // this.element.textTracks.map(track => track,)
    this.element.textTracks[0].mode = "showing"

    this.element.oncanplay = () => {this.hideLoader()}
  }

  hideLoader() {
    document.getElementById('logo-main').classList.remove('hidden')
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
      this.initVideo()
      this.container.appendChild(this.element)
      $(window).trigger('resize')
    }
  }

  play() {
    this.finalVideoCallback(this.decisions.length)
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
    this.element.pause()
    this.element.currentTime = 0
    this.element.style.opacity = 0
    this.questionIsShowing = false
    this.element.classList.remove("active")
  }

  bufferNextVideos() {
    // Done loading
    if (this.element.readyState == 4) {
      this.decisions.map(decision => decision.buffer())
    } else {
      this.element.addEventListener('canplaythrough', () => { this.decisions.map(decision => decision.buffer())})
    }
  }
}
