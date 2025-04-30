import { FC } from 'react';

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

declare type EditorProps = {
    tracks: Track[];
};

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

export declare type Track = {
    name: string;
    items: Item[];
    volume?: number;
};

export declare const VideoEditor: FC<EditorProps>;

declare type VideoItem = BaseItem & {
    type: 'video';
    src: string;
    volume?: number;
};

export { }
