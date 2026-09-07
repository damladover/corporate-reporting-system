import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("3"); // 3: Mühendis, 2: Şef, 1: Müdür
  const [chefId, setChefId] = useState("");
  const [managerId, setManagerId] = useState("");

  // Yöneticileri API'den çekip bu state'lere dolduracağız
  const [sefler, setSefler] = useState([]);
  const [mudurler, setMudurler] = useState([]);

  const navigate = useNavigate();

  // Sayfa yüklendiğinde veritabanından yöneticileri çeken hook
  useEffect(() => {
    const yoneticileriGetir = async () => {
      try {
        const sefResponse = await axios.get(
          "http://localhost:8080/api/users/role/2",
        );
        setSefler(sefResponse.data);

        const mudurResponse = await axios.get(
          "http://localhost:8080/api/users/role/1",
        );
        setMudurler(mudurResponse.data);
      } catch (error) {
        console.error("Yöneticiler veritabanından çekilemedi:", error);
      }
    };

    yoneticileriGetir();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        adSoyad,
        email,
        sifre: password,
        roleId: parseInt(roleId),
        chefId: chefId ? parseInt(chefId) : null,
        managerId: managerId ? parseInt(managerId) : null,
      });
      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Kayıt başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
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
            style={{ width: "150px", marginBottom: "10px" }}
          />
          <h2
            style={{ color: "#333", margin: "10px 0 5px 0", fontSize: "22px" }}
          >
            Yeni Hesap Oluştur
          </h2>
        </div>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
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
              Ad Soyad
            </label>
            <input
              type="text"
              required
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
              placeholder="Örn: Damla Yılmaz"
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
              E-Posta
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
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
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
              placeholder="••••••••"
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
              Görev / Rol
            </label>
            <select
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                setChefId("");
                setManagerId("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            >
              <option value="3">Mühendis</option>
              <option value="2">Baş Mühendis (Şef)</option>
              <option value="1">Müdür</option>
            </select>
          </div>

          {/* ŞEF LİSTESİ (Sadece Mühendis seçiliyse) - Sadece İsim Gösterimi */}
          {roleId === "3" && (
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
                Bağlı Olacağı Baş Mühendis (Şef)
              </label>
              <select
                required
                value={chefId}
                onChange={(e) => setChefId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                <option value="">-- Şef Seçin --</option>
                {sefler.map((sef) => (
                  <option key={sef.id} value={sef.id}>
                    {sef.adSoyad}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* MÜDÜR LİSTESİ (Mühendis veya Şef seçiliyse) - Sadece İsim Gösterimi */}
          {(roleId === "3" || roleId === "2") && (
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
                Bağlı Olacağı Müdür
              </label>
              <select
                required
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              >
                <option value="">-- Müdür Seçin --</option>
                {mudurler.map((mudur) => (
                  <option key={mudur.id} value={mudur.id}>
                    {mudur.adSoyad}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            KAYIT OL
          </button>
        </form>

        <div
          style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}
        >
          <span style={{ color: "#666" }}>Zaten hesabın var mı? </span>
          <Link
            to="/"
            style={{
              color: "#d32f2f",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
