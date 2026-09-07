import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [raporlar, setRaporlar] = useState([]);
  const [aktifSekme, setAktifSekme] = useState("aktif");

  const [maddeler, setMaddeler] = useState([""]);
  const [projectId, setProjectId] = useState("");
  const [workTypeId, setWorkTypeId] = useState("");
  const [detayAcikId, setDetayAcikId] = useState(null);

  const [secilenRaporIds, setSecilenRaporIds] = useState([]);
  const [secilenMaddeIds, setSecilenMaddeIds] = useState([]);

  // Arşivde seçilen haftayı tutan state
  const [secilenHafta, setSecilenHafta] = useState(null);

  const [mergeProjectId, setMergeProjectId] = useState("");
  const [redSebebi, setRedSebebi] = useState("");
  const [guncelMaddeler, setGuncelMaddeler] = useState([""]);

  const isim = localStorage.getItem("isim");
  const rol = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    raporlariGetir(aktifSekme);
  }, [aktifSekme]);

  const raporlariGetir = async (sekme) => {
    try {
      let url = "";
      if (sekme === "arsiv") {
        url = "http://localhost:8080/api/reports/archive";
      } else {
        if (rol === "MÜDÜR")
          url = "http://localhost:8080/api/reports/pending-manager";
        else if (rol === "BAŞ MÜHENDİS")
          url = "http://localhost:8080/api/reports/pending-chef";
        else url = "http://localhost:8080/api/reports/my-reports";
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRaporlar(response.data);
    } catch (error) {
      console.error("Raporlar çekilirken hata:", error);
    }
  };

  const handleMaddeChange = (index, value) => {
    const yeniMaddeler = [...maddeler];
    yeniMaddeler[index] = value;
    setMaddeler(yeniMaddeler);
  };
  const addMadde = () => setMaddeler([...maddeler, ""]);
  const removeMadde = (index) =>
    setMaddeler(maddeler.filter((_, i) => i !== index));

  const handleGuncelMaddeChange = (index, value) => {
    const yeniGuncel = [...guncelMaddeler];
    yeniGuncel[index] = value;
    setGuncelMaddeler(yeniGuncel);
  };
  const addGuncelMadde = () => setGuncelMaddeler([...guncelMaddeler, ""]);
  const removeGuncelMadde = (index) =>
    setGuncelMaddeler(guncelMaddeler.filter((_, i) => i !== index));

  const raporOlustur = async (e) => {
    e.preventDefault();
    const doluMaddeler = maddeler.filter((m) => m.trim() !== "");
    if (doluMaddeler.length === 0)
      return alert("Lütfen en az bir iş detayı girin!");

    try {
      await axios.post(
        "http://localhost:8080/api/reports/draft",
        {
          maddeler: doluMaddeler,
          projectId: parseInt(projectId),
          workTypeId: parseInt(workTypeId),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Rapor başarıyla oluşturuldu!");
      setMaddeler([""]);
      setProjectId("");
      setWorkTypeId("");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const sefeGonder = async (raporId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}/send-to-chef`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Rapor Şefe gönderildi!");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const raporuGuncelle = async (raporId) => {
    const doluMaddeler = guncelMaddeler.filter((m) => m.trim() !== "");
    if (doluMaddeler.length === 0)
      return alert("Güncellenecek iş detayı boş olamaz!");
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}`,
        { maddeler: doluMaddeler, projectId: 1, workTypeId: 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Rapor güncellendi!");
      setGuncelMaddeler([""]);
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const raporlariBirlestirVaGonder = async (e) => {
    e.preventDefault();
    if (secilenRaporIds.length === 0 || !mergeProjectId)
      return alert("Lütfen rapor ve proje seçin!");
    if (secilenMaddeIds.length === 0)
      return alert(
        "Lütfen birleştirilecek en az bir iş kalemi (madde) işaretleyin!",
      );

    try {
      await axios.post(
        "http://localhost:8080/api/reports/merge-and-send",
        {
          reportIds: secilenRaporIds,
          secilenMaddeIdleri: secilenMaddeIds,
          projectId: parseInt(mergeProjectId),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Seçilen maddeler birleştirildi ve Müdüre gönderildi!");
      setSecilenRaporIds([]);
      setSecilenMaddeIds([]);
      setMergeProjectId("");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const sefReddet = async (raporId) => {
    if (!redSebebi) return alert("Red sebebi giriniz!");
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}/chef-reject?redSebebi=${encodeURIComponent(redSebebi)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRedSebebi("");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const mudurOnayla = async (raporId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}/manager-approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Rapor ONAYLANDI! 🎉");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const mudurReddet = async (raporId) => {
    if (!redSebebi) return alert("Red sebebi girin!");
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}/manager-reject?redSebebi=${encodeURIComponent(redSebebi)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRedSebebi("");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const mudureTekrarGonder = async (raporId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/reports/${raporId}/send-to-manager`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Rapor düzeltildi ve Müdüre tekrar gönderildi!");
      raporlariGetir(aktifSekme);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const checkboxDegistir = (id) => {
    setSecilenRaporIds(
      secilenRaporIds.includes(id)
        ? secilenRaporIds.filter((item) => item !== id)
        : [...secilenRaporIds, id],
    );
  };

  const maddeCheckboxDegistir = (raporId, maddeId) => {
    setSecilenMaddeIds((prev) =>
      prev.includes(maddeId)
        ? prev.filter((id) => id !== maddeId)
        : [...prev, maddeId],
    );
    setSecilenRaporIds((prev) =>
      !prev.includes(raporId) ? [...prev, raporId] : prev,
    );
  };

  const toggleDetay = (rapor) => {
    if (detayAcikId === rapor.id) {
      setDetayAcikId(null);
    } else {
      setDetayAcikId(rapor.id);
      if (rapor.maddeler && rapor.maddeler.length > 0) {
        setGuncelMaddeler(rapor.maddeler.map((m) => m.icerik));
      } else {
        setGuncelMaddeler([rapor.yapilanIs]);
      }
    }
  };

  const cikisYap = () => {
    localStorage.clear();
    navigate("/");
  };

  const getStatusStyle = (status) => {
    if (status === "APPROVED") return { bg: "#d4edda", color: "#155724" };
    if (status === "WAITING_MANAGER")
      return { bg: "#cce5ff", color: "#004085" };
    if (status === "WAITING_CHEF") return { bg: "#fff3cd", color: "#856404" };
    if (status.includes("REJECTED")) return { bg: "#f8d7da", color: "#721c24" };
    return { bg: "#e2e3e5", color: "#383d41" };
  };

  const arsivHaftalari = [...new Set(raporlar.map((r) => r.hafta))]
    .filter(Boolean)
    .sort((a, b) => b - a);

  // Ekranda gösterilecek raporları filtreleme
  const gosterilecekRaporlar = raporlar.filter((rapor) => {
    if (aktifSekme === "aktif") {
      // SADECE aktif süreci devam edenleri göster. Döngüsü bitenleri (MERGED ve APPROVED) GİZLE.
      return rapor.status !== "MERGED" && rapor.status !== "APPROVED";
    }
    if (aktifSekme === "arsiv" && secilenHafta !== null) {
      return rapor.hafta === secilenHafta;
    }
    return false;
  });

  return (
    <div
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "0 0 40px 0",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "4px solid #d32f2f",
          padding: "12px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src="/isdemir-logo.webp"
            alt="İsdemir Logo"
            style={{ height: "45px" }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#333",
              letterSpacing: "0.5px",
              fontWeight: "600",
              borderLeft: "2px solid #ddd",
              paddingLeft: "15px",
            }}
          >
            Kurumsal Raporlama
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#555" }}>
            {isim} <span style={{ color: "#d32f2f" }}>({rol})</span>
          </span>
          <button
            onClick={cikisYap}
            style={{
              padding: "6px 16px",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#d32f2f",
              border: "1px solid #d32f2f",
              borderRadius: "4px",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px" }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "25px",
            borderBottom: "2px solid #ddd",
            paddingBottom: "10px",
          }}
        >
          <button
            onClick={() => {
              setAktifSekme("aktif");
              setSecilenHafta(null);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: aktifSekme === "aktif" ? "#d32f2f" : "white",
              color: aktifSekme === "aktif" ? "white" : "#555",
              border: aktifSekme === "aktif" ? "none" : "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            📥 Bekleyen İşlemler
          </button>
          <button
            onClick={() => {
              setAktifSekme("arsiv");
              setSecilenHafta(null);
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: aktifSekme === "arsiv" ? "#28a745" : "white",
              color: aktifSekme === "arsiv" ? "white" : "#555",
              border: aktifSekme === "arsiv" ? "none" : "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            📂 Arşiv
          </button>
        </div>

        {rol === "MÜHENDİS" && aktifSekme === "aktif" && (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "25px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              borderLeft: "5px solid #d32f2f",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>
              📝 Yeni Rapor Oluştur
            </h3>
            <form onSubmit={raporOlustur}>
              <div style={{ marginBottom: "15px" }}>
                {maddeler.map((madde, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="text"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                      placeholder={`İş kalemi ${index + 1}...`}
                      value={madde}
                      onChange={(e) => handleMaddeChange(index, e.target.value)}
                      required
                    />
                    {maddeler.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMadde(index)}
                        style={{
                          padding: "0 15px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMadde}
                  style={{
                    marginTop: "5px",
                    padding: "8px 15px",
                    backgroundColor: "#e2e3e5",
                    color: "#333",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  + Yeni Satır Ekle
                </button>
              </div>

              <div
                style={{ display: "flex", gap: "15px", marginBottom: "15px" }}
              >
                <select
                  style={{
                    padding: "10px",
                    flex: 1,
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Proje Seçin --</option>
                  <option value="1">
                    Kurumsal Kaynak Planlama (ERP) Entegrasyonu
                  </option>
                  <option value="2">
                    İnsan Kaynakları Yönetim Sistemi (HRMS)
                  </option>
                </select>
                <select
                  style={{
                    padding: "10px",
                    flex: 1,
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  value={workTypeId}
                  onChange={(e) => setWorkTypeId(e.target.value)}
                  required
                >
                  <option value="">-- İş Tipi Seçin --</option>
                  <option value="1">Geliştirme</option>
                  <option value="2">Toplantı</option>
                  <option value="3">Talep</option>
                </select>
              </div>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Taslak Kaydet
              </button>
            </form>
          </div>
        )}

        {rol === "BAŞ MÜHENDİS" &&
          aktifSekme === "aktif" &&
          secilenMaddeIds.length > 0 && (
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "25px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: "5px solid #007bff",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>
                🛠️ Seçilen İşleri Birleştir & Gönder
              </h3>
              <form
                onSubmit={raporlariBirlestirVaGonder}
                style={{ display: "flex", gap: "10px" }}
              >
                <select
                  style={{
                    padding: "10px",
                    flex: 1,
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  value={mergeProjectId}
                  onChange={(e) => setMergeProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Master Rapor İçin Proje --</option>
                  <option value="1">Kurumsal Kaynak Planlama (ERP)</option>
                  <option value="2">İnsan Kaynakları (HRMS)</option>
                </select>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Gönder ({secilenMaddeIds.length} Madde)
                </button>
              </form>
            </div>
          )}

        <h3 style={{ color: "#444", marginBottom: "15px" }}>
          {aktifSekme === "aktif" ? "Bekleyen İşlemler" : "Arşiv Klasörleri"}
        </h3>

        {/* ARŞİV KLASÖR GÖRÜNÜMÜ */}
        {aktifSekme === "arsiv" && secilenHafta === null && (
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {arsivHaftalari.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  color: "#888",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Arşivlenmiş rapor klasörü bulunamadı.
              </div>
            ) : (
              arsivHaftalari.map((hafta) => (
                <button
                  key={hafta}
                  onClick={() => setSecilenHafta(hafta)}
                  style={{
                    padding: "20px 30px",
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #eaeaea",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#2c3e50",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    transition: "0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    flex: "1 1 calc(33.333% - 15px)",
                    minWidth: "200px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>📁</span>
                  {hafta}. Hafta Raporları
                </button>
              ))
            )}
          </div>
        )}

        {/* ARŞİV KLASÖRÜ İÇİ VE GERİ DÖN BUTONU */}
        {aktifSekme === "arsiv" && secilenHafta !== null && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setSecilenHafta(null)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "15px",
              }}
            >
              ⬅ Tüm Klasörlere Dön
            </button>
            <h4 style={{ margin: 0, color: "#d32f2f", fontSize: "18px" }}>
              📂 {secilenHafta}. Hafta İçeriği
            </h4>
          </div>
        )}

        {/* RAPOR LİSTESİ (Bekleyenler veya Seçili Klasör) */}
        {(aktifSekme === "aktif" || secilenHafta !== null) && (
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {gosterilecekRaporlar.length === 0 ? (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  textAlign: "center",
                  borderRadius: "8px",
                  color: "#888",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                Gösterilecek rapor bulunamadı.
              </div>
            ) : (
              gosterilecekRaporlar.map((rapor) => {
                const isAcik = detayAcikId === rapor.id;
                const raporSeciliMi = secilenRaporIds.includes(rapor.id);
                const statusStyle = getStatusStyle(rapor.status);

                return (
                  <li
                    key={rapor.id}
                    onClick={() => toggleDetay(rapor)}
                    style={{
                      backgroundColor: "white",
                      padding: "15px 20px",
                      marginBottom: "12px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      border: isAcik
                        ? "1px solid #d32f2f"
                        : "1px solid #eaeaea",
                      transition: "0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        {rol === "BAŞ MÜHENDİS" && aktifSekme === "aktif" && (
                          <input
                            type="checkbox"
                            checked={raporSeciliMi}
                            onChange={() => checkboxDegistir(rapor.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "18px",
                              height: "18px",
                              marginTop: "3px",
                              cursor: "pointer",
                            }}
                          />
                        )}
                        <div>
                          <div
                            style={{
                              fontSize: "17px",
                              fontWeight: "bold",
                              color: "#222",
                            }}
                          >
                            📄 {rapor.projectName || "Proje Belirtilmemiş"}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              marginTop: "4px",
                            }}
                          >
                            İş Tipi: <strong>{rapor.workTypeName}</strong>{" "}
                            {rol !== "MÜHENDİS" &&
                              `| Raporlayan: ${rapor.raportorIsim}`}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {rapor.status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "10px",
                        borderTop: "1px solid #f0f0f0",
                        paddingTop: "8px",
                      }}
                    >
                      ID: #{rapor.id} • Dönem: {rapor.yil} - {rapor.hafta}.
                      Hafta • Tarih: {rapor.raporTarihi}
                    </div>

                    {isAcik && (
                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop: "1px dashed #ccc",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          style={{
                            backgroundColor: "#f8f9fa",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #e9ecef",
                          }}
                        >
                          <strong style={{ color: "#333", fontSize: "14px" }}>
                            Yapılan İş Detayı:
                          </strong>
                          {rapor.maddeler && rapor.maddeler.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                marginTop: "10px",
                              }}
                            >
                              {rapor.maddeler.map((madde) => (
                                <div
                                  key={madde.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  {rol === "BAŞ MÜHENDİS" &&
                                    aktifSekme === "aktif" && (
                                      <input
                                        type="checkbox"
                                        checked={secilenMaddeIds.includes(
                                          madde.id,
                                        )}
                                        onChange={() =>
                                          maddeCheckboxDegistir(
                                            rapor.id,
                                            madde.id,
                                          )
                                        }
                                        style={{
                                          cursor: "pointer",
                                          width: "16px",
                                          height: "16px",
                                          accentColor: "#007bff",
                                        }}
                                      />
                                    )}
                                  <span
                                    style={{ fontSize: "14px", color: "#444" }}
                                  >
                                    • {madde.icerik}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p
                              style={{
                                margin: "5px 0 0 0",
                                whiteSpace: "pre-wrap",
                                color: "#555",
                                fontSize: "14px",
                              }}
                            >
                              {rapor.yapilanIs}
                            </p>
                          )}
                        </div>

                        {rapor.redSebebi && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "10px",
                              backgroundColor: "#f8d7da",
                              color: "#721c24",
                              borderRadius: "6px",
                            }}
                          >
                            <strong>Red Sebebi:</strong> {rapor.redSebebi}
                          </div>
                        )}

                        {aktifSekme === "aktif" && (
                          <div
                            style={{
                              marginTop: "15px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                            }}
                          >
                            {/* DÜZENLEME EKRANI YETKİLENDİRMESİ GÜNCELLENDİ */}
                            {((rol === "MÜHENDİS" &&
                              (rapor.status === "DRAFT" ||
                                rapor.status.includes("REJECTED"))) ||
                              (rol === "BAŞ MÜHENDİS" &&
                                (rapor.status === "DRAFT" ||
                                  rapor.status === "REJECTED_BY_MANAGER"))) && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "12px",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    border: "1px solid #ccc",
                                    padding: "10px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: "13px",
                                      color: "#666",
                                      marginBottom: "8px",
                                      marginTop: 0,
                                    }}
                                  >
                                    Görevi Düzenle:
                                  </p>
                                  {guncelMaddeler.map((gMadde, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      <input
                                        type="text"
                                        value={gMadde}
                                        onChange={(e) =>
                                          handleGuncelMaddeChange(
                                            idx,
                                            e.target.value,
                                          )
                                        }
                                        style={{
                                          flex: 1,
                                          padding: "8px",
                                          borderRadius: "4px",
                                          border: "1px solid #ccc",
                                        }}
                                      />
                                      {guncelMaddeler.length > 1 && (
                                        <button
                                          onClick={() => removeGuncelMadde(idx)}
                                          style={{
                                            padding: "0 10px",
                                            backgroundColor: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          X
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={addGuncelMadde}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "12px",
                                      backgroundColor: "#eee",
                                      border: "none",
                                      cursor: "pointer",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    + Satır Ekle
                                  </button>
                                  <button
                                    onClick={() => raporuGuncelle(rapor.id)}
                                    style={{
                                      padding: "10px 15px",
                                      backgroundColor: "#17a2b8",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      width: "100%",
                                      marginTop: "10px",
                                    }}
                                  >
                                    ✏️ Raporu Güncelle
                                  </button>
                                </div>
                                {/* BUTON YÖNLENDİRMESİ GÜNCELLENDİ */}
                                {rapor.status === "DRAFT" && (
                                  <button
                                    onClick={() =>
                                      rol === "BAŞ MÜHENDİS"
                                        ? mudureTekrarGonder(rapor.id)
                                        : sefeGonder(rapor.id)
                                    }
                                    style={{
                                      padding: "12px",
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      width: "100%",
                                    }}
                                  >
                                    🚀{" "}
                                    {rol === "BAŞ MÜHENDİS"
                                      ? "Müdüre Tekrar Gönder"
                                      : "Şefe Gönder"}
                                  </button>
                                )}
                              </div>
                            )}

                            {(rol === "BAŞ MÜHENDİS" || rol === "MÜDÜR") && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  marginTop: "5px",
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Red sebebi yazın..."
                                  value={redSebebi}
                                  onChange={(e) => setRedSebebi(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    rol === "MÜDÜR"
                                      ? mudurReddet(rapor.id)
                                      : sefReddet(rapor.id)
                                  }
                                  style={{
                                    padding: "8px 15px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                >
                                  ❌ Reddet
                                </button>
                              </div>
                            )}

                            {rol === "MÜDÜR" && (
                              <button
                                onClick={() => mudurOnayla(rapor.id)}
                                style={{
                                  padding: "10px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                ✅ Nihai Onayla ve Arşivle
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
