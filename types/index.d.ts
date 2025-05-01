import { FC } from 'react';
import { ReactNode } from 'react';

declare type AudioItem = BaseItem & {
    type: 'audio';
    src: string;
    volume?: number;
};

declare type BaseItem = {
    from: number;
    durationInFrames: number;
    id: string;
};

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

export declare const EditorProvider: FC<EditorProviderProps>;

declare interface EditorProviderProps {
    children: ReactNode;
    initialTracks?: Track[];
}

declare type Item = SolidItem | TextItem | VideoItem | AudioItem;

export declare const PlayPauseControl: FC;

export declare const SelectedClipVolumeControl: FC;

declare type SolidItem = BaseItem & {
    type: 'solid';
    color: string;
};

declare type TextItem = BaseItem & {
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
    items: Item[];
    volume?: number;
};

declare type TrackStyle = {
    root: string;
    clip: ClipStyle;
};

declare type VideoItem = BaseItem & {
    type: 'video';
    src: string;
    volume?: number;
};

export declare const VideoLoopControl: FC;

export declare const VideoPlayer: FC;

export declare const ZoomMinusControl: FC;

export declare const ZoomPlusControl: FC;

export { }
