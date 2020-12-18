> NOTE: This is a very initial pass. Recommend waiting on first usage until fully tested. Updates coming shortly.

# 10up Audio component

[![Support Level](https://img.shields.io/badge/support-active-green.svg)](#support-level) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status][cli-img]][cli-url]

[cli-img]: https://github.com/10up/component-accordion/workflows/Automated%20Tests/badge.svg
[cli-url]: https://github.com/10up/component-accordion/actions?query=workflow%3A%22Automated+Tests%22

## Installation

### NPM

`npm install --save @10up/component-audio`

### Standalone

Clone this repo and import `audio.js` and `audio.css` from the `dist/` directory.

## API

### Methods
The following lists the latest supported callbacks. Each callback receives an instance of the player.

#### onplay
Fires when the audio has been started or is no longer paused
`onplay`: (playerInstance) => {}

#### onpause
Fires when the audio/video has been paused
`onpause: (playerInstance) => {}`

#### onerror
Fires when an error occurred during the loading of an audio
`onerror: (playerInstance) => {}`

#### onloadstart
Fires when the browser starts looking for the audio
`onloadstart: (playerInstance) => {}`

#### onended
Fires when the current playlist is ended
`onended: (playerInstance) => {}`

#### onplaying
Fires when the audio is playing after having been paused or stopped for buffering
`onplaying: (playerInstance) => {}`

#### onprogress
Fires when the browser is downloading the audio
`onprogress: (playerInstance) => {}`

#### onseeking
Fires when the user starts moving/skipping to a new position in the audio
`onseeking: (playerInstance) => {}`

#### onseeked
Fires when the user is finished moving/skipping to a new position in the audio
`onseeked: (playerInstance) => {}`

#### ontimeupdate
Fires when the current playback position has changed
`ontimeupdate: (playerInstance) => {}`

#### onvolumechange
Fires when the volume has been changed
`onvolumechange: (playerInstance) => {}`


### Properties
The following lists additional configurations accepted by the initialization object.

#### playLabel: string
Label for the play button
`playLabel: 'Play' // default`

#### stopLabel: string
Label for the stop button
`stopLabel: 'Stop' // default`

#### pauseLabel: string
Label for the pause button
`pauseLabel: 'Pause' // default`

#### muteLabel: string
Label for the mute button
`muteLabel: 'Mute' // default`

#### volumeLabel: string
Label for the volume button
`volumeLabel: 'Volume' // default`

#### scrubberLabel: string
Label for the scrubber slider
`scrubberLabel: 'Scrub Timeline' // default`

#### currentTimeLabel: string
Label for the current time
`currentTimeLabel: 'Current Time' // default`

#### totalTimeLabel: string
Label for the total time
`totalTimeLabel: 'Total Time' // default`


#### showMute: boolean
Maybe show the mute button
`showMute: true // default`

#### showStop: boolean
Maybe show the stop button
`showStop: true // default`

#### showTimer: boolean
Maybe show the timer control
`showTimer: true // default`

#### showVolume: boolean
Maybe show the volume control
`showVolume: true // default`

#### showScrubber: boolean
Maybe show the scrubber control
`showScrubber: true // default`

#### localStorage: boolean
Maybe enable localStorage. This allows a user to reload the page, and pickup where they last left off.
`localStorage: true // default`

#### debug: boolean
Maybe turn on debug mode. Debug mode outputs helpful information in the console window of the browser.
`debug: false // default`

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

const audioInstance = new Audio( '.audio', { ...options } );
```

### CSS

Coming soon

## Demo

Coming soon

## Tests

Coming soon

## Support Level

**Active:** 10up is actively working on this, and we expect to continue work for the foreseeable future including keeping tested up to the most recent version of WordPress.  Bug reports, feature requests, questions, and pull requests are welcome.

## Like what you see?

<a href="http://10up.com/contact/"><img src="https://10updotcom-wpengine.s3.amazonaws.com/uploads/2016/10/10up-Github-Banner.png" width="850"></a>
