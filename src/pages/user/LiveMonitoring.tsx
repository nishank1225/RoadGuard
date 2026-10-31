import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CircleAlert, Loader2 } from 'lucide-react';
import { analyzeImage, loadModel } from '../../detection';
import type { DetectionResult } from '@/lib/types';

export function LiveMonitoring() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);
    const busyRef = useRef(false);

    const [running, setRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState('');

    const stopMonitoring = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setRunning(false);
        busyRef.current = false;
    }, []);

    const processFrame = useCallback(async () => {
        const video = videoRef.current;

        if (!video || video.readyState < 2 || !running) {
            return;
        }

        if (busyRef.current) {
            return;
        }

        busyRef.current = true;

        try {
            const canvas = canvasRef.current;

            if (!canvas) {
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return;
            }

            ctx.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', 0.75);
            });

            if (!blob) {
                return;
            }

            const file = new File(
                [blob],
                'live-frame.jpg',
                { type: 'image/jpeg' }
            );

            const detection = await analyzeImage(
                file,
                'live-frame.jpg'
            );

            setResult(detection);
        } catch (err) {
            console.error('Live detection error:', err);
        } finally {
            busyRef.current = false;

            if (running) {
                timerRef.current = window.setTimeout(
                    processFrame,
                    500
                );
            }
        }
    }, [running]);

    const startMonitoring = async () => {
        try {
            setError('');
            setLoading(true);

            await loadModel();

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            if (!videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }

            videoRef.current.srcObject = stream;

            await videoRef.current.play();

            setRunning(true);
        } catch (err) {
            console.error(err);

            setError(
                'Unable to access the camera. Please allow camera permission and try again.'
            );

            stopMonitoring();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!running) {
            return;
        }

        const timer = window.setTimeout(() => {
            processFrame();
        }, 500);

        return () => {
            window.clearTimeout(timer);
        };
    }, [running, processFrame]);

    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, [stopMonitoring]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold">
                    Live Pothole Monitoring
                </h1>

                <p className="text-sm text-muted mt-1">
                    Real-time pothole detection using the RoadGuard YOLO model
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            <div className="relative overflow-hidden rounded-2xl border border-base bg-black">
                <video
                    ref={videoRef}
                    className="block w-full aspect-video object-cover"
                    muted
                    playsInline
                />

                {!running && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                        <Camera className="h-12 w-12 text-muted mb-4" />

                        <p className="text-white font-medium">
                            Camera monitoring is stopped
                        </p>

                        <p className="text-sm text-muted mt-1">
                            Start monitoring to detect potholes
                        </p>
                    </div>
                )}

                {running && result && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                        <div className="rounded-xl bg-black/70 backdrop-blur px-4 py-3">
                            <div className="text-xs text-muted">
                                Detection
                            </div>

                            <div className="text-lg font-semibold text-white">
                                {result.pothole_count} pothole
                                {result.pothole_count === 1 ? '' : 's'}
                            </div>
                        </div>

                        <div className="rounded-xl bg-black/70 backdrop-blur px-4 py-3">
                            <div className="text-xs text-muted">
                                Confidence
                            </div>

                            <div className="text-lg font-semibold text-white">
                                {Math.round(result.confidence * 100)}%
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <canvas
                ref={canvasRef}
                className="hidden"
            />

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-base p-5">
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <CircleAlert className="h-4 w-4" />
                            Damage
                        </div>

                        <div className="mt-2 text-xl font-semibold">
                            {result.pothole_count} Pothole
                            {result.pothole_count === 1 ? '' : 's'}
                        </div>
                    </div>

                    <div className="rounded-xl border border-base p-5">
                        <div className="text-sm text-muted">
                            Confidence
                        </div>

                        <div className="mt-2 text-xl font-semibold">
                            {Math.round(result.confidence * 100)}%
                        </div>
                    </div>

                    <div className="rounded-xl border border-base p-5">
                        <div className="text-sm text-muted">
                            Severity
                        </div>

                        <div className="mt-2 text-xl font-semibold capitalize">
                            {result.severity}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                {!running ? (
                    <button
                        type="button"
                        onClick={startMonitoring}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading AI Model...
                            </>
                        ) : (
                            <>
                                <Camera className="h-5 w-5" />
                                Start Live Monitoring
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={stopMonitoring}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-6 py-3 font-semibold text-red-400"
                    >
                        <CameraOff className="h-5 w-5" />
                        Stop Monitoring
                    </button>
                )}
            </div>
        </div>
    );
}

export default LiveMonitoring;