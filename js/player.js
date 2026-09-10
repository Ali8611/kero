/**
 * KeroMega Music Player Widget
 * Floating Audio Player with Playlist & Equalizer
 */

// Playlist configuration
const PLAYLIST = [
  {
    title: 'الولا حمو جه (بكره يبقا بيه)',
    artist: 'حمو المرشدي 🔥',
    src: './assets/audio/el-wla-hamo-geh.m4a',
    duration: '3:30'
  },
  {
    title: 'العيون الحلوه دي',
    artist: 'حمو المرشدي وعمرو مصطفي 🎶',
    src: './assets/audio/el-oyoon-el-helwa.m4a',
    duration: '3:11'
  },
  {
    title: 'مهرجان متحصن',
    artist: 'حمو الجلاد والخال ⚡',
    src: './assets/audio/methasan.m4a',
    duration: '5:37'
  }
];

class KeroPlayer {
  constructor(playlist) {
    this.playlist = playlist;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.audio = new Audio();
    this.audio.preload = 'metadata';

    this.initDOM();
    this.renderPlaylist();
    this.loadTrack(this.currentIndex, false);
    this.bindEvents();
  }

  initDOM() {
    this.container = document.querySelector('.music-player-container');
    this.playBtn = document.getElementById('playerPlayBtn');
    this.playIcon = this.playBtn.querySelector('i');
    this.prevBtn = document.getElementById('playerPrevBtn');
    this.nextBtn = document.getElementById('playerNextBtn');
    this.titleEl = document.getElementById('playerTrackTitle');
    this.artistEl = document.getElementById('playerTrackArtist');
    this.discArt = document.querySelector('.disc-art');
    this.currentTimeEl = document.getElementById('playerCurrentTime');
    this.durationEl = document.getElementById('playerDuration');
    this.progressContainer = document.getElementById('playerProgressBar');
    this.progressFill = document.getElementById('playerProgressFill');
    this.volumeSlider = document.getElementById('playerVolumeSlider');
    this.muteBtn = document.getElementById('playerMuteBtn');
    this.muteIcon = this.muteBtn.querySelector('i');
    this.minimizeBtn = document.getElementById('playerMinimizeBtn');
    this.playlistToggleBtn = document.getElementById('playerPlaylistToggle');
    this.playlistDrawer = document.getElementById('playerPlaylistDrawer');
    this.playlistItemsContainer = document.getElementById('playlistItems');
  }

  loadTrack(index, autoPlay = true) {
    if (index < 0) index = this.playlist.length - 1;
    if (index >= this.playlist.length) index = 0;
    this.currentIndex = index;

    const track = this.playlist[this.currentIndex];
    this.audio.src = track.src;
    this.titleEl.textContent = track.title;
    this.artistEl.textContent = track.artist;
    this.durationEl.textContent = track.duration || '0:00';
    this.currentTimeEl.textContent = '0:00';
    this.progressFill.style.width = '0%';

    this.updateActivePlaylistItem();

    if (autoPlay) {
      this.play();
    }
  }

  play() {
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.playIcon.classList.remove('fa-play');
      this.playIcon.classList.add('fa-pause');
      this.discArt.classList.add('playing');
    }).catch(err => {
      console.warn('Audio play requires user interaction:', err);
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.playIcon.classList.remove('fa-pause');
    this.playIcon.classList.add('fa-play');
    this.discArt.classList.remove('playing');
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  prevTrack() {
    this.loadTrack(this.currentIndex - 1, true);
  }

  nextTrack() {
    this.loadTrack(this.currentIndex + 1, true);
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  updateProgress() {
    if (this.audio.duration) {
      const current = this.audio.currentTime;
      const total = this.audio.duration;
      const percent = (current / total) * 100;
      this.progressFill.style.width = `${percent}%`;
      this.currentTimeEl.textContent = this.formatTime(current);
      this.durationEl.textContent = this.formatTime(total);
    }
  }

  seek(e) {
    const rect = this.progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clamped = Math.max(0, Math.min(1, pos));
    if (this.audio.duration) {
      this.audio.currentTime = clamped * this.audio.duration;
    }
  }

  setVolume(val) {
    this.audio.volume = val;
    if (val == 0) {
      this.isMuted = true;
      this.muteIcon.className = 'fas fa-volume-mute';
    } else if (val < 0.5) {
      this.isMuted = false;
      this.muteIcon.className = 'fas fa-volume-down';
    } else {
      this.isMuted = false;
      this.muteIcon.className = 'fas fa-volume-up';
    }
  }

  toggleMute() {
    if (this.isMuted) {
      this.audio.muted = false;
      this.isMuted = false;
      this.volumeSlider.value = this.audio.volume || 0.7;
      this.setVolume(this.volumeSlider.value);
    } else {
      this.audio.muted = true;
      this.isMuted = true;
      this.muteIcon.className = 'fas fa-volume-mute';
    }
  }

  renderPlaylist() {
    if (!this.playlistItemsContainer) return;
    this.playlistItemsContainer.innerHTML = '';
    this.playlist.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = `playlist-item ${idx === this.currentIndex ? 'active' : ''}`;
      item.innerHTML = `
        <div class="playlist-item-title">
          <i class="fas fa-${idx === this.currentIndex ? 'headphones' : 'music'}"></i>
          <span>${track.title}</span>
        </div>
        <span class="time-display">${track.duration}</span>
      `;
      item.addEventListener('click', () => {
        this.loadTrack(idx, true);
      });
      this.playlistItemsContainer.appendChild(item);
    });
  }

  updateActivePlaylistItem() {
    if (!this.playlistItemsContainer) return;
    const items = this.playlistItemsContainer.querySelectorAll('.playlist-item');
    items.forEach((item, idx) => {
      if (idx === this.currentIndex) {
        item.classList.add('active');
        item.querySelector('i').className = 'fas fa-headphones';
      } else {
        item.classList.remove('active');
        item.querySelector('i').className = 'fas fa-music';
      }
    });
  }

  bindEvents() {
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());

    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('ended', () => this.nextTrack());
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio.duration) {
        this.durationEl.textContent = this.formatTime(this.audio.duration);
      }
    });

    // Progress Bar click
    this.progressContainer.addEventListener('click', (e) => this.seek(e));

    // Volume
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.setVolume(e.target.value);
      });
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // Playlist Drawer Toggle
    if (this.playlistToggleBtn && this.playlistDrawer) {
      this.playlistToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playlistDrawer.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!this.playlistDrawer.contains(e.target) && e.target !== this.playlistToggleBtn) {
          this.playlistDrawer.classList.remove('active');
        }
      });
    }

    // Minimize Toggle
    if (this.minimizeBtn && this.container) {
      this.minimizeBtn.addEventListener('click', () => {
        this.container.classList.toggle('minimized');
        const icon = this.minimizeBtn.querySelector('i');
        if (this.container.classList.contains('minimized')) {
          icon.className = 'fas fa-expand-alt';
          this.minimizeBtn.title = 'تكبير المشغل';
        } else {
          icon.className = 'fas fa-minus';
          this.minimizeBtn.title = 'تصغير المشغل';
        }
      });
    }
  }
}

// Instantiate once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.keroPlayer = new KeroPlayer(PLAYLIST);
});
