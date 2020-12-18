# 10up Audio component

[![Support Level](https://img.shields.io/badge/support-active-green.svg)](#support-level) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status][cli-img]][cli-url]

[cli-img]: https://github.com/10up/component-accordion/workflows/Automated%20Tests/badge.svg
[cli-url]: https://github.com/10up/component-accordion/actions?query=workflow%3A%22Automated+Tests%22

[View official documentation for this package](https://baseline.10up.com/component/audio)

## Installation

### NPM

`npm install --save @10up/component-audio`

[View official documentation for this package](https://baseline.10up.com/component/component-audio)

### Standalone

Clone this repo and import `audio.js` and `audio.css` from the `dist/` directory.

## API

The following lists the latest supported callbacks. Each callback receives an instance of the player.

 - `onplay`: Fires when the audio has been started or is no longer paused
 - `onpause`: Fires when the audio/video has been paused
 - `onerror`: Fires when an error occurred during the loading of an audio
 - `onloadstart`: Fires when the browser starts looking for the audio
 - `onended`: Fires when the current playlist is ended
 - `onplaying`: Fires when the audio is playing after having been paused or stopped for buffering
 - `onprogress`: Fires when the browser is downloading the audio
 - `onseeking`: Fires when the user starts moving/skipping to a new position in the audio
 - `onseeked`: Fires when the user is finished moving/skipping to a new position in the audio
 - `ontimeupdate`: Fires when the current playback position has changed
 - `onvolumechange`: Fires when the volume has been changed

The following lists additional configurations accepted by the initialization object.

```
{
	playLabel: 'Play',
	stopLabel: 'Stop',
	pauseLabel: 'Pause',
	muteLabel: 'Mute',
	volumeLabel: 'Volume',
	scrubberLabel: 'Scrub Timeline',
	currentTimeLabel: 'Current Time',
	totalTimeLabel: 'Total Time',
	showMute: true,
	showStop: true,
	showTimer: true,
	showVolume: true,
	showScrubber: true,
	debug: false,
	localStorage: true,
}
```

## Usage


This is the markup template expected by the component. Use an HTML audio player, wrapped with an element containing a class. Here we use a div with a class of 'audio'.

### Markup

 ```html
<div class="audio">
	<audio controls>
		<source src="path/to/audio-file.mp3" type="audio/mpeg">
		Your browser does not support the audio element.
	</audio>
</div> <!-- //.audio -->
 ```
### JavaScript

Create a new instance by supplying the selector to use for the audio and an object containing any necessary callback functions.

```javascript
import Audio from '@10up/component-audio';

const audioInstance = new Audio( '.audio', {
	onplay: player => console.log( 'custom play function', player ),
	onpause: player => console.log( 'custom pause function', player ),
	onstop: player => console.log( 'custom stop function', player ),
	onvolumechange: player => console.log( 'custom volume function', player ),
	debug: false,
} );
```

### CSS

Coming soon

## Demo

Example implementations at: https://10up.github.io/component-audio/demo/

## Tests

Coming soon

## Support Level

**Active:** 10up is actively working on this, and we expect to continue work for the foreseeable future including keeping tested up to the most recent version of WordPress.  Bug reports, feature requests, questions, and pull requests are welcome.

## Like what you see?

<a href="http://10up.com/contact/"><img src="https://10updotcom-wpengine.s3.amazonaws.com/uploads/2016/10/10up-Github-Banner.png" width="850"></a>
