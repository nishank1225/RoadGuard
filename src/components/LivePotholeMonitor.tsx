import { useCallback, useEffect, useRef, useState } from 'react';
import * as ort from 'onnxruntime-web';
import { Camera, MapPin, X, Activity, CircleStop } from 'lucide-react';

ort.env.wasm.wasmPaths = '/ort/';

const MODEL_URL = '/models/yolov8_pothole.onnx';
const INPUT_SIZE = 640;
const CONFIDENCE_THRESHOLD = 0.35;
const IOU_THRESHOLD = 0.45;

type Detection = {
    x: number;
    y: number;
    w: number;
    h: number;
    confidence: number;
    id: number;
};

type GPS = {
    lat: number;
    lng: number;
};

function iou(a: Detection, b: Detection) {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    const y2 = Math.min(a.y + a.h, b.y + b.h);

    const intersectionW = Math.max(0, x2 - x1);
    const intersectionH = Math.max(0, y2 - y1);
    const intersection = intersectionW * intersectionH;

    const union = a.w * a.h + b.w * b.h - intersection;

    return union > 0 ? intersection / union : 0;
}

function nms(boxes: Detection[]) {
    const sorted = [...boxes].sort(
        (a, b) => b.confidence - a.confidence,
    );

    const selected: Detection[] = [];

    for (const box of sorted) {
        const overlaps = selected.some(
            (selectedBox) => iou(box, selectedBox) > IOU_THRESHOLD,
        );

        if (!overlaps) {
            selected.push(box);
        }
    }

    return selected;
}

function preprocess(
    source: HTMLVideoElement,
    canvas: HTMLCanvasElement,
) {
    const sourceWidth = source.videoWidth;
    const sourceHeight = source.videoHeight;

    const scale = Math.min(
        INPUT_SIZE / sourceWidth,
        INPUT_SIZE / sourceHeight,
    );

    const resizedWidth = Math.round(sourceWidth * scale);
    const resizedHeight = Math.round(sourceHeight * scale);

    const padX = (INPUT_SIZE - resizedWidth) / 2;
    const padY = (INPUT_SIZE - resizedHeight) / 2;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not create canvas context');
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);

    ctx.drawImage(
        source,
        0,
        0,
        sourceWidth,
        sourceHeight,
        padX,
        padY,
        resizedWidth,
        resizedHeight,
    );

    const imageData = ctx.getImageData(
        0,
        0,
        INPUT_SIZE,
        INPUT_SIZE,
    );

    const input = new Float32Array(
        3 * INPUT_SIZE * INPUT_SIZE,
    );

    const planeSize = INPUT_SIZE * INPUT_SIZE;

    for (let i = 0; i < planeSize; i++) {
        input[i] = imageData.data[i * 4] / 255;
        input[planeSize + i] =
            imageData.data[i * 4 + 1] / 255;
        input[planeSize * 2 + i] =
            imageData.data[i * 4 + 2] / 255;
    }

    return {
        tensor: new ort.Tensor('float32', input, [
            1,
            3,
            INPUT_SIZE,
            INPUT_SIZE,
        ]),
        scale,
        padX,
        padY,
    };
}

function parseOutput(
    output: Float32Array,
    scale: number,
    padX: number,
    padY: number,
    sourceWidth: number,
    sourceHeight: number,
) {
    const numAnchors = 8400;
    const detections: Detection[] = [];

    for (let i = 0; i < numAnchors; i++) {
        const cx = output[i];
        const cy = output[numAnchors + i];
        const width = output[numAnchors * 2 + i];
        const height = output[numAnchors * 3 + i];
        const confidence = output[numAnchors * 4 + i];

        if (confidence < CONFIDENCE_THRESHOLD) {
            continue;
        }

        const x = (cx - width / 2 - padX) / scale;
        const y = (cy - height / 2 - padY) / scale;
        const w = width / scale;
        const h = height / scale;

        const clippedX = Math.max(0, Math.min(x, sourceWidth));
        const clippedY = Math.max(0, Math.min(y, sourceHeight));
        const clippedW = Math.max(
            0,
            Math.min(w, sourceWidth - clippedX),
        );
        const clippedH = Math.max(
            0,
            Math.min(h, sourceHeight - clippedY),
        );

        detections.push({
            x: clippedX,
            y: clippedY,
            w: clippedW,
            h: clippedH,
            confidence,
            id: 0,
        });
    }

    return nms(detections);
}

