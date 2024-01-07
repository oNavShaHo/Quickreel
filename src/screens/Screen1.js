import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { PlayCircle, PauseCircle, Forward10, Replay10 } from '@mui/icons-material';
import ReplayIcon from '@mui/icons-material/Replay';

function VideoPlayer() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tt, setTt] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadModels();

    return () => {
      // Clean up when the component unmounts
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  let animationFrameId;

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    ]);
  };

  const ft = () => {
    setTt(!tt);
    setClicked(true);
    startFaceDetection();
    if (tt) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPlaying(tt);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setClicked(true);
    setShowModal(false);

    if (file) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;

      videoRef.current.addEventListener('loadedmetadata', () => {
        setDuration(videoRef.current.duration);
        startFaceDetection();
      });
    }
  };

  const handleForward = () => {
    videoRef.current.currentTime += 10; // Move forward by 10 seconds
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleBackward = () => {
    videoRef.current.currentTime -= 10; // Move backward by 10 seconds
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVideoEnd = () => {
    setShowModal(true);
  };

  const handleReload = () => {
    setShowModal(false);
    window.location.reload();
  };

  const startFaceDetection = () => {
    animationFrameId = requestAnimationFrame(async () => {
      if (isPlaying) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        // Clear the previous drawing
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw new detections
        faceapi.matchDimensions(canvasRef.current, {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });

        const resized = faceapi.resizeResults(detections, {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });

        faceapi.draw.drawDetections(canvasRef.current, resized);
      }

      startFaceDetection();
    });
  };

  return (
    <div className="myapp flex flex-col gap-4 md:justify-center items-center h-screen relative">
      <h1 className=""></h1>
      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        className="relative"
        onChange={handleFileChange}
      />
      <div className="relative sm:top-10 md:mt-0 sm:h-[40vh] lg:h-[80vh] md:h-[80vh] w-[80vw]">
        <div className="appvide absolute ">
          <video
            className="sm:h-[40vh] lg:h-[80vh] md:h-[80vh] w-[80vw] border-red-200 border-[1rem]"
            crossOrigin="anonymous"
            ref={videoRef}
            autoPlay
            onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
            onEnded={handleVideoEnd}
          />
        </div>
        <canvas
          className="absolute appcanvas sm:h-[40vh] lg:h-[80vh] md:h-[80vh] w-[80vw]"
          ref={canvasRef}
        />

        {showModal && (
          <div className="modal fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-10">
            <div className="modal-content bg-white p-4 rounded">
              <p>Video Completed!</p>
              <button onClick={handleReload} className="bg-blue-500 text-white p-2 rounded mt-2">
                <ReplayIcon fontSize="large" />
              </button>
            </div>
          </div>
        )}
      </div>

      {clicked ? (
        <div className="mt-10 flex gap-10">
          <div className="flex gap-3">
            <button onClick={handleBackward}>
              <Replay10 fontSize="large" />
            </button>

            <button onClick={ft}>
              {!tt ? <PauseCircle fontSize="large" /> : <PlayCircle fontSize="large" />}
            </button>

            <button onClick={handleForward}>
              <Forward10 fontSize="large" />
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleTimeChange}
            />
            <span className="ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex gap-10">
          <div className="flex gap-3">
            <button>
              <Replay10 fontSize="large" />
            </button>

            <button>
              <PlayCircle fontSize="large" />
            </button>

            <button onClick={handleForward}>
              <Forward10 fontSize="large" />
            </button>
          </div>

          <div className="flex items-center">
            <input type="range" min={0} max={duration} value={currentTime} />
            <span className="ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;

// Helper function to format time in HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
