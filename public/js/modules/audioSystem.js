/**
 * Audio System for managing music and sound effects
 */
class AudioSystem {
    constructor() {
        this.musicTracks = [
            'res/music/track002.mp3'
        ];
        this.soundEffects = {
            hit: ['res/sfx/hit001.wav', 'res/sfx/hit002.wav'],
            miss: ['res/sfx/miss001.wav'], 
            death: ['res/sfx/death001.wav'], 
            loot: ['res/sfx/loot001.mp3'],
            skillup: ['res/sfx/skillup001.mp3'],
            rest: ['res/sfx/rest001.mp3', 'res/sfx/rest002.mp3'],
            treasure: 'res/sfx/treasure001.mp3',
            notice: 'res/sfx/notice001.wav',
            stair: 'res/sfx/stair001.mp3'
        };
        
        this.currentMusic = null;
        this.currentRestSound = null;
        this.audioContext = null;
        this.isMuted = false;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;
        this.musicQueued = false;
        
        // Preload audio files
        this.preloadedSounds = new Map();
        this.preloadedMusic = new Map();
    }

    /**
     * Initialize the audio system
     */
    init() {
        try {
            // Create audio context for pitch manipulation
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Discover miss sound files dynamically
            this.discoverMissSounds();
            
            // Preload all audio files
            this.preloadAudio();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio system initialization failed:', error);
        }
    }

    /**
     * Dynamically discover miss sound files
     */
    discoverMissSounds() {
        // For now, we'll hardcode the known miss files, but this could be expanded
        // to dynamically discover files if needed in the future
        const knownMissFiles = ['res/sfx/miss001.wav'];
        
        // Filter to only include files that exist (we can't check file system from browser)
        // but we can prepare for future expansion
        this.soundEffects.miss = knownMissFiles;
        
        console.log('Discovered miss sounds:', this.soundEffects.miss);
    }

    /**
     * Preload all audio files
     */
    async preloadAudio() {
        // Preload music tracks
        for (const track of this.musicTracks) {
            try {
                const audio = new Audio(track);
                audio.preload = 'auto';
                audio.volume = this.musicVolume;
                this.preloadedMusic.set(track, audio);
            } catch (error) {
                console.warn(`Failed to preload music: ${track}`, error);
            }
        }

        // Preload sound effects
        for (const [category, sounds] of Object.entries(this.soundEffects)) {
            if (Array.isArray(sounds)) {
                for (const sound of sounds) {
                    try {
                        const audio = new Audio(sound);
                        audio.preload = 'auto';
                        audio.volume = this.sfxVolume;
                        this.preloadedSounds.set(sound, audio);
                        console.log(`Preloaded sound: ${sound}`);
                    } catch (error) {
                        console.warn(`Failed to preload sound: ${sound}`, error);
                    }
                }
            } else {
                try {
                    const audio = new Audio(sounds);
                    audio.preload = 'auto';
                    audio.volume = this.sfxVolume;
                    this.preloadedSounds.set(sounds, audio);
                    console.log(`Preloaded sound: ${sounds}`);
                } catch (error) {
                    console.warn(`Failed to preload sound: ${sounds}`, error);
                }
            }
        }
    }

