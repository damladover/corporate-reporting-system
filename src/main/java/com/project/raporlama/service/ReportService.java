package com.project.raporlama.service;

import com.project.raporlama.dto.request.ReportCreateRequest;
import com.project.raporlama.dto.request.ReportMergeRequest;
import com.project.raporlama.dto.response.ReportResponse;
import com.project.raporlama.entity.Project;
import com.project.raporlama.entity.Report;
import com.project.raporlama.entity.ReportItem;
import com.project.raporlama.entity.User;
import com.project.raporlama.entity.WorkType;
import com.project.raporlama.entity.enums.ReportStatusType;
import com.project.raporlama.repository.ProjectRepository;
import com.project.raporlama.repository.ReportRepository;
import com.project.raporlama.repository.UserRepository;
import com.project.raporlama.repository.WorkTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.IsoFields;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WorkTypeRepository workTypeRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, 
                         ProjectRepository projectRepository, WorkTypeRepository workTypeRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.workTypeRepository = workTypeRepository;
    }

    private User getAuthenticatedUser() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Güvenlik hatası: Token'a ait kullanıcı sistemde bulunamadı!"));
    }

    @Transactional
    public ReportResponse taslakOlustur(ReportCreateRequest request) {
        User engineer = getAuthenticatedUser();

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Proje bulunamadı!"));

        WorkType workType = workTypeRepository.findById(request.getWorkTypeId())
                .orElseThrow(() -> new RuntimeException("İş tipi bulunamadı!"));

        Report rapor = new Report();
        rapor.setUser(engineer);
        rapor.setRaportorIsim(engineer.getAdSoyad());
        rapor.setProject(project); 
        rapor.setWorkType(workType);
        rapor.setRaporTarihi(LocalDate.now());
        rapor.setStatus(ReportStatusType.DRAFT);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());
        
        // Zaman/Hafta takibi
        rapor.setHafta(LocalDate.now().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
        rapor.setYil(LocalDate.now().getYear());

        // Gelen string listesini ReportItem (Maddeler) nesnelerine çeviriyoruz
        if (request.getMaddeler() != null) {
            List<ReportItem> items = request.getMaddeler().stream().map(icerik -> {
                ReportItem item = new ReportItem();
                item.setIcerik(icerik);
                item.setReport(rapor);
                return item;
            }).collect(Collectors.toList());
            rapor.setMaddeler(items);
        }

        Report kaydedilenRapor = reportRepository.save(rapor);
        logger.info("YENİ RAPOR: Mühendis {} taslak rapor oluşturdu. Proje: {}", engineer.getAdSoyad(), project.getAd());
        
        return convertToReportResponse(kaydedilenRapor);
    }

    @Transactional
    public ReportResponse raporuGuncelle(Long raporId, ReportCreateRequest request) {
        Report rapor = reportRepository.findById(raporId)
                .orElseThrow(() -> new RuntimeException("Rapor bulunamadı!"));

        if (rapor.getStatus() != ReportStatusType.DRAFT && 
            rapor.getStatus() != ReportStatusType.REJECTED_BY_CHEF && 
            rapor.getStatus() != ReportStatusType.REJECTED_BY_MANAGER) {
            throw new RuntimeException("Sadece taslak veya reddedilen raporlar güncellenebilir!");
        }

        // Eski maddeleri temizleyip yenilerini ekliyoruz
        rapor.getMaddeler().clear();
        if (request.getMaddeler() != null) {
            List<ReportItem> yeniMaddeler = request.getMaddeler().stream().map(icerik -> {
                ReportItem item = new ReportItem();
                item.setIcerik(icerik);
                item.setReport(rapor);
                return item;
            }).collect(Collectors.toList());
            rapor.getMaddeler().addAll(yeniMaddeler);
        }

        rapor.setStatus(ReportStatusType.DRAFT);
        rapor.setRedSebebi(null);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());

        Report guncellenenRapor = reportRepository.save(rapor);
        logger.info("RAPOR GÜNCELLENDİ: ID {} olan rapor güncellendi.", raporId);

        return convertToReportResponse(guncellenenRapor);
    }

    @Transactional
    public ReportResponse raporlariBirlestirVeMudureGonder(ReportMergeRequest request) {
        User chef = getAuthenticatedUser();

        List<Report> secilenRaporlar = reportRepository.findAllById(request.getReportIds());
        if (secilenRaporlar.isEmpty()) {
            throw new RuntimeException("Seçilen rapor bulunamadı!");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Proje bulunamadı!"));

        Report masterRapor = new Report();
        masterRapor.setUser(chef);
        masterRapor.setRaportorIsim(chef.getAdSoyad() + " (Şef Derlemesi)");
        masterRapor.setRaporTarihi(LocalDate.now());
        masterRapor.setStatus(ReportStatusType.WAITING_MANAGER);
        masterRapor.setGuncellenmeTarihi(LocalDateTime.now());
        masterRapor.setProject(project);
        masterRapor.setWorkType(secilenRaporlar.get(0).getWorkType());
        masterRapor.setHafta(LocalDate.now().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
        masterRapor.setYil(LocalDate.now().getYear());

        List<ReportItem> masterMaddeler = new ArrayList<>();

        for (Report r : secilenRaporlar) {
            // 1. Şefin TİK ATTIĞI maddeleri bul
            List<ReportItem> secilenler = r.getMaddeler().stream()
                    .filter(item -> request.getSecilenMaddeIdleri() != null && request.getSecilenMaddeIdleri().contains(item.getId()))
                    .collect(Collectors.toList());

            // 2. Bu maddeleri Master Rapora kopyala
            for (ReportItem onayli : secilenler) {
                ReportItem masterItem = new ReportItem();
                masterItem.setIcerik("- [" + r.getWorkType().getTipAd() + "]: " + onayli.getIcerik());
                masterItem.setReport(masterRapor);
                masterMaddeler.add(masterItem);
            }

            // 3. KISMİ BİRLEŞTİRME: Seçilenleri mühendisin orijinal raporundan kopar!
            r.getMaddeler().removeAll(secilenler);

            // 4. Eğer rapordaki TÜM maddeler seçildiyse (içi boşaldıysa) arşive gönder
            if (r.getMaddeler().isEmpty()) {
                r.setStatus(ReportStatusType.MERGED);
                r.setParentReport(masterRapor);
            } 
            // İçinde hâlâ madde varsa hiçbir şey yapma, WAITING_CHEF (Bekleyenler) statüsünde kalmaya devam etsin!

            reportRepository.save(r);
        }

        masterRapor.setMaddeler(masterMaddeler);
        Report kaydedilenMaster = reportRepository.save(masterRapor);

        logger.info("ŞEF DERLEMESİ: Kısmi/Tam birleştirme yapılarak ID {} master raporu oluşturuldu.", kaydedilenMaster.getId());
        
        return convertToReportResponse(kaydedilenMaster);
    }

    @Transactional
    public ReportResponse sefeGonder(Long raporId) {
        Report rapor = reportRepository.findById(raporId)
                .orElseThrow(() -> new RuntimeException("Rapor bulunamadı!"));

        if (rapor.getStatus() != ReportStatusType.DRAFT && rapor.getStatus() != ReportStatusType.REJECTED_BY_CHEF) {
            throw new RuntimeException("Sadece taslak veya reddedilmiş raporlar şefe gönderilebilir.");
        }

        rapor.setStatus(ReportStatusType.WAITING_CHEF);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());
        Report guncellenen = reportRepository.save(rapor);
        
        return convertToReportResponse(guncellenen);
    }

    public List<ReportResponse> sefIcinOnayBekleyenleriGetir() {
        User chef = getAuthenticatedUser();
        
        // Şefin bekleyen ekranına hem mühendislerden yeni gelenleri (WAITING_CHEF)
        // hem de müdürden kendine iade edilenleri (REJECTED_BY_MANAGER) getiriyoruz.
        List<ReportStatusType> statuler = Arrays.asList(
            ReportStatusType.WAITING_CHEF, 
            ReportStatusType.REJECTED_BY_MANAGER
        );

        return reportRepository.findByStatusIn(statuler).stream()
                .filter(r -> 
                    // 1. Durum: Mühendisten şefe onaya gelenler
                    (r.getStatus() == ReportStatusType.WAITING_CHEF && r.getUser().getChef() != null && r.getUser().getChef().getId().equals(chef.getId())) ||
                    
                    // 2. Durum: Müdürden şefe geri dönen master raporlar (Master raporun sahibi şefin kendisidir)
                    (r.getStatus() == ReportStatusType.REJECTED_BY_MANAGER && r.getUser().getId().equals(chef.getId()))
                )
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse raporuReddet(Long raporId, String redSebebi, boolean isManager) {
        Report rapor = reportRepository.findById(raporId)
                .orElseThrow(() -> new RuntimeException("Rapor bulunamadı!"));

        if (isManager) {
            rapor.setStatus(ReportStatusType.REJECTED_BY_MANAGER);
        } else {
            rapor.setStatus(ReportStatusType.REJECTED_BY_CHEF);
        }
        
        rapor.setRedSebebi(redSebebi);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());
        return convertToReportResponse(reportRepository.save(rapor));
    }

    public List<ReportResponse> mudurIcinOnayBekleyenleriGetir() {
        User manager = getAuthenticatedUser();
        return reportRepository.findByStatus(ReportStatusType.WAITING_MANAGER).stream()
                .filter(r -> r.getUser().getManager() != null && r.getUser().getManager().getId().equals(manager.getId()))
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse mudurOnayla(Long raporId) {
        Report rapor = reportRepository.findById(raporId)
                .orElseThrow(() -> new RuntimeException("Rapor bulunamadı!"));

        if (rapor.getStatus() != ReportStatusType.WAITING_MANAGER) {
            throw new RuntimeException("Sadece müdür onayında bekleyen raporlar onaylanabilir.");
        }

        rapor.setStatus(ReportStatusType.APPROVED);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());
        rapor.setRedSebebi(null);
        return convertToReportResponse(reportRepository.save(rapor));
    }

    public List<ReportResponse> getMyReports() {
        User user = getAuthenticatedUser();
        return reportRepository.findByUserId(user.getId()).stream()
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getArchivedReports() {
        User user = getAuthenticatedUser(); 
        
        List<ReportStatusType> arsivStatuleri = new ArrayList<>(Arrays.asList(
                ReportStatusType.APPROVED,
                ReportStatusType.REJECTED_BY_CHEF,
                ReportStatusType.REJECTED_BY_MANAGER,
                ReportStatusType.MERGED 
        ));
        
        String roleName = user.getRole().getRoleName().toUpperCase();
        boolean isManager = roleName.contains("MÜDÜR") || roleName.contains("MUDUR") || roleName.contains("MANAGER");
        boolean isChef = roleName.contains("ŞEF") || roleName.contains("SEF") || roleName.contains("CHEF") || roleName.contains("BAŞ") || roleName.contains("BAS");

        if (isChef) {
            arsivStatuleri.add(ReportStatusType.WAITING_MANAGER);
        }

        return reportRepository.findByStatusIn(arsivStatuleri).stream()
                .filter(r -> {
                    if (isManager) {
                        return r.getStatus() != ReportStatusType.MERGED && 
                               r.getUser().getManager() != null && 
                               r.getUser().getManager().getId().equals(user.getId());
                    }
                    return r.getUser().getId().equals(user.getId());
                })
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }
    
    public List<ReportResponse> getReportsByUserId(Long userId) {
        return reportRepository.findByUserId(userId).stream()
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    private ReportResponse convertToReportResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .raportorIsim(report.getRaportorIsim())
                .raporTarihi(report.getRaporTarihi())
                .status(report.getStatus().name())
                .redSebebi(report.getRedSebebi())
                .guncellenmeTarihi(report.getGuncellenmeTarihi())
                .projectName(report.getProject() != null ? report.getProject().getAd() : null)
                .workTypeName(report.getWorkType() != null ? report.getWorkType().getTipAd() : null)
                .parentReportId(report.getParentReport() != null ? report.getParentReport().getId() : null)
                .hafta(report.getHafta())
                .yil(report.getYil())
                .maddeler(report.getMaddeler()) 
                .build();
    }

    @Transactional
    public ReportResponse mudureTekrarGonder(Long raporId) {
        Report rapor = reportRepository.findById(raporId)
                .orElseThrow(() -> new RuntimeException("Rapor bulunamadı!"));

        rapor.setStatus(ReportStatusType.WAITING_MANAGER);
        rapor.setGuncellenmeTarihi(LocalDateTime.now());
        return convertToReportResponse(reportRepository.save(rapor));
    }
}