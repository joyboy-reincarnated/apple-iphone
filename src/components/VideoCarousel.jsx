import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

const VideoCarousel = () => {  
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  gsap.registerPlugin(ScrollTrigger)

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);

  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  const handleLoadedMetaData =(i,e)=> setLoadedData(((prev)=>[...prev,e]))
  useGSAP(()=>{
    gsap.to('#video', {
        scrollTrigger:{
            trigger:'#video',
            toggleActions:'restart none none none'
        },
        onComplete:()=>{
            setVideo((prevVideo)=>({
                ...prevVideo,
                startPlay: true,
                isPlaying:true,
            }))
        }
    })

    gsap.to('#slider',{
        transform:`translate(${-100 * videoId}%)`,
        duration:2,
        ease:'power2.inOut'
    })

  },[isEnd,  videoId])

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      //animate the progress of video
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
            const progress = Math.ceil(anim.progress()*100)

            if (progress != currentProgress) {
                currentProgress =  progress;

                gsap.to(videoDivRef.current[videoId],{
                    width:window.innerWidth<760? '10vw':
                    window.innerWidth<1200? '10vw':'4vw' 
                })

                gsap.to(span[videoId],{
                    width:`${currentProgress}%`,
                    backgroundColor:'white'
                })
               
            } 
        },
        onComplete: () => {
            gsap.to(videoDivRef.current[videoId],{
                width:'12px'
            }),
            gsap.to(span[videoId],{
                backgroundColor:'#afafaf'
            })
        },
    });
    if (videoId===0) {
        anim.restart()
    }
    
    const animUpdate = () => {
        anim.progress(videoRef.current[videoId].currentTime/hightlightsSlides[videoId].videoDuration)
    }

    if (isPlaying) {
        gsap.ticker.add(animUpdate)
    }else{
        gsap.ticker.remove(animUpdate)

    }
    }
  }, [videoId, startPlay]);

  const handleProcess =(type,i)=>{
    switch (type) {
        case 'video-end':
            setVideo((prevVideo)=>({...prevVideo,isEnd:true,videoId:i+1}))
            break;
    
        case 'video-last':
            setVideo((prevVideo)=>({...prevVideo,isLastVideo:true}))
            break;
    
        case 'video-reset':
            setVideo((prevVideo)=>({...prevVideo,isLastVideo:false,videoId:0}))
            break;

        case 'play':
            setVideo((prevVideo)=>({...prevVideo,isPlaying:!prevVideo.isPlaying}))

            break;
        case 'pause':
            setVideo((prevVideo)=>({...prevVideo,isPlaying:!prevVideo.isPlaying}))

            break;
    
        default:
            return video
    }
  }

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((item, index) => (
          <div id="slider" key={item.id} className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full overflow-hidden flex-center rounded-3xl bg-black">
                <video
                  id="video"
                  playsInline={true}
                  preload="auto"
                  muted
                  className={`${item.id===2 && 'translate-x-44'} pointer-events-none`}
                  onEnded={()=>
                    index !== 3 ?
                    handleProcess('video-end',index)
                    :handleProcess('video-last')
                  }
                  ref={(el) => (videoRef.current[index] = el)}
                  onPlay={() => {
                    setVideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }));
                  }}
                  onLoadedMetadata={(e)=>handleLoadedMetaData(index,e)}
                >
                  <source src={item.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10 ">
                {item.textLists.map((text) => (
                  <p key={text} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full cursor-pointer relative"
            >
              <span
                className="w-full h-full absolute rounded-full "
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