    /**
     * Play a random music track
     */
    playRandomMusic() {
        if (this.isMuted) return;
        
        try {
            // Stop current music if playing
            if (this.currentMusic) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            }

            // Select random track
            const randomTrack = this.musicTracks[Math.floor(Math.random() * this.musicTracks.length)];
            const audio = this.preloadedMusic.get(randomTrack);
            
            if (audio) {
                this.currentMusic = audio;
                this.currentMusic.volume = this.musicVolume;
                this.currentMusic.loop = true;
                
                // Try to play, but handle autoplay restrictions
                const playPromise = this.currentMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Music autoplay blocked, will start on first user interaction:', error);
                        // Store that we want to play music when user interacts
                        this.musicQueued = true;
                    });
                }
                console.log(`Playing music: ${randomTrack}`);
            }
        } catch (error) {
            console.warn('Failed to play random music:', error);
        }
    }

    /**
     * Play a hit sound with random pitch variation
     */
    playHitSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping hit sound');
            return;
        }
        
        console.log('Attempting to play hit sound...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            // Select random hit sound
            const randomHit = this.soundEffects.hit[Math.floor(Math.random() * this.soundEffects.hit.length)];
            console.log('Selected hit sound:', randomHit);
            
            const audio = this.preloadedSounds.get(randomHit);
            
            if (audio) {
                console.log('Found preloaded audio, creating clone...');
                
                // Create a copy to avoid interrupting ongoing sounds
                const hitAudio = audio.cloneNode();
                hitAudio.volume = this.sfxVolume;
                
                // Apply pitch variation (-3 to +3 semitones)
                const pitchVariation = (Math.random() - 0.5) * 6; // -3 to +3
                const pitchMultiplier = Math.pow(2, pitchVariation / 12); // Convert semitones to frequency multiplier
                
                console.log(`Pitch variation: ${pitchVariation.toFixed(2)} semitones, multiplier: ${pitchMultiplier.toFixed(2)}`);
                
                // Try simple playbackRate first
                hitAudio.playbackRate = pitchMultiplier;
                
                // Play the audio
                const playPromise = hitAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Successfully played hit sound: ${randomHit}`);
                    }).catch(error => {
                        console.warn('Failed to play hit sound:', error);
                    });
                }
                
            } else {
                console.warn('Hit sound not found in preloaded sounds:', randomHit);
                console.log('Available sounds:', Array.from(this.preloadedSounds.keys()));
            }
        } catch (error) {
            console.warn('Failed to play hit sound:', error);
        }
    }

    /**
     * Play a miss sound with random pitch variation
     */
    playMissSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping miss sound');
            return;
        }
        
        console.log('Attempting to play miss sound...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            // Select random miss sound
            const randomMiss = this.soundEffects.miss[Math.floor(Math.random() * this.soundEffects.miss.length)];
            console.log('Selected miss sound:', randomMiss);
            
            const audio = this.preloadedSounds.get(randomMiss);
            
            if (audio) {
                console.log('Found preloaded miss audio, creating clone...');
                
                // Create a copy to avoid interrupting ongoing sounds
                const missAudio = audio.cloneNode();
                missAudio.volume = this.sfxVolume;
                
                // Apply pitch variation (-3 to +3 semitones)
                const pitchVariation = (Math.random() - 0.5) * 6; // -3 to +3
                const pitchMultiplier = Math.pow(2, pitchVariation / 12); // Convert semitones to frequency multiplier
                
                console.log(`Miss pitch variation: ${pitchVariation.toFixed(2)} semitones, multiplier: ${pitchMultiplier.toFixed(2)}`);
                
                // Try simple playbackRate first
                missAudio.playbackRate = pitchMultiplier;
                
                // Play the audio
                const playPromise = missAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Successfully played miss sound: ${randomMiss}`);
                    }).catch(error => {
                        console.warn('Failed to play miss sound:', error);
                    });
                }
                
            } else {
                console.warn('Miss sound not found in preloaded sounds:', randomMiss);
                console.log('Available sounds:', Array.from(this.preloadedSounds.keys()));
            }
        } catch (error) {
            console.warn('Failed to play miss sound:', error);
        }
    }

    /**
     * Play audio with pitch modification using Web Audio API
     * @param {HTMLAudioElement} audio - Audio element to play
     * @param {number} pitchMultiplier - Pitch multiplier (1.0 = normal, >1.0 = higher, <1.0 = lower)
     */
    playWithPitch(audio, pitchMultiplier) {
        try {
            // Ensure audio context is running
            if (this.audioContext.state !== 'running') {
                console.warn('Audio context not running, falling back to playbackRate');
                audio.playbackRate = pitchMultiplier;
                audio.play().catch(error => {
                    console.warn('Failed to play audio with playbackRate:', error);
                });
                return;
            }

            // Create audio source
            const source = this.audioContext.createMediaElementSource(audio);
            const gainNode = this.audioContext.createGain();
            
            // Set gain to match the audio's volume
            gainNode.gain.value = audio.volume;
            
            // Apply pitch using playbackRate (more reliable than complex pitch shifting)
            audio.playbackRate = pitchMultiplier;
            
            // Connect audio graph
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Play the audio
            audio.play().catch(error => {
                console.warn('Failed to play pitched audio:', error);
            });
            
            console.log(`Playing with Web Audio API, pitch: ${pitchMultiplier.toFixed(2)}`);
        } catch (error) {
            console.warn('Web Audio API failed, falling back to playbackRate:', error);
            // Fallback to normal playback with pitch
            audio.playbackRate = pitchMultiplier;
            audio.play().catch(error => {
                console.warn('Failed to play audio fallback:', error);
            });
        }
    }

    /**
     * Play rest sound effect
     */
    playRestSound() {
        if (this.isMuted) return;
        
        // Stop any currently playing rest sound
        this.stopRestSound();
        
        try {
            // Select random rest sound
            const randomRest = this.soundEffects.rest[Math.floor(Math.random() * this.soundEffects.rest.length)];
            const audio = this.preloadedSounds.get(randomRest);
            
            if (audio) {
                this.currentRestSound = audio.cloneNode();
                this.currentRestSound.volume = this.sfxVolume;
                this.currentRestSound.loop = true; // Loop infinitely
                
                this.currentRestSound.play().catch(error => {
                    console.warn('Failed to play rest sound:', error);
                });
                
                console.log(`Playing looping rest sound: ${randomRest}`);
            }
        } catch (error) {
            console.warn('Failed to play rest sound:', error);
        }
    }

    /**
     * Stop the current rest sound
     */
    stopRestSound() {
        if (this.currentRestSound) {
            this.currentRestSound.pause();
            this.currentRestSound.currentTime = 0;
            this.currentRestSound = null;
            console.log('Stopped rest sound');
        }
    }

    /**
     * Play stair sound effect with descending pitch
     */
    playStairSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping stair sound');
            return;
        }
        
        console.log('Playing stair sound with descending pitch...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            const audio = this.preloadedSounds.get(this.soundEffects.stair);
            
            if (audio) {
                // Play 3 times, starting at -18 semitones, each 1 semitone lower than the previous
                for (let i = 0; i < 3; i++) {
                    const stairAudio = audio.cloneNode();
                    stairAudio.volume = this.sfxVolume;
                    
                    // Calculate pitch: start at -18 semitones, then each iteration is 1 semitone lower
                    const pitchMultiplier = Math.pow(2, (-18 - i) / 12); // Start at -18, then -19, -20
                    stairAudio.playbackRate = pitchMultiplier;
                    
                    // Delay each sound by 200ms (25% faster)
                    setTimeout(() => {
                        const playPromise = stairAudio.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log(`Played stair sound ${i + 1}/3 at pitch ${pitchMultiplier.toFixed(2)}`);
                            }).catch(error => {
                                console.warn(`Failed to play stair sound ${i + 1}:`, error);
                            });
                        }
                    }, i * 200);
                }
            } else {
                console.warn('Stair sound not found in preloaded sounds');
            }
        } catch (error) {
            console.warn('Failed to play stair sound:', error);
        }
    }

    /**
     * Play treasure sound effect
     */
    playTreasureSound() {
        if (this.isMuted) return;
        
        try {
            const audio = this.preloadedSounds.get(this.soundEffects.treasure);
            if (audio) {
                const treasureAudio = audio.cloneNode();
                treasureAudio.volume = this.sfxVolume;
                treasureAudio.play().catch(error => {
                    console.warn('Failed to play treasure sound:', error);
                });
            }
        } catch (error) {
            console.warn('Failed to play treasure sound:', error);
        }
    }

    /**
     * Play death sound effect
     */
    playDeathSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping death sound');
            return;
        }
        
        console.log('Attempting to play death sound...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            // Select random death sound
            const randomDeath = this.soundEffects.death[Math.floor(Math.random() * this.soundEffects.death.length)];
            console.log('Selected death sound:', randomDeath);
            
            const audio = this.preloadedSounds.get(randomDeath);
            
            if (audio) {
                console.log('Found preloaded death audio, creating clone...');
                
                // Create a copy to avoid interrupting ongoing sounds
                const deathAudio = audio.cloneNode();
                deathAudio.volume = this.sfxVolume;
                
                // Apply slight pitch variation for variety
                const pitchVariation = (Math.random() - 0.5) * 2; // -1 to +1 semitones (smaller range for death)
                const pitchMultiplier = Math.pow(2, pitchVariation / 12);
                
                console.log(`Death pitch variation: ${pitchVariation.toFixed(2)} semitones, multiplier: ${pitchMultiplier.toFixed(2)}`);
                
                deathAudio.playbackRate = pitchMultiplier;
                
                // Play the audio
                const playPromise = deathAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Successfully played death sound: ${randomDeath}`);
                    }).catch(error => {
                        console.warn('Failed to play death sound:', error);
                    });
                }
                
            } else {
                console.warn('Death sound not found in preloaded sounds:', randomDeath);
                console.log('Available sounds:', Array.from(this.preloadedSounds.keys()));
            }
        } catch (error) {
            console.warn('Failed to play death sound:', error);
        }
    }

    /**
     * Play loot sound effect
     */
    playLootSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping loot sound');
            return;
        }
        
        console.log('Attempting to play loot sound...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            // Select random loot sound
            const randomLoot = this.soundEffects.loot[Math.floor(Math.random() * this.soundEffects.loot.length)];
            console.log('Selected loot sound:', randomLoot);
            
            const audio = this.preloadedSounds.get(randomLoot);
            
            if (audio) {
                console.log('Found preloaded loot audio, creating clone...');
                
                // Create a copy to avoid interrupting ongoing sounds
                const lootAudio = audio.cloneNode();
                lootAudio.volume = this.sfxVolume;
                
                // Apply pitch variation (-2 to +2 semitones) for loot sounds
                const pitchVariation = (Math.random() - 0.5) * 4; // -2 to +2 semitones
                const pitchMultiplier = Math.pow(2, pitchVariation / 12);
                
                console.log(`Loot pitch variation: ${pitchVariation.toFixed(2)} semitones, multiplier: ${pitchMultiplier.toFixed(2)}`);
                
                lootAudio.playbackRate = pitchMultiplier;
                
                // Play the audio
                const playPromise = lootAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Successfully played loot sound: ${randomLoot}`);
                    }).catch(error => {
                        console.warn('Failed to play loot sound:', error);
                    });
                }
                
            } else {
                console.warn('Loot sound not found in preloaded sounds:', randomLoot);
                console.log('Available sounds:', Array.from(this.preloadedSounds.keys()));
            }
        } catch (error) {
            console.warn('Failed to play loot sound:', error);
        }
    }

    /**
     * Play skillup sound effect
     */
    playSkillupSound() {
        if (this.isMuted) {
            console.log('Audio is muted, skipping skillup sound');
            return;
        }
        
        console.log('Attempting to play skillup sound...');
        
        try {
            // Ensure audio context is running
            this.resumeAudioContext();
            
            // Select random skillup sound
            const randomSkillup = this.soundEffects.skillup[Math.floor(Math.random() * this.soundEffects.skillup.length)];
            console.log('Selected skillup sound:', randomSkillup);
            
            const audio = this.preloadedSounds.get(randomSkillup);
            
            if (audio) {
                console.log('Found preloaded skillup audio, creating clone...');
                
                // Create a copy to avoid interrupting ongoing sounds
                const skillupAudio = audio.cloneNode();
                skillupAudio.volume = this.sfxVolume;
                
                // Apply slight pitch variation (-1 to +1 semitones) for skillup sounds
                const pitchVariation = (Math.random() - 0.5) * 2; // -1 to +1 semitones
                const pitchMultiplier = Math.pow(2, pitchVariation / 12);
                
                console.log(`Skillup pitch variation: ${pitchVariation.toFixed(2)} semitones, multiplier: ${pitchMultiplier.toFixed(2)}`);
                
                skillupAudio.playbackRate = pitchMultiplier;
                
                // Play the audio
                const playPromise = skillupAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Successfully played skillup sound: ${randomSkillup}`);
                    }).catch(error => {
                        console.warn('Failed to play skillup sound:', error);
                    });
                }
                
            } else {
                console.warn('Skillup sound not found in preloaded sounds:', randomSkillup);
                console.log('Available sounds:', Array.from(this.preloadedSounds.keys()));
            }
        } catch (error) {
            console.warn('Failed to play skillup sound:', error);
        }
    }

    /**
     * Play notice sound effect
     */
    playNoticeSound() {
        if (this.isMuted) return;
        
        try {
            const audio = this.preloadedSounds.get(this.soundEffects.notice);
            if (audio) {
                const noticeAudio = audio.cloneNode();
                noticeAudio.volume = this.sfxVolume;
                noticeAudio.play().catch(error => {
                    console.warn('Failed to play notice sound:', error);
                });
            }
        } catch (error) {
            console.warn('Failed to play notice sound:', error);
        }
    }

    /**
     * Toggle mute state
     * @returns {boolean} Current mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Mute all audio
            if (this.currentMusic) {
                this.currentMusic.pause();
            }
            // Note: We can't easily mute all playing sound effects without tracking them
            // The isMuted flag will prevent new sounds from playing
        } else {
            // Unmute - resume music if it was playing
            if (this.currentMusic) {
                this.currentMusic.play().catch(error => {
                    console.warn('Failed to resume music:', error);
                });
            }
        }
        
        return this.isMuted;
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }

    /**
     * Update volume for all preloaded audio
     */
    updateVolume() {
        // Update music volume
        for (const audio of this.preloadedMusic.values()) {
            audio.volume = this.musicVolume * this.volume;
        }
        
        // Update sound effects volume
        for (const audio of this.preloadedSounds.values()) {
            audio.volume = this.sfxVolume * this.volume;
        }
    }

    /**
     * Stop all audio
     */
    stopAll() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    /**
     * Resume audio context (required for some browsers)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(error => {
                console.warn('Failed to resume audio context:', error);
            });
        }
    }

    /**
     * Handle user interaction to start queued music
     */
    handleUserInteraction() {
        // Resume audio context first
        this.resumeAudioContext();
        
        // If music was queued due to autoplay restrictions, start it now
        if (this.musicQueued && this.currentMusic && !this.isMuted) {
            this.currentMusic.play().then(() => {
                console.log('Music started after user interaction');
                this.musicQueued = false;
            }).catch(error => {
                console.warn('Failed to start queued music:', error);
            });
        }
    }

    /**
     * Test method to debug audio issues
     */
    testAudio() {
        console.log('=== AUDIO SYSTEM DEBUG ===');
        console.log('Audio context state:', this.audioContext ? this.audioContext.state : 'null');
        console.log('Is muted:', this.isMuted);
        console.log('Preloaded sounds:', Array.from(this.preloadedSounds.keys()));
        console.log('Preloaded music:', Array.from(this.preloadedMusic.keys()));
        console.log('Hit sounds available:', this.soundEffects.hit);
        console.log('Miss sounds available:', this.soundEffects.miss);
        
        // Test a simple sound
        console.log('Testing hit sound...');
        this.playHitSound();
    }
}
