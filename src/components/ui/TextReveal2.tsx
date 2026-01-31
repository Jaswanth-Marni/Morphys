
import React from 'react';
import { motion } from 'framer-motion';

interface TextReveal2Props {
    text?: string;
    className?: string;
    delay?: number;
}

const TextReveal2: React.FC<TextReveal2Props> = ({
    text = "MORPHYS",
    className = "",
    delay = 0,
}) => {
    // Split text into words, then letters
    const content = text.split("").map((char, index) => ({ char, index }));

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className="relative inline-block">
                {/* Ghost Text - Reserves Space So Layout is Stable */}
                <span className="invisible opacity-0 uppercase whitespace-pre font-victory tracking-wide" style={{ lineHeight: '1' }}>
                    {text}
                </span>

                {/* Animated Overlay */}
                <div className="absolute inset-0 flex items-end">
                    {content.map((item, i) => (
                        <span
                            key={i}
                            className="inline-flex relative"
                            style={{
                                clipPath: 'inset(-20% -30% -20% 0)' // Allow vertical overflow, hard left clip
                            }}
                        >
                            <motion.span
                                className="uppercase whitespace-pre inline-block font-victory tracking-wide"
                                style={{
                                    lineHeight: '1',
                                }}
                                initial={{ x: '-105%' }}
                                animate={{ x: 0 }}
                                transition={{
                                    delay: delay + (i * 0.05),
                                    duration: 0.5,
                                    ease: [0.2, 0.65, 0.3, 0.9],
                                    repeat: Infinity,
                                    repeatDelay: 1.5,
                                }}
                            >
                                {item.char}
                            </motion.span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TextReveal2;
