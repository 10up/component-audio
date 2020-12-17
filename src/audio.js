/**
 * @module @10up/Audio
 *
 * @description
 *
 * Create an audio UI.
 *
 * @param {string} selector Element selector for audio container.
 * @param {object} options Object of optional callbacks.
 */
export default class Audio {
	/**
	 * Constructor method for this class.
	 *
	 * @param {string} selector class
	 * @param {object} options options object
	 */
	constructor(selector, options = {}) {
		// selector of class string required
		if (!selector || typeof selector !== 'string' || selector.indexOf('.') !== 0) {
			this.log("Be sure to pass in a valid class selector. ie: '.audio'", 'error');
			return;
		}

		// component prefix (used when logging)
		this.prefix = '@10up/Audio';

		// store className
		this.className = selector;

		// store name
		this.name = selector.substring(1);

		// list of supported native audio events used to define
		// available custom callbacks
		this.supportedNativeEvents = [
			'play',
			'pause',
			'error',
			'loadstart',
			'ended',
			'playing',
			'progress',
			'seeking',
			'seeked',
			'timeupdate',
			'volumechange',
		];

		// merge settings and options
		this.settings = {
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
			debug: false, // set true for console logging
			localStorage: true, // offline mode
			...options,
		};

		// Reference local storage
		this.localStorage = (this.settings.localStorage && window.localStorage) || null;

		this.initialize();
	}

	/**
	 * Logging when in debug mode
	 *
	 * @param {string} message message for console
	 * @param {string} messageType type of console to trigger
	 */
	log(message, messageType = 'log') {
		if (
			this.settings &&
			window.console &&
			window.console[messageType] &&
			typeof window.console[messageType] === 'function'
		) {
			window.console[messageType](
				`%c${this.prefix}:%c ${message}`,
				'background: red; color: white;',
				'background: white; color: black;',
			);
		}
	}

	/**
	 * Generate a unique id
	 *
	 * @returns {string} unique id
	 */
	uid() {
		return (performance.now().toString(36) + Math.random().toString(36)).replace(/\./g, '');
	}

	/**
	 * Initialization of player(s)–each player containing the selector class
	 * will pass through this initialize method
	 */
	initialize() {
		const elements = document.querySelectorAll(this.className);
		if (!elements.length) return;
		for (let i = 0, lng = elements.length, player; i < lng; i++) {
			player = elements[i].querySelector('audio');
			if (!player) {
				this.log(
					`No native <audio> element found in element containing class: ${this.className}`,
					'error',
				);
			} else {
				// builds out the custom player in the DOM (buttons, scrubbers, etc)
				this.addCustomAudioControls(elements[i], player);

				// add listeners to custom player controls
				this.addCustomEventListeners(elements[i], player);

				// add callbacks for all supported native events
				this.addAllowedCustomCallbacks(elements[i], player);

				// attempt to load from local storage
				player.addEventListener('loadedmetadata', () => this.maybeInitFromStorage(player));
			}
		}
	}

	/**
	 * Add a play button
	 *
	 * @param {object} element custom audio element
	 */
	addPlayButton(element) {
		this.appendTemplate(element, this.buttonFactory('play'));
	}

	/**
	 * Add a pause button
	 *
	 * @param {object} element custom audio element
	 */
	addPauseButton(element) {
		this.appendTemplate(element, this.buttonFactory('pause'));
	}

	/**
	 * Maybe add a volume button
	 *
	 * @param {object} element custom audio element
	 * @param {object} player player instance
	 */
	maybeAddVolumeButton(element, player) {
		if (this.settings.showVolume) {
			this.appendTemplate(element, this.volumeFactory());

			// set initial volume
			player.addEventListener('loadstart', () => this.volume(player));

			// volume change listener
			player.addEventListener('volumechange', (e) => this.volumechangeHandler(element, e));
		}
	}

