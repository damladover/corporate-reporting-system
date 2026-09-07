import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Link'i import ettik

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        },
      );

      // Gelen verileri kaydet
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isim", response.data.adSoyad);
      localStorage.setItem("role", response.data.role);

      navigate("/dashboard");
    } catch (error) {
      alert("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f8",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
          borderTop: "5px solid #d32f2f",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/isdemir-logo.webp"
            alt="İsdemir Logo"
            style={{ width: "180px", marginBottom: "15px" }}
          />
          <p style={{ color: "#666", margin: 0, fontWeight: "500" }}>
            Kurumsal Raporlama Sistemi
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              E-Posta
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                fontSize: "15px",
              }}
              placeholder="ornek@isdemir.com.tr"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                fontSize: "15px",
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
              transition: "0.2s",
            }}
          >
            SİSTEME GİRİŞ YAP
          </button>
        </form>

        {/* KAYIT OL YÖNLENDİRMESİ BURAYA EKLENDİ */}
        <div
          style={{ textAlign: "center", marginTop: "25px", fontSize: "14px" }}
        >
          <span style={{ color: "#666" }}>Sistemde hesabın yok mu? </span>
          <Link
            to="/register"
            style={{
              color: "#d32f2f",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}
