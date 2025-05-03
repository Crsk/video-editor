import { ChangeEvent } from 'react';
import { FC } from 'react';
import { ReactNode } from 'react';

declare type AudioClip = BaseClip & {
    type: 'audio';
    src: string;
    volume?: number;
};

declare type BaseClip = {
    from: number;
    durationInFrames: number;
    id: string;
};

export declare type Clip = SolidClip | TextClip | VideoClip | AudioClip;

declare type ClipStyle = {
    root: string;
    content: string;
    active: {
        root: string;
        resizeHandle: string;
        content: string;
        dragOrResize: string;
    };
};

export declare interface CompositionClip {
    id: string;
    type: 'video' | 'audio';
    from: number;
    durationInFrames: number;
    src: string;
    volume?: number;
}

export declare interface CompositionData {
    composition: {
        durationInFrames: number;
        fps: number;
    };
    tracks: CompositionTrack[];
    currentTime: number;
}

export declare interface CompositionTrack {
    name: string;
    volume: number;
    clips: CompositionClip[];
}

export declare const PlayPauseControl: FC;

export declare const SelectedClipVolumeControl: FC;

declare type SolidClip = BaseClip & {
    type: 'solid';
    color: string;
};

declare type TextClip = BaseClip & {
    type: 'text';
    text: string;
    color: string;
};

export declare const TimeDisplay: FC;

export declare const Timeline: FC<{
    styles?: Partial<TimelineStyle>;
}>;

export declare type TimelineStyle = {
    root?: string;
    timeMarker: TimeMarkerStyle;
    timeRuler: TimeRulerStyle;
    track: TrackStyle;
};

declare type TimeMarkerStyle = {
    line: string;
    handle: string;
};

declare type TimeRulerStyle = {
    root: string;
    gridLines: string;
    label: string;
};

export declare type Track = {
    name: string;
    clips: Clip[];
    volume?: number;
};

declare type TrackStyle = {
    root: string;
    clip: ClipStyle;
};

export declare function useCompositionData(): CompositionData;

export declare function useTrackManager(): {
    tracks: Track[];
    getAllTracks: () => Track[];
    createTrack: (name: string, volume?: number) => number;
    removeTrack: (trackIndex: number) => void;
    selectTrack: (index: number) => Track | undefined;
    renameTrack: (trackIndex: number, newName: string) => void;
    addVideoClip: (trackIndex: number, src: string, durationInFrames?: number) => string;
    addAudioClip: (trackIndex: number, src: string, durationInFrames?: number) => string;
    addClipToBeginning: (trackIndex: number, src: string, type: "video" | "audio", durationInFrames?: number) => string;
    addClipToEnd: (trackIndex: number, src: string, type: "video" | "audio", durationInFrames?: number) => string;
    removeClip: (trackIndex: number, clipId: string) => void;
    updateClip: (trackIndex: number, clipId: string, updates: Partial<Omit<Clip, "id" | "type">>) => void;
    setVideoRenderOption: (ClipId: string, renderOption: "default" | "contain-blur" | "cover") => void;
    setVideoPosition: (ClipId: string, positionX: number, positionY: number) => void;
};

export declare function useVideoUpload(): UseVideoUploadReturn;

declare interface UseVideoUploadReturn {
    selectedFile: File | null;
    selectedTrackIndex: number;
    useDefaultFile: boolean;
    defaultFileName: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSelectClick: () => Promise<void>;
    handleTrackIndexChange: (index: number) => void;
    selectVideoFile: () => Promise<File | null>;
    loadVideoIntoTimeline: (file: File | string, trackIndex: number) => Promise<void>;
    selectAndLoadVideo: (trackIndex?: number) => Promise<void>;
}

declare type VideoClip = BaseClip & {
    type: 'video';
    src: string;
    volume?: number;
    renderOption?: 'default' | 'contain-blur' | 'cover';
    positionX?: number;
    positionY?: number;
    originalDuration?: number;
};

export declare const VideoEditorProvider: FC<VideoEditorProviderProps>;

declare interface VideoEditorProviderProps {
    children: ReactNode;
    initialTracks?: Track[];
}

export declare const VideoLoopControl: FC<{
    classNames?: {
        root?: string;
        active?: string;
        inactive?: string;
    };
}>;

export declare const VideoPlayer: FC;

export declare const VideoRenderControls: FC;

export declare const ZoomMinusControl: FC;

export declare const ZoomPlusControl: FC;

export { }