	/**
	 * Maybe add a stop button
	 *
	 * @param {object} element custom audio element
	 */
	maybeAddStopButton(element) {
		if (this.settings.showStop) {
			this.appendTemplate(element, this.buttonFactory('stop'));
		}
	}

	/**
	 * Maybe add a mute button
	 *
	 * @param {object} element custom audio element
	 */
	maybeAddMuteButton(element) {
		if (this.settings.showMute) {
			this.appendTemplate(element, this.buttonFactory('mute'));
		}
	}

	/**
	 * Maybe add timer
	 *
	 * @param {object} element custom audio element
	 * @param {object} player player instance
	 */
	maybeAddTimer(element, player) {
		if (this.settings.showTimer) {
			this.appendTemplate(element, this.timerFactory('currentTime'));
			this.appendTemplate(element, this.timerFactory('totalTime'));

			// listen for when duration is known
			player.addEventListener('loadedmetadata', () =>
				this.timeupdateHandler(element, player),
			);

			// listen to time changes
			player.addEventListener('timeupdate', () => this.timeupdateHandler(element, player));
		}
	}

	/**
	 * Maybe add scrubber
	 *
	 * @param {object} element custom audio element
	 */
	maybeAddScrubber(element) {
		if (this.settings.showScrubber) {
			this.appendTemplate(element, this.scrubberFactory());
		}
	}

	/**
	 * Add custom audio controls to interface with the Audio component
	 *
	 * @param {object} element container housing <audio> player
	 * @param {object} player player instance
	 */
	addCustomAudioControls(element, player) {
		// Hide native controls
		player.removeAttribute('controls');

		// Add custom controls
		this.addPlayButton(element);
		this.addPauseButton(element);
		this.maybeAddStopButton(element);
		this.maybeAddMuteButton(element);
		this.maybeAddVolumeButton(element, player);
		this.maybeAddTimer(element, player);
		this.maybeAddScrubber(element);
	}

	/**
	 * Add custom event handler to custom control event listener
	 *
	 * @param {object} event event object
	 * @param {object} player player instance
	 */
	addCustomEventHandler(event, player) {
		const { target, type } = event;
		const action = target.getAttribute(`data-player-${type}`);

		if (action && this[action] && typeof this[action] === 'function') {
			this[action](player, target.value);
		}
	}

	/**
	 * Custom controls require handlers. This delegates listeners to the main
	 * custom audio container that wraps these custom controls
	 *
	 * @param {object} element container housing <audio> player
	 * @param {object} player <audio> player inside of the container
	 */
	addCustomEventListeners(element, player) {
		element.addEventListener('click', (e) => this.addCustomEventHandler(e, player));
		element.addEventListener('change', (e) => this.addCustomEventHandler(e, player));
		element.addEventListener('mousedown', (e) => this.maybeScrubbing(e, player));
		element.addEventListener('mouseup', (e) => this.maybeScrubbing(e, player));
	}

	/**
	 * Provides an API based on the supported native events.
	 * This method adds the 'on' callbacks and binds them to the supported native events
	 *
	 * @param {object} element container housing <audio> player
	 * @param {object} player player instance
	 */
	addAllowedCustomCallbacks(element, player) {
		// loop through supported events
		for (let i = 0, lng = this.supportedNativeEvents.length; i < lng; i++) {
			// if there is a registered custom callback, bind it to its native event
			if (
				typeof this.settings[`on${this.supportedNativeEvents[i]}`] !== 'undefined' &&
				typeof this.settings[`on${this.supportedNativeEvents[i]}`] === 'function'
			) {
				player.addEventListener(this.supportedNativeEvents[i], () =>
					this.customCallBackHandler(`on${this.supportedNativeEvents[i]}`)(player),
				);
			}
		}
	}

