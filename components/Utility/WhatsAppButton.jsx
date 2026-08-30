import { useSelector } from "react-redux";

const WhatsAppButton = ({
  phone = "8801776863395", // Admin number (no + sign)
  includeLocation = false,
}) => {
  const location = useSelector((state) => state.user.location);

  const baseMessage = "Hello Admin, I need help from MedLocate.";

  const locationMessage =
    includeLocation && location?.lat
      ? `

My Location:
Lat: ${location.lat}
Lng: ${location.lng}`
      : "";

  const finalMessage = encodeURIComponent(baseMessage + locationMessage);

  const whatsappUrl = `https://wa.me/${phone}?text=${finalMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "65px",
        right: "20px",
        backgroundColor: "#25D366",
        color: "white",
        padding: "12px 18px",
        borderRadius: "50px",
        textDecoration: "none",
        fontWeight: "bold",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        zIndex: 999,
      }}
    >
      💬 Chat
    </a>
  );
};

export default WhatsAppButton;