export function LivePotholeMonitor({
    onClose,
}: {
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef =
        useRef<ort.InferenceSession | null>(null);

    const animationRef = useRef<number | null>(null);
    const processingRef = useRef(false);

    const previousDetections =
        useRef<Detection[]>([]);

    const nextIdRef = useRef(1);

    const confirmationFrames =
        useRef<Map<number, number>>(new Map());

    const [detections, setDetections] = useState<
        Detection[]
    >([]);

    const [gps, setGps] = useState<GPS | null>(null);

    const [cameraError, setCameraError] =
        useState('');

    const [modelLoading, setModelLoading] =
        useState(true);

    const [fps, setFps] = useState(0);

    const [confirmedPotholes, setConfirmedPotholes] =
        useState(0);

    const lastFrameTime = useRef(performance.now());

    const getGPS = useCallback(() => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGps({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                setGps(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000,
            },
        );
    }, []);

    useEffect(() => {
        getGPS();

        const interval = window.setInterval(
            getGPS,
            10000,
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [getGPS]);

    const assignTrackingIds = (
        current: Detection[],
    ) => {
        const result: Detection[] = [];

        for (const detection of current) {
            let bestId = 0;
            let bestIoU = 0;

            for (const previous of previousDetections.current) {
                const overlap = iou(detection, previous);

                if (overlap > bestIoU) {
                    bestIoU = overlap;
                    bestId = previous.id;
                }
            }

            if (bestIoU > 0.25) {
                detection.id = bestId;
            } else {
                detection.id = nextIdRef.current++;
            }

            result.push(detection);
        }

        previousDetections.current = result;

        return result;
    };

    const runDetection = useCallback(
        async () => {
            if (
                processingRef.current ||
                !videoRef.current ||
                !canvasRef.current ||
                !sessionRef.current
            ) {
                return;
            }

            if (
                videoRef.current.readyState <
                HTMLMediaElement.HAVE_CURRENT_DATA
            ) {
                return;
            }

            processingRef.current = true;

            try {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                const { tensor, scale, padX, padY } =
                    preprocess(video, canvas);

                const inputName =
                    sessionRef.current.inputNames[0];

                const outputName =
                    sessionRef.current.outputNames[0];

                const results =
                    await sessionRef.current.run({
                        [inputName]: tensor,
                    });

                const output =
                    results[outputName] as ort.Tensor;

                const raw = output.data as Float32Array;

                const parsed = parseOutput(
                    raw,
                    scale,
                    padX,
                    padY,
                    video.videoWidth,
                    video.videoHeight,
                );

                const tracked =
                    assignTrackingIds(parsed);

                setDetections(tracked);

                let confirmed = 0;

                for (const detection of tracked) {
                    const old =
                        confirmationFrames.current.get(
                            detection.id,
                        ) ?? 0;

                    const next = old + 1;

                    confirmationFrames.current.set(
                        detection.id,
                        next,
                    );

                    if (next >= 3) {
                        confirmed++;
                    }
                }

                setConfirmedPotholes(confirmed);

                const now = performance.now();
                const elapsed = now - lastFrameTime.current;

                if (elapsed >= 500) {
                    setFps(Math.round(1000 / elapsed));
                    lastFrameTime.current = now;
                }
            } catch (error) {
                console.error(
                    'Live pothole detection error:',
                    error,
                );
            } finally {
                processingRef.current = false;
            }
        },
        [],
    );

    useEffect(() => {
        let mounted = true;

        const start = async () => {
            try {
                setModelLoading(true);

                const session =
                    await ort.InferenceSession.create(
                        MODEL_URL,
                        {
                            executionProviders: ['wasm'],
                            graphOptimizationLevel: 'all',
                        },
                    );

                if (!mounted) {
                    return;
                }

                sessionRef.current = session;

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'environment',
                            width: {
                                ideal: 1280,
                            },
                            height: {
                                ideal: 720,
                            },
                        },
                        audio: false,
                    });

                if (!mounted) {
                    stream
                        .getTracks()
                        .forEach((track) => track.stop());

                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    await videoRef.current.play();
                }

                setModelLoading(false);

                const loop = async () => {
                    if (!mounted) {
                        return;
                    }

                    await runDetection();

                    animationRef.current =
                        requestAnimationFrame(loop);
                };

                loop();
            } catch (error) {
                console.error(
                    'Unable to start live monitoring:',
                    error,
                );

                setModelLoading(false);

                setCameraError(
                    'Unable to start camera or AI model. Check camera permission and try again.',
                );
            }
        };

        start();

        return () => {
            mounted = false;

            if (animationRef.current !== null) {
                cancelAnimationFrame(
                    animationRef.current,
                );
            }

            streamRef.current
                ?.getTracks()
                .forEach((track) => track.stop());

            streamRef.current = null;
            sessionRef.current = null;
        };
    }, [runDetection]);

    const videoWidth =
        videoRef.current?.videoWidth || 1;

    const videoHeight =
        videoRef.current?.videoHeight || 1;

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black/80">
                <div>
                    <div className="flex items-center gap-2 font-semibold">
                        <Activity
                            size={20}
                            className="text-emerald-400"
                        />
                        Live Pothole Monitoring
                    </div>

                    <div className="text-xs text-white/60 mt-1">
                        YOLO pothole detection • Real-time
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10"
                >
                    <X size={22} />
                </button>
            </div>

            <div className="relative flex-1 overflow-hidden flex items-center justify-center">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />

                <canvas
                    ref={canvasRef}
                    width={INPUT_SIZE}
                    height={INPUT_SIZE}
                    className="hidden"
                />

                {videoRef.current &&
                    detections.map((detection) => {
                        const left =
                            (detection.x / videoWidth) * 100;

                        const top =
                            (detection.y / videoHeight) * 100;

                        const width =
                            (detection.w / videoWidth) * 100;

                        const height =
                            (detection.h / videoHeight) * 100;

                        return (
                            <div
                                key={detection.id}
                                className="absolute border-2 border-red-500"
                                style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${width}%`,
                                    height: `${height}%`,
                                }}
                            >
                                <div className="absolute -top-7 left-0 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                                    Pothole{' '}
                                    {(detection.confidence * 100).toFixed(
                                        0,
                                    )}
                                    %
                                </div>
                            </div>
                        );
                    })}

                {modelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center">
                            <Activity
                                size={32}
                                className="mx-auto mb-3 animate-pulse text-emerald-400"
                            />
                            <p className="font-semibold">
                                Loading pothole AI...
                            </p>
                            <p className="text-xs text-white/60 mt-1">
                                Starting camera and ONNX model
                            </p>
                        </div>
                    </div>
                )}

                {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                        <div className="text-center max-w-sm">
                            <Camera
                                size={32}
                                className="mx-auto mb-3 text-red-400"
                            />
                            <p>{cameraError}</p>
                        </div>
                    </div>
                )}

                <div className="absolute top-4 left-4 right-4 flex gap-2">
                    <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl">
                        <div className="text-xs text-white/60">
                            Detections
                        </div>
                        <div className="font-bold">
                            {detections.length}
                        </div>
                    </div>

                    <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl">
                        <div className="text-xs text-white/60">
                            Confirmed
                        </div>
                        <div className="font-bold text-emerald-400">
                            {confirmedPotholes}
                        </div>
                    </div>

                    <div className="bg-black/70 backdrop-blur px-3 py-2 rounded-xl">
                        <div className="text-xs text-white/60">
                            FPS
                        </div>
                        <div className="font-bold">
                            {fps}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-black/90">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Monitoring active
                    </div>

                    {gps ? (
                        <div className="flex items-center gap-2 text-xs text-white/70">
                            <MapPin size={14} />
                            {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                        </div>
                    ) : (
                        <div className="text-xs text-amber-400">
                            GPS unavailable
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold flex items-center justify-center gap-2"
                >
                    <CircleStop size={18} />
                    Stop Monitoring
                </button>
            </div>
        </div>
    );
}

export default LivePotholeMonitor;