	/**
	 * Fetch and set player instance values from local storage.
	 * Data is saved to the audio src key
	 *
	 * @param {object} player <audio> player inside of the container
	 */
	maybeInitFromStorage(player) {
		// If no local storage exit
		if (!this.localStorage) return;

		// every time change, cache the player
		player.addEventListener('timeupdate', () => this.saveToStorage(player));

		// Destructure currentSrc from player instance as key ref from storage
		const { currentSrc } = player;

		// Fetch player values from localStorage
		const cache = this.localStorage.getItem(currentSrc);

		// Destructure values from cache
		const { time = null, volume = null, paused = null } = JSON.parse(cache);

		if (time) {
			this.currentTime(player, time);
		}

		if (volume) {
			this.volume(player, volume);
		}

		if (paused) {
			this.pause(player);
		}
	}

	/**
	 * All custom callbacks pipe through here first. This normalizes a
	 * safety check to test if the method exists, and also sets up
	 * a player parameter that is provided to each custom event handler
	 *
	 * @param {string} eventName Name of event callback to trigger
	 * @returns {null|Function} Callback method or undefined
	 */
	customCallBackHandler(eventName = null) {
		// Exit if no eventName provided
		if (!eventName || typeof eventName !== 'string') return null;

		return (player) => this.settings[eventName](player);
	}

	/**
	 * Used to save the player instance values to local storage.
	 *
	 * @param {object} player <audio> player inside of the container
	 */
	saveToStorage(player) {
		const { currentSrc } = player;
		this.localStorage.setItem(
			currentSrc,
			JSON.stringify({
				time: this.getCurrentTime(player),
				volume: this.getCurrentVolume(player),
				paused: this.getPaused(player),
			}),
		);
	}

	/**
	 * Used to calculate hours from seconds
	 *
	 * @param {number} time seconds
	 * @returns {number|null}
	 */
	getHours(time) {
		if (time >= 3600) {
			return time / 3600;
		}
		return null;
	}

	/**
	 * Used to calculate minutes from seconds
	 *
	 * @param {number} time seconds
	 * @returns {number|null}
	 */
	getMinutes(time) {
		if (time >= 60) {
			return time / 60;
		}
		return null;
	}

	/**
	 * Used to return time string hh:mm:ss
	 *
	 * @param {number} time time in seconds
	 * @returns {string} {hh:}mm:ss
	 */
	getTimeFormat(time) {
		// initialize hours, minutes, seconds
		let hoursPassed = this.getHours(time) || '';
		let minutesPassed;
		let secondsPassed;

		// minutes and seconds
		if (hoursPassed) {
			hoursPassed = `${Math.floor(hoursPassed)}:`;
			minutesPassed = Math.floor(this.getMinutes(time % 3600)) || '';
			secondsPassed = Math.floor((time % 3600) % 60);
		} else {
			minutesPassed = Math.floor(this.getMinutes(time)) || '';
			secondsPassed = Math.floor(time % 60);
		}

		// prefixes '0' if required
		minutesPassed = hoursPassed ? `0${minutesPassed}` : minutesPassed;
		secondsPassed = secondsPassed < 10 ? `:0${secondsPassed}` : `:${secondsPassed}`;

		// return literal
		return `${hoursPassed}${minutesPassed}${secondsPassed}`;
	}

	/**
	 * Handle the timeupdate event
	 *
	 * @param {object} element player container
	 * @param {object} player native player instance
	 */
	timeupdateHandler(element, player) {
		const currentTimeInSeconds = this.getCurrentTime(player);
		const currentTimeFormat = this.getTimeFormat(currentTimeInSeconds);
		const totalTimeInSeconds = this.getDuration(player);
		const totalTimeFormat = this.getTimeFormat(totalTimeInSeconds);

		const currentTimeElement = element.querySelector(`${this.className}__currentTime`);
		if (currentTimeElement) {
			currentTimeElement.value = currentTimeFormat;
		}

		const totalTimeElement = element.querySelector(`${this.className}__totalTime`);
		if (totalTimeElement) {
			totalTimeElement.value = totalTimeFormat;
		}

		const scrubberElement = element.querySelector(`${this.className}__scrubber`);
		if (scrubberElement) {
			scrubberElement.value = Math.floor(currentTimeInSeconds);
			scrubberElement.setAttribute('max', Math.floor(totalTimeInSeconds));
		}

		// invoke custom callback
		this.log(`time updated ${this.getCurrentTime(player)}`);
	}

