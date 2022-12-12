import './App.scss';

import React, { useEffect, useRef, useState } from 'react';
import { IPoint } from './IPoint';

const random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

const between = ({ x: x1, y: y1 }: IPoint, { x: x2, y: y2 }: IPoint) => ({
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
});

function downloadAsSvg(svg) {
    const blob = new Blob([svg], {
        type: 'image/svg+xml',
    });

    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'sirpinsky-triangle.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}

function downloadAsPng(svg) {
    const svgUrl = URL.createObjectURL(
        new Blob([svg], { type: 'image/svg+xml' })
    );

    const svgImage = document.createElement('img');

    document.body.appendChild(svgImage);

    svgImage.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = svgImage.clientWidth;
        canvas.height = svgImage.clientHeight;
        const canvasCtx = canvas.getContext('2d');

        if (canvasCtx) {
            canvasCtx.drawImage(svgImage, 0, 0);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'sirpinsky-triangle.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        svgImage.remove();
        setTimeout(() => URL.revokeObjectURL(svgUrl), 5000);
    };

    svgImage.src = svgUrl;
}

export const App: React.FC = () => {
    const [height, setHeight] = useState(300);
    const [width, setWidth] = useState(300);

    const [pointsCount, setPointsCount] = useState(10000);
    const [points, setPoints] = useState<IPoint[]>([]);

    const [initialPoint, setInitialPoint] = useState<IPoint>();

    const svgRef = useRef<SVGSVGElement>(null);
    const timeoutRef = useRef(-1);

    useEffect(() => {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            const points = [
                { x: width / 2, y: 0 },
                { x: 0, y: height },
                { x: width, y: height },
            ];

            if (initialPoint) {
                points.push(initialPoint);
                for (let i = points.length; i < pointsCount; i++) {
                    points.push(
                        between(points[random(0, 2)], points[points.length - 1])
                    );
                }
            }

            setPoints(points);
        }, 500);
    }, [height, width, pointsCount, initialPoint]);

    return (
        <>
            <div className='form-container'>
                <div>
                    <label htmlFor='txtHeight'>Height</label>
                    <input
                        id='txtHeight'
                        type='number'
                        min={10}
                        value={height}
                        onChange={(e) => setHeight(e.target.valueAsNumber)}
                    />
                </div>
                <div>
                    <label htmlFor='txtWidth'>Width</label>
                    <input
                        id='txtWidth'
                        type='number'
                        min={10}
                        value={width}
                        onChange={(e) => setWidth(e.target.valueAsNumber)}
                    />
                </div>
                <div>
                    <label htmlFor='txtCount'>Count</label>
                    <input
                        id='txtCount'
                        type='number'
                        min={10}
                        value={pointsCount}
                        onChange={(e) => setPointsCount(e.target.valueAsNumber)}
                    />
                </div>
                <div className='fill'></div>
                {initialPoint && svgRef.current && (
                    <div>
                        <button
                            onClick={() => {
                                if (svgRef.current) {
                                    downloadAsSvg(svgRef.current.outerHTML);
                                }
                            }}
                        >
                            Download as SVG
                        </button>
                        <button
                            onClick={() => {
                                if (svgRef.current) {
                                    downloadAsPng(svgRef.current.outerHTML);
                                }
                            }}
                        >
                            Download as PNG
                        </button>
                    </div>
                )}
            </div>
            <div className='svg-container'>
                <svg
                    version='1.1'
                    xmlns='http://www.w3.org/2000/svg'
                    xmlnsXlink='http://www.w3.org/1999/xlink'
                    ref={svgRef}
                    viewBox={`-1 -1 ${width + 2} ${height + 2}`}
                    onClick={(e) => {
                        const svg = e.target as SVGGraphicsElement;
                        const screenCTM = svg.getScreenCTM();

                        if (screenCTM) {
                            setInitialPoint(
                                new DOMPoint(
                                    e.clientX,
                                    e.clientY
                                ).matrixTransform(screenCTM.inverse())
                            );
                        }
                    }}
                >
                    {points.map(({ x, y }, index) => (
                        <circle
                            key={`point-${index}-${x}-${y}`}
                            cx={x}
                            cy={y}
                            r={1}
                            stroke={'#0000000'}
                            fill={
                                index < 3
                                    ? '#f00'
                                    : index === 3
                                    ? '#0f0'
                                    : '#000'
                            }
                        ></circle>
                    ))}
                </svg>
            </div>
        </>
    );
};
