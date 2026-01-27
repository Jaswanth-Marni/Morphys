import React from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

const TextReveal: React.FC<TextRevealProps> = ({
    text = "Text Reveal Animation",
    className = "",
    delay = 0,
}) => {
    const words = text.split(" ");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: delay,
            },
        },
    };

    const letterVariants = {
        hidden: {
            rotateY: -90,
            opacity: 0,
        },
        visible: {
            rotateY: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const [animationKey, setAnimationKey] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Helper to keep global index for stagger if needed, 
    // BUT since we want to keep it simple and compatible with staggerChildren, 
    // we can try to rely on Framer Motion's natural propagation.
    // However, nested stagger is tricky. 
    // Let's use the manual delay approach for 100% control as discussed.

    const manualLetterVariants = {
        hidden: {
            rotateY: -90,
            opacity: 0
        },
        visible: (i: number) => ({
            rotateY: 0,
            opacity: 1,
            transition: {
                delay: delay + (i * 0.05),
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    let globalLetterIndex = 0;

    return (
        <div className={`relative flex items-center justify-center p-4 ${className}`}>
            <motion.div
                key={animationKey}
                className="flex flex-wrap items-center justify-center gap-[0.3em] font-bold uppercase"
                initial="hidden"
                animate="visible"
                style={{ perspective: "1000px", fontFamily: '"Big Shoulders Display", cursive', fontWeight: 900 }}
            >
                {words.map((word, wIndex) => (
                    <div key={wIndex} className="flex whitespace-nowrap">
                        {word.split("").map((char, cIndex) => {
                            const index = globalLetterIndex++;
                            return (
                                <motion.span
                                    key={cIndex}
                                    custom={index}
                                    variants={manualLetterVariants}
                                    style={{ display: "inline-block", transformStyle: "preserve-3d" }}
                                >
                                    {char}
                                </motion.span>
                            );
                        })}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default TextReveal;
