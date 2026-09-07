import { useState, useEffect } from "react";
import axios from "axios";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raporlariGetir = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8080/api/reports/my-reports",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setReports(response.data);
      } catch (error) {
        console.error("Raporlar yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    raporlariGetir();
  }, []);

  const renderStatus = (status) => {
    switch (status) {
      case "WAITING_MANAGER":
        return (
          <span
            style={{
              backgroundColor: "#f39c12",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Müdür Onayı Bekliyor
          </span>
        );
      case "WAITING_CHEF":
        return (
          <span
            style={{
              backgroundColor: "#f1c40f",
              color: "black",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Şef Onayı Bekliyor
          </span>
        );
      case "APPROVED":
        return (
          <span
            style={{
              backgroundColor: "#2ecc71",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Onaylandı
          </span>
        );
      case "REJECTED_BY_CHEF":
      case "REJECTED_BY_MANAGER":
        return (
          <span
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Reddedildi
          </span>
        );
      case "DRAFT":
        return (
          <span
            style={{
              backgroundColor: "#95a5a6",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Taslak
          </span>
        );
      case "MERGED":
        return (
          <span
            style={{
              backgroundColor: "#8e44ad",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Birleştirildi
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderTop: "5px solid #d32f2f",
        }}
      >
        <h2
          style={{
            color: "#333",
            borderBottom: "2px solid #f4f6f8",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          Gönderdiğim Raporlar (Durum Takibi)
        </h2>

        {loading ? (
          <p>Raporlar yükleniyor...</p>
        ) : reports.length === 0 ? (
          <p style={{ color: "#7f8c8d" }}>
            Henüz oluşturduğunuz bir rapor bulunmamaktadır.
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f6f8", textAlign: "left" }}>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  Proje
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  İş Tipi
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  Dönem (Hafta)
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  Tarih
                </th>
                <th
                  style={{
                    padding: "12px",
                    borderBottom: "2px solid #ddd",
                    color: "#333",
                  }}
                >
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rapor) => (
                <tr key={rapor.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", color: "#555" }}>
                    #{rapor.id}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "#333",
                      fontWeight: "500",
                    }}
                  >
                    {rapor.projectName || "Proje Belirtilmemiş"}
                  </td>
                  <td style={{ padding: "12px", color: "#555" }}>
                    {rapor.workTypeName || "-"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "#2980b9",
                      fontWeight: "bold",
                    }}
                  >
                    {rapor.yil && rapor.hafta
                      ? `${rapor.yil} - ${rapor.hafta}. Hafta`
                      : "-"}
                  </td>
                  <td style={{ padding: "12px", color: "#555" }}>
                    {rapor.raporTarihi}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {renderStatus(rapor.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
