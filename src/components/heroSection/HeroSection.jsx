import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px 60px",
        background: "#f9f9f9",
        flexWrap: "wrap",
      }}
    >
      {/* Left Content */}
      <div style={{ maxWidth: 500 }}>
        <h1 style={{ fontSize: 48, marginBottom: 20 }}>
          Light Up Your Space
        </h1>

        <p style={{ fontSize: 18, marginBottom: 30, lineHeight: 1.6 }}>
          Discover beautifully designed lamps that bring warmth,
          elegance, and character to your home.
        </p>

        <Link
          to="/products"
          style={{
            padding: "14px 28px",
            background: "black",
            color: "white",
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Shop Now
        </Link>
      </div>

      {/* Right Image */}
      <div>
        <img
          src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
          alt="Lamp"
          style={{
            width: 400,
            maxWidth: "100%",
            borderRadius: 12,
          }}
        />
      </div>
    </section>
  );
}

export default HeroSection;