import { motion } from "framer-motion";

export const WhatsAppButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-2">
      {/* Callout Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
        className="bg-white text-green-700 font-bold px-4 py-2 rounded-2xl shadow-lg border border-green-500 text-sm animate-bounce"
      >
        💬 Chat with us!
      </motion.div>

      {/* WhatsApp Button with Heartbeat Animation */}
      <motion.a
        href="https://wa.me/2975694343"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-xl hover:bg-green-600 transition-colors"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0px rgba(16, 185, 129, 0.7)",
            "0 0 20px rgba(16, 185, 129, 0.8)",
            "0 0 0px rgba(16, 185, 129, 0.7)",
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <img src="/whatsapp.svg" alt="WhatsApp" width={30} />
      </motion.a>
    </div>
  );
};
