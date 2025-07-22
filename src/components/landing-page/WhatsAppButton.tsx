export const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/2975694343"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
    >
      {/* <MessageCircle className="w-6 h-6" /> */}
      <img src="/whatsapp.svg" alt="WhatsApp icon" color="white" width={30} />
    </a>
  );
};
