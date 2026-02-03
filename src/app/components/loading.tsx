import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { AnimatePresence } from "framer-motion";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background">
            <GlobalLoader />
        </div>
    );
}