	/**
	 * Handle the volume event
	 *
	 * @param {object} element player instance container
	 * @param {object} event event object
	 */
	volumechangeHandler(element, event) {
		const { volume = null } = event.target;
		if (!volume) return;

		// Get volume slider controller
		const volumeSlider = element.querySelector(`${this.className}__volume`);
		if (!volumeSlider) return;
		volumeSlider.value = volume;
		volumeSlider.setAttribute('data-last-volume', volume);

		this.log(`volume updated ${volume}`);
	}

	/**
	 * Get duration of player instance
	 *
	 * @param {object} player player instance
	 * @returns {number} player duration
	 */
	getDuration(player) {
		return player.duration;
	}

	/**
	 * Get currentTime of player instance
	 *
	 * @param {object} player player instance
	 * @returns {number} player currentTime
	 */
	getCurrentTime(player) {
		return player.currentTime;
	}

	/**
	 * Get volume of player instance
	 *
	 * @param {object} player player instance
	 * @returns {string} player volume
	 */
	getCurrentVolume(player) {
		return player.volume;
	}

	/**
	 * Check if player paused
	 *
	 * @param {object} player player instance
	 * @returns {boolean} player paused state
	 */
	getPaused(player) {
		return player.paused;
	}

	/**
	 * Set player instance currentTime
	 *
	 * @param {object} player player instance
	 * @param {number} value time in seconds to set player to
	 */
	currentTime(player, value = 0) {
		player.currentTime = value;
	}

	/**
	 * Set player instance volume
	 *
	 * @param {object} player player instance
	 * @param {number} value volume level 0.0 - 1.0
	 */
	volume(player, value = 0.5) {
		player.volume = value;
		player.muted = false;
	}

	/**
	 * Play the player instance
	 *
	 * @param {object} player player instance
	 */
	play(player) {
		player.play();
	}

	/**
	 * Seeking the player instance
	 *
	 * @param {object} player player instance
	 * @param {number} value value from seek control
	 */
	seeking(player, value) {
		player.currentTime = value;
	}

	/**
	 * Scrubbing while the player is playing can fight for control
	 * of the timeline. This alleviates the concern by pausing the playback
	 * whenever scrubbing takes place, then restoring playback if required
	 *
	 * @param {object} e event object
	 * @param {object} player player instance
	 */
	maybeScrubbing(e, player) {
		if (e.target.classList.contains(`${this.name}__scrubber`)) {
			const { type } = e;

			if (type === 'mousedown') {
				player.setAttribute('data-was-paused', player.paused);
				player.pause();
			}
			if (type === 'mouseup' && player.getAttribute('data-was-paused') === 'false') {
				this.play(player);
			}
		}
	}

	/**
	 * Pause the player instance
	 *
	 * @param {object} player player instance
	 */
	pause(player) {
		player.pause();
	}

	/**
	 * Mute the player instance
	 *
	 * @param {object} player player instance
	 */
	mute(player) {
		const volumeControl = player.parentNode.querySelector(`${this.className}__volume`);
		const lastVolume = volumeControl.getAttribute('data-last-volume');
		let updateVolume;
		let muted;

		if (!player.muted) {
			updateVolume = 0;
			muted = true;
		} else {
			updateVolume = lastVolume;
			muted = false;
		}

		this.volume(player, updateVolume);

		if (volumeControl) {
			volumeControl.value = updateVolume;
		}

		player.muted = muted;
	}

	/**
	 * Stop the player instance, not native to html audio component
	 * and so, requires a pause, and reset to the player
	 * also, requires adding the callback handler
	 *
	 * @param {object} player player instance
	 */
	stop(player) {
		this.pause(player);
		this.currentTime(player, 0);

		if (
			typeof this.settings.onstop !== 'undefined' &&
			typeof this.settings.onstop === 'function'
		) {
			this.customCallBackHandler('onstop')(player);
		}
	}

