// lib/adapters/random-wheel.adapter.ts

interface RandomWheelData {
    segments: Array<{ text: string }>;
}

/**
 * Adapter for Wordwall "Random wheel" template to H5P.DragText 1.10.
 * Random wheel is a spinner; converted to DragText as a list of options.
 */
export default function randomWheelAdapter(data: RandomWheelData) {
    const segments = data?.segments || [];

    // H5P.DragText uses *text* syntax for draggable items.
    // We join them with newlines to form the list.
    const textField = segments
        .map((s) => {
            // Ensure text is a string and handle potential missing values
            const text = s?.text ? String(s.text) : '';
            return `*${text}*`;
        })
        .join('\n');

    return {
        h5pJson: {
            title: 'Random Wheel Options',
            mainLibrary: 'H5P.DragText',
            preloadedDependencies: [
                { machineName: 'H5P.DragText', majorVersion: 1, minorVersion: 10 },
            ],
        },
        contentJson: {
            taskDescription: 'The wheel includes these options:',
            textField,
        },
    };
}
