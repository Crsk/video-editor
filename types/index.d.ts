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

export declare const EditorProvider: FC<EditorProviderProps>;

declare interface EditorProviderProps {
    children: ReactNode;
    initialTracks?: Track[];
}

declare type Item = SolidItem | TextItem | VideoItem | AudioItem;

declare type SolidItem = BaseItem & {
    type: 'solid';
    color: string;
};

declare type TextItem = BaseItem & {
    type: 'text';
    text: string;
    color: string;
};

export declare const Timeline: FC;

export declare type Track = {
    name: string;
    items: Item[];
    volume?: number;
};

declare type VideoItem = BaseItem & {
    type: 'video';
    src: string;
    volume?: number;
};

export declare const VideoPlayer: FC;

export { }
