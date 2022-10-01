/*
    1. Render song
    2. Scoll top
    3. Play / pause / seek
    4. CD rotale
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. Play song when click
*/



const $ = document.querySelector.bind(document)
const $$ = document.querySelector.bind(document)

const PLAYER_STORAGE_KEY = 'LONG_PLAYER'

const player = $('.player')
const playList = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    // Array of list song
    songs:
    [
        {
            name: 'Hotarubi',
            singer: 'Hotaru',
            path: './song/Hotaru-Hotarubi-No-Mori-E-Fujita-Maiko.mp3',
            image: '/img/hotarubi no mori e.jpg'
        },
        {
            name: 'Nandemonaiya',
            singer: 'Radwimps',
            path: './song/Nandemonai Ya (Movie Version).mp3',
            image: '/img/Nandemonaiya.jpg'
        },
        {
            name: 'Unravel',
            singer: 'Ling',
            path: './song/unravel Acoustic Version.mp3',
            image: '/img/unravel.jpg'
        },
        {
            name: 'You can be king again',
            singer: 'Hotaru',
            path: './song/You-Can-Be-King-Again-Hotarubi-no-mori-e.mp3',
            image: '/img/you can be king again.jpg'
        },
        {
            name: 'gu',
            singer: 'seachain',
            path: './song/gu_remix.mp3',
            image: '/img/gu.jpg'
        },
        {
            name: 'Nếu em ở lại',
            singer: 'khói',
            path: './song/NeuEmOLaiAcousticVersion-Khoi.mp3',
            image: '/img/khoi_Neuemolai.jpg'
        },
        {
            name: 'Dưới cơn mưa',
            singer: 'Khói',
            path: './song/DuoiConMua-KhoiHelia.mp3',
            image: '/img/khoi_duoiconmua.jpg'
        },
        {
            name: '2 5',
            singer: 'Táo',
            path: './song/2-5-Masew-Remix-Tao.mp3',
            image: '/img/tao_blue.jpg'
        }
    ],
    // 1. render the song
    render: function(){
        const htmls = this.songs.map((song, index) =>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('')
    },
    // Event
    handleEvents: function () {
        const _this = this

        // Handle CD rotation
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,//rotate 10s
            iteration: Infinity//repeat: vô hạn
        })
        cdThumbAnimate.pause()
        // 2. Scroll to top CD
        const cdWidth = cd.offsetWidth
        document.onscroll = function () {
            
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            
            const cdWidthNew = cdWidth - scrollTop
            cd.style.width = cdWidthNew > 0 ? cdWidthNew + 'px' : 0
            cd.style.opacity = cdWidthNew / cdWidth

        }
        // Click play
        playBtn.onclick = function () {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }
         // When play
         audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // When pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        // When progress song change
        audio.ontimeupdate = async function () {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime /audio.duration *100)
                progress.value = progressPercent
                cdThumbAnimate.play()
            }

        }
        // When progress song change
        progress.onchange = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        // When next song
        nextBtn.onclick = function () {
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //When previous song
        prevBtn.onclick = function () {
            if(_this.isRandom){
                _this.randomSong()
            }else{
                _this.prevSong()
            }
            audio.play()

            _this.render()
            _this.scrollToActiveSong()
        }

        // When click button random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        //when song end
        audio.onended = function () {
            if(_this.isRepeat){
            //  Handle click on repeat button
                audio.play()
            }else{
            // handle song end
                nextBtn.click()
            }
        }

        // When click repeat button
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        // Listener click event playlist
        playList.onclick = function (e) {
            const getSongNoActive = e.target.closest('.song:not(.active)')
            const getOption = e.target.closest('.option')
            if( getSongNoActive || getOption){
                //  Handle click on song
                if(getSongNoActive){
                    _this.currentIndex = Number(getSongNoActive.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }

    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex ++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex --
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function() {

        setTimeout(()=>{
           if(cd.style.width <0){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
           }else {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            })
           }
        },500)
    },
    // Function run when page load
    start: function() {
        // set cấu hình từ config vào app
        this.loadConfig()

        // define prop oject
        this.defineProperties()

        this.handleEvents()

        //Load first song to UI
        this.loadCurrentSong()

        this.render()

        // Hiển thị trạng thái ban đầu button repeat & random lưu trong player
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}

app.start()
