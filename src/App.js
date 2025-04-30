import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { VideoEditor } from './components/video-editor/video-editor';
import { ThemeProvider } from './providers/theme-provider';
import { Topbar } from './components/topbar/topbar';
function App() {
    const initialTracks = [
        {
            name: 'Track 1',
            items: [
                {
                    id: 'item-1',
                    from: 0,
                    durationInFrames: 1,
                    type: 'video',
                    src: 'manson_clone.mp4'
                }
            ]
        },
        {
            name: 'Track 2',
            items: [
                {
                    id: 'item-2',
                    from: 0,
                    durationInFrames: 1,
                    type: 'video',
                    src: 'manson_clone.mp4'
                }
            ]
        },
        {
            name: 'Audio Track',
            items: [
                {
                    id: 'audio-1',
                    from: 0,
                    durationInFrames: 1,
                    type: 'audio',
                    src: 'spectre.mp3'
                }
            ]
        }
    ];
    return (_jsx(_Fragment, { children: _jsxs(ThemeProvider, { children: [_jsx(Topbar, {}), _jsx("div", { className: "h-[200vh] pt-32", children: _jsx(VideoEditor, { tracks: initialTracks }) })] }) }));
}
export default App;
