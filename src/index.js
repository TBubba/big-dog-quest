//
window.onload = function() {
  // Import(s)
  var SegmentManager = require('./SegmentManager.js');
  var Segment = require('./Segment.js');
  var Cookies = require('./Cookies.js');

  // Set up all segments of the video
  var segments = new SegmentManager();
  segments.add(new Segment('intro',     0,  11,  ['forest']));
  segments.add(new Segment('forest',   11,  33,  ['slippery', 'snowy', 'snowy2', 'mud']));
  segments.add(new Segment('slippery', 52,  58,  ['snowy', 'snowy2']));
  segments.add(new Segment('snowy',    90,  99,  ['snowy2', 'slippery', 'mud']));
  segments.add(new Segment('snowy2',   100, 108, ['slippery', 'snowy', 'mud']));
  segments.add(new Segment('mud',      115, 121, ['slippery', 'forest']));
  segments.current = segments.previous = 'intro'; // (Start at intro)

  // Check if skip intro cookie is set
  if (Cookies.get('skip_intro') === '1') {
    segments.setRandomCurrent(); // (Skip the intro - jumps to a random segment)
  }
  Cookies.set('skip_intro', '1', { expires: (60*60*24) }); // (1 day in seconds)

  // Setup interval that checks if the videos time has passed the end of the segment
  // (And switches to the next segment if that is the case)
  var isReady = false;
  function onFrame() {
    //
    if (isReady) {
      var time = VIDEO.getCurrentTime();
      var cur = segments.getCurrent();
      if (time > cur.end) {
        //console.log('Segment ended! (last segment:', cur, ')');
        segments.next();
        cur = segments.getCurrent();
        VIDEO.seekTo(cur.start, true);
        //console.log('New segment! (segment:', cur, ', time:', cur.start, ')');
        isReady = false;
      }
    }
  }
  setInterval(onFrame, 0);

  // Create video element
  var videoElement = document.createElement('div');
  videoElement.setAttribute('id', 'player_video');
  document.body.appendChild(videoElement);

  // Create audio element
  var audioElement = document.createElement('div');
  audioElement.setAttribute('id', 'player_audio');
  document.body.appendChild(audioElement);

  // Load Youtube iframe API
  var tag = document.createElement('script');
  tag.setAttribute('src', '//www.youtube.com/iframe_api');
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Callback when YouTubes iframe API has loaded
  var player;
  window.onYouTubeIframeAPIReady = function() {
    var video = window.VIDEO = new YT.Player('player_video', {
      height: '390',
      width: '640',
      playerVars: {
        controls: 0,
        loop: 1,
        rel: 0,
        disablekb: 1,
        start: 0,
        showinfo: 0,
      },
      videoId: 'cNZPRsrwumQ',
      events: {
        onReady: function(event) {
          //
          video.setVolume(0); // Disable audio
          video.mute();
          video.setPlaybackQuality('highres');
          video.seekTo(Math.max(0.0000001, segments.getCurrent().start), true);
          video.playVideo();
        },
        onStateChange: function(event) {
          var data = event.data;
          if (data === 3) { // (Video started buffering)
            isReady = false;
          }
          if (data === 1) { // (Video started playing))
            isReady = true;
          }
        }
      }
    });
    var audio = window.AUDIO = new YT.Player('player_audio', {
      height: '0',
      width: '0',
      playerVars: {
        start: 0
      },
      videoId: 'YWa-rWSsoZA',
      events: {
        onReady: function(event) {
          audio.setVolume(5); // Set volume
          audio.unMute();
          audio.setPlaybackQuality('small');
          audio.seekTo(0.0000001, true);
          audio.playVideo();
        }
      }
    });
  }
}
