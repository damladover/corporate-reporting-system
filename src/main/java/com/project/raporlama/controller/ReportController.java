package com.project.raporlama.controller;

import com.project.raporlama.dto.request.ReportCreateRequest;
import com.project.raporlama.dto.request.ReportMergeRequest;
import com.project.raporlama.dto.response.ReportResponse;
import com.project.raporlama.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@Validated
@Tag(name = "1. Rapor Yönetimi API", description = "Mühendis, Baş Mühendis ve Müdür onay akışlarını yöneten uç noktalar")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/draft")
    @Operation(summary = "1. Taslak Rapor Oluştur", description = "Mühendis sisteme yeni bir taslak rapor kaydeder.")
    public ResponseEntity<ReportResponse> taslakOlustur(@Valid @RequestBody ReportCreateRequest request) {
        return ResponseEntity.ok(reportService.taslakOlustur(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "1.1. Reddedilen Raporu Güncelle", description = "Reddedilen raporun içeriğini güncelleyerek tekrar taslak durumuna getirir.")
    public ResponseEntity<ReportResponse> raporuGuncelle(
            @PathVariable @Min(value = 1, message = "Rapor ID 1'den küçük olamaz!") Long id,
            @Valid @RequestBody ReportCreateRequest request) {
        return ResponseEntity.ok(reportService.raporuGuncelle(id, request));
    }

    @PutMapping("/{id}/send-to-chef")
    @Operation(summary = "2. Raporu Şefe Gönder", description = "Taslak veya reddedilmiş raporu Baş Mühendisin onayına sunar.")
    public ResponseEntity<ReportResponse> sefeGonder(
            @PathVariable @Min(value = 1, message = "Rapor ID 1'den küçük olamaz!") Long id) {
        return ResponseEntity.ok(reportService.sefeGonder(id));
    }

    @GetMapping("/pending-chef")
    @Operation(summary = "3. Baş Mühendis İçin Onay Bekleyenler", description = "Baş Mühendise bağlı mühendislerin onay bekleyen raporlarını listeler.")
    public ResponseEntity<List<ReportResponse>> chefOnayBekleyenleriGetir() {
        return ResponseEntity.ok(reportService.sefIcinOnayBekleyenleriGetir());
    }

    @PutMapping("/{id}/chef-reject")
    @Operation(summary = "5. Baş Mühendis Reddi", description = "Baş Mühendisin raporu red sebebiyle birlikte mühendise geri göndermesini sağlar.")
    public ResponseEntity<ReportResponse> sefReddet(
            @PathVariable @Min(value = 1, message = "Rapor ID 1'den küçük olamaz!") Long id,
            @RequestParam String redSebebi) {
        return ResponseEntity.ok(reportService.raporuReddet(id, redSebebi, false));
    }

    @GetMapping("/pending-manager")
    @Operation(summary = "6. Müdür İçin Onay Bekleyenler", description = "Baş Mühendis onayından geçmiş ve Müdür onayı bekleyen tüm raporları listeler.")
    public ResponseEntity<List<ReportResponse>> mudurOnayBekleyenleriGetir() {
        return ResponseEntity.ok(reportService.mudurIcinOnayBekleyenleriGetir());
    }

    @PutMapping("/{id}/manager-approve")
    @Operation(summary = "7. Müdür Onayı (Nihai Onay)", description = "Müdürün raporu nihai olarak onaylamasını sağlar.")
    public ResponseEntity<ReportResponse> mudurOnayla(
            @PathVariable @Min(value = 1, message = "Rapor ID 1'den küçük olamaz!") Long id) {
        return ResponseEntity.ok(reportService.mudurOnayla(id));
    }

    @PutMapping("/{id}/manager-reject")
    @Operation(summary = "8. Müdür Reddi", description = "Müdürün raporu red sebebiyle birlikte reddetmesini sağlar.")
    public ResponseEntity<ReportResponse> mudurReddet(
            @PathVariable @Min(value = 1, message = "Rapor ID 1'den küçük olamaz!") Long id,
            @RequestParam String redSebebi) {
        return ResponseEntity.ok(reportService.raporuReddet(id, redSebebi, true));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "9. Kullanıcının Raporlarını Getir", description = "Belirli bir kullanıcının geçmişte yazdığı tüm raporları listeler.")
    public ResponseEntity<List<ReportResponse>> getReportsByUserId(
            @PathVariable @Min(value = 1, message = "Kullanıcı ID 1'den küçük olamaz!") Long userId) {
        return ResponseEntity.ok(reportService.getReportsByUserId(userId));
    }

    @GetMapping("/my-reports")
    @Operation(summary = "10. Giriş Yapan Mühendisin Kendi Raporları", description = "O an token ile giriş yapmış mühendisin sadece kendi raporlarını listeler.")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getMyReports());
    }

    @PostMapping("/merge-and-send")
    @Operation(summary = "4. Şef Raporları Birleştir ve Müdüre Gönder", description = "Şefin seçtiği proje altındaki raporları birleştirerek müdürün onayına sunar.")
    public ResponseEntity<ReportResponse> mergeAndSendToManager(@Valid @RequestBody ReportMergeRequest request) {
        return ResponseEntity.ok(reportService.raporlariBirlestirVeMudureGonder(request));
    }

    @GetMapping("/archive")
    @Operation(summary = "Onaylanan ve Arşivlenen Raporlar", description = "Sistemde onaylanmış veya sonuçlanmış raporları listeler.")
    public ResponseEntity<List<ReportResponse>> getArchivedReports() {
        return ResponseEntity.ok(reportService.getArchivedReports());
    }

    @PutMapping("/{raporId}/send-to-manager")
    public ResponseEntity<ReportResponse> mudureTekrarGonder(@PathVariable Long raporId) {
        return ResponseEntity.ok(reportService.mudureTekrarGonder(raporId));
    }
}