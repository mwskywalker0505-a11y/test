import ReactPlayer from 'react-player';

const AudioPlayer = ({ playing, url }) => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
            <ReactPlayer
                url={url}
                playing={playing}
                volume={1.0}
                muted={false} // Start unmuted, but browser might force mute if not intertwined with interaction
                loop={true}
                playsinline={true}
                controls={false}
                width="100%"
                height="100%"
                config={{
                    youtube: {
                        playerVars: {
                            showinfo: 0,
                            controls: 0,
                            playsinline: 1,
                            autoplay: 1,
                            disablekb: 1,
                            fs: 0,
                            iv_load_policy: 3,
                            modestbranding: 1
                        }
                    }
                }}
            />
        </div>
    );
};

export default AudioPlayer;
