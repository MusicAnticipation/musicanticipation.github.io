(function () {

  const SAMPLES_ROOT = 'https://musicanticipation.github.io/samples';
  // Controls horizontal width (default 30)
  const PIXELS_PER_TIME_STEP = 49;
  // Controls vertical width
  const NOTE_HEIGHT = 3;

  const EXAMPLE_TITLES = {
    "demo-example-0": "Dua Lipa - Levitating",
    "demo-example-1": "The Beatles - Strawberry Fields Forever",
    "demo-example-2": "Schubert - Ave Maria",
  }

  const nav = playerEl.querySelector('.mynav');

  if (maxIdx === 1) {
    nav.style.display = 'none';
  }

  function getExampleTitle(playerId, idx) {
    const key = `${playerId}-${idx}`;
    let title = '';
    if (key in EXAMPLE_TITLES) {
      title = EXAMPLE_TITLES[key];
    }
    return title;
  }

  function updateUrl(anchor, navCurrentIdx) {
    const currentURL = new URL(window.location.href);
    const currentSearchParams = currentURL.searchParams;
    currentSearchParams.set('idx', String(navCurrentIdx));
    currentURL.hash = anchor;
    const newURL = `${currentURL.pathname}${currentURL.search}${currentURL.hash}`;
    history.pushState({}, '', newURL);
  }

  function changeDisplayedMidiTag(divEl, exampleTag) {
    const midiVisualizer = divEl.querySelector('midi-visualizer');
    const midiPlayer = divEl.querySelector('midi-player');
    const audioPlayer = divEl.querySelector('audio');
    const audioSource = divEl.querySelector('source');
    const midiSrc = `${SAMPLES_ROOT}/${exampleTag}.vis.mid`;
    const audioSrc = `${SAMPLES_ROOT}/${exampleTag}.mp3`;
    midiVisualizer.setAttribute('src', midiSrc);
    midiVisualizer.querySelector('div').scrollLeft = 0
    midiPlayer.setAttribute('src', midiSrc);
    audioPlayer.pause();
    audioSource.setAttribute('src', audioSrc);
    audioPlayer.load();
  }

  function refreshDisplayedMidi(divEl) {
    const linkEls = divEl.querySelectorAll('a');
    let selectedLinkEl = linkEls[0];
    for (let i = 0; i < linkEls.length; ++i) {
      if (linkEls[i].className == 'selected') {
        selectedLinkEl = linkEls[i];
        break;
      }
    }
    const exampleTagTemplate = selectedLinkEl.getAttribute('example');
    const navCurrentIdx = Number(divEl.querySelector('.nav-current').innerHTML) - 1;
    const exampleTag = exampleTagTemplate.replace('0-', `${navCurrentIdx}-`);
    changeDisplayedMidiTag(divEl, exampleTag);
    updateUrl(divEl.getAttribute('id'), navCurrentIdx + 1);
  }

  async function onDomReady() {
    // Initialize synchronized MIDI / audio playback visualizer
    const audioMidiPlayerTemplate = document.querySelector('#audio-midi-player-template');

    document.querySelectorAll('div.example-tabbed').forEach((divEl, i) => {
      // Get template attributes
      const playerId = divEl.getAttribute('id');
      const linkEls = divEl.querySelectorAll('a');
      const playerDivEl = divEl.querySelector('div.audio-midi-player');
      const exampleTag = playerDivEl.getAttribute('example');
      const minPitch = playerDivEl.getAttribute('min-pitch');
      const maxPitch = playerDivEl.getAttribute('max-pitch');
      const maxIdx = playerDivEl.getAttribute('max-idx');

      // Grab template elements
      const playerEl = audioMidiPlayerTemplate.content.cloneNode(true);
      const midiVisualizer = playerEl.querySelector('midi-visualizer');
      const midiPlayer = playerEl.querySelector('midi-player');
      const audioPlayer = playerEl.querySelector('audio');
      const audioSource = playerEl.querySelector('source');
      const navPrevious = playerEl.querySelector('.nav-previous')
      const navCurrent = playerEl.querySelector('.nav-current')
      const navMax = playerEl.querySelector('.nav-max')
      const navNext = playerEl.querySelector('.nav-next')
      const navTitle = playerEl.querySelector('.nav-title');

      // Configure MIDI player
      midiVisualizer.setAttribute('id', `audio-midi-player-${i}`);
      midiPlayer.setAttribute('visualizer', `#audio-midi-player-${i}`);
      const midiSrc = `${SAMPLES_ROOT}/${exampleTag}.vis.mid`;
      midiVisualizer.setAttribute('src', midiSrc);
      midiPlayer.setAttribute('src', midiSrc);

      // Configure audio player
      const audioSrc = `${SAMPLES_ROOT}/${exampleTag}.mp3`;
      audioSource.setAttribute('src', audioSrc);

      // Bind audio controls to MIDI player controls
      midiPlayer.addEventListener('load', function () {
        // Visualizer config
        config = {
          noteHeight: NOTE_HEIGHT,
          pixelsPerTimeStep: PIXELS_PER_TIME_STEP
        }
        if (minPitch !== null) {
          config['minPitch'] = Number(minPitch);
        }
        if (maxPitch !== null) {
          config['maxPitch'] = Number(maxPitch);
        }
        midiVisualizer.config = config

        // Player custom playback functionality
        const midiPlayerSeekBar = midiPlayer.shadowRoot.querySelector('.seek-bar');
        midiPlayerSeekBar.addEventListener('input', function () {
          audioPlayer.pause();
        });
        midiPlayerSeekBar.addEventListener('change', function () {
          audioPlayer.currentTime = midiPlayer.currentTime;
          if (midiPlayer.playing)
            audioPlayer.play();
        });
      })
      midiPlayer.addEventListener('start', function () {
        audioPlayer.currentTime = midiPlayer.currentTime;
        audioPlayer.play();
      });
      midiPlayer.addEventListener('stop', function () {
        audioPlayer.pause();
      });

      // Configure nav
      let navCurrentIdx = 0;
      navTitle.innerHTML = getExampleTitle(playerId, navCurrentIdx);
      navMax.innerHTML = maxIdx;
      navPrevious.onclick = function () {
        navCurrentIdx -= 1;
        if (navCurrentIdx < 0) navCurrentIdx += Number(maxIdx);
        navCurrent.innerHTML = navCurrentIdx + 1;
        navTitle.innerHTML = getExampleTitle(playerId, navCurrentIdx);
        refreshDisplayedMidi(divEl);
      }
      navNext.onclick = function () {
        navCurrentIdx += 1;
        if (navCurrentIdx >= maxIdx) navCurrentIdx -= Number(maxIdx);
        navCurrent.innerHTML = navCurrentIdx + 1;
        navTitle.innerHTML = getExampleTitle(playerId, navCurrentIdx);
        refreshDisplayedMidi(divEl);
      }

      // Configure links
      linkEls.forEach((a) => {
        a.onclick = function () {
          linkEls.forEach((_a) => { _a.className = ''; });
          a.className = 'selected';
          refreshDisplayedMidi(divEl);
        }
      });

      playerDivEl.appendChild(playerEl);
    });

    // Load specific example if present in URL
    const currentURL = new URL(window.location.href);
    const currentSearchParams = currentURL.searchParams;
    const idx = currentSearchParams.get('idx');
    const anchorEl = document.querySelector(currentURL.hash);
    if (idx !== null && anchorEl !== null) {
      anchorEl.querySelector('.nav-current').innerHTML = idx;
      refreshDisplayedMidi(anchorEl);
    }
  }

  document.addEventListener("DOMContentLoaded", onDomReady, false);
})();