	/**
	 * Add a text track to a specified element
	 *
	 * @param {object} player player instance
	 * @param {string} kind subtitles|caption|descriptions|chapters|metadata
	 * @param {string} label used to identify the track
	 * @param {string} language two letter language code
	 */
	addTextTrack(player, kind, label, language = 'en') {
		player.addTextTrack(kind, label, language);
	}

	/**
	 * Build custom button controls
	 *
	 * @param {string} tag type of button adding to the controls
	 * @returns {object|null} custom button element or false
	 */
	buttonFactory(tag) {
		const label = this.settings[`${tag}Label`];
		if (!label) {
			this.log(
				'This plugin requires settings.labels. Be sure you have not accidentally removed the built in presets.',
				'error',
			);
			return null;
		}

		const makeButton = document.createElement('button');
		const text = document.createTextNode(label);
		makeButton.appendChild(text);
		makeButton.setAttribute('data-player-click', tag);
		makeButton.setAttribute('class', `${this.name}__${tag}`);

		return makeButton;
	}

	/**
	 * Build volume slider control
	 *
	 * @returns {object} Volume element
	 */
	volumeFactory() {
		// generate a unique id
		const uid = `volume-${this.uid()}`;

		// build input
		const input = document.createElement('input');
		input.setAttribute('id', uid);
		input.setAttribute('data-player-change', 'volume');
		input.setAttribute('type', 'range');
		input.setAttribute('min', '0');
		input.setAttribute('max', '1');
		input.setAttribute('step', '0.1');
		input.setAttribute('value', '0.5');
		input.setAttribute('class', `${this.name}__volume`);

		// build label
		const label = document.createElement('label');
		const text = document.createTextNode(this.settings.volumeLabel);
		label.appendChild(text);
		label.setAttribute('for', uid);
		label.appendChild(input);
		return label;
	}

	/**
	 * Build timer display
	 *
	 * @param {string} timerType current or Duration
	 * @param {number} value default value
	 * @returns {object} volume element
	 */
	timerFactory(timerType, value = 0) {
		// generate a unique id
		const uid = `timer-${this.uid()}`;

		// build input
		const input = document.createElement('input');
		input.setAttribute('id', uid);
		input.setAttribute('type', 'text');
		input.setAttribute('class', `${this.name}__${timerType}`);
		input.setAttribute('tabindex', '-1');
		input.value = value;

		// build label
		const label = document.createElement('label');
		const text = document.createTextNode(this.settings[`${timerType}Label`]);
		label.appendChild(text);
		label.setAttribute('for', uid);
		label.appendChild(input);
		return label;
	}

	/**
	 * Build scrubber control
	 *
	 * @returns {object} scrubber element
	 */
	scrubberFactory() {
		// generate a unique id
		const uid = `scrubber-${this.uid()}`;

		// build input
		const input = document.createElement('input');
		input.setAttribute('id', uid);
		input.setAttribute('data-player-change', 'seeking');
		input.setAttribute('type', 'range');
		input.setAttribute('min', '0');
		input.setAttribute('step', '1');
		input.setAttribute('class', `${this.name}__scrubber`);

		// build label
		const label = document.createElement('label');
		const text = document.createTextNode(this.settings.scrubberLabel);
		label.appendChild(text);
		label.setAttribute('for', uid);
		label.appendChild(input);
		return label;
	}

	/**
	 * Append markup to audio controls container
	 *
	 * @param {object} element Element to receive the appended node
	 * @param {object} template The node to pass into the element
	 */
	appendTemplate(element, template) {
		let audioContainer = element.querySelector(`${this.className}__controls`);

		if (!audioContainer) {
			audioContainer = document.createElement('div');
			audioContainer.setAttribute('class', `${this.name}__controls`);
			element.appendChild(audioContainer);
		}

		audioContainer.appendChild(template);
	}
}
