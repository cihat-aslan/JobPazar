package com.jobpazar.backend.controller;

import com.jobpazar.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        String aiResponse = geminiService.generateContent(userMessage);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refine-bio")
    public ResponseEntity<Map<String, String>> refineBio(@RequestBody Map<String, String> payload) {
        String draft = payload.get("text");
        if (draft == null || draft.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Lütfen en azından birkaç anahtar kelime girin.");
            return ResponseEntity.badRequest().body(err);
        }

        String prompt = "Sen uzman bir kariyer koçu ve teknik işe alım uzmanısın. Görevin, verilen anahtar kelime ve bilgilere göre yapılandırılmış bir profil yazısı oluşturmak.\n"
                +
                "\n" +
                "Format Şöyle Olmalı:\n" +
                "1. **Giriş:** Maksimum 2 cümlelik, çok net ve kısa bir özet.\n" +
                "2. **Yetkinlikler:** En fazla 3-4 madde, sadece anahtar kelimeler (örn: '- C#, Unity, Fizik'). Uzun cümleler kurma.\n"
                +
                "\n" +
                "Kurallar:\n" +
                "- Dili TÜRKÇE kullan.\n" +
                "- ÇOK KISA ve ÖZ olsun. Toplam 40-50 kelimeyi geçmesin.\n" +
                "- Profesyonel ve net ol.\n" +
                "- Çıktıyı direk metin olarak ver (Markdown başlıkları kullanma, sadece paragraf ve tireli liste).\n" +
                "\n" +
                "Girdi: " + draft;

        String aiResponse = geminiService.generateContent(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse.trim());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-proposal")
    public ResponseEntity<Map<String, String>> generateProposal(@RequestBody Map<String, String> payload) {
        String jobDesc = payload.get("jobDescription");
        String userDraft = payload.get("userDraft");

        if (userDraft == null || userDraft.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Lütfen kendinizi anlatan birkaç kelime yazın.");
            return ResponseEntity.badRequest().body(err);
        }

        String prompt = "Sen uzman bir freelancer koçusun. Aşağıdaki iş ilanına başvuracak bir freelancer için kısa, etkileyici ve ikna edici bir teklif yazısı (cover letter) yaz.\n"
                +
                "\n" +
                "İş Tanımı: " + jobDesc + "\n" +
                "Freelancer Notları/Becerileri: " + userDraft + "\n" +
                "\n" +
                "Kurallar:\n" +
                "1. Dili TÜRKÇE kullan.\n" +
                "2. ÇOK KISA ve NET olsun (Maksimum 3-4 cümle).\n" +
                "3. 'Ben bu işi yaparım' demek yerine, 'X tecrübemle bu sorunu çözerim' tonunda yaz.\n" +
                "4. Sadece teklif metnini döndür (Giriş/Selamlama dahil).\n";

        String aiResponse = geminiService.generateContent(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse.trim());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refine-feedback")
    public ResponseEntity<Map<String, String>> refineFeedback(@RequestBody Map<String, String> payload) {
        String draft = payload.get("text");
        if (draft == null || draft.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Lütfen birkaç anahtar kelime yazın.");
            return ResponseEntity.badRequest().body(err);
        }

        String prompt = "Sen profesyonel bir iletişim asistanısın. Kullanıcının site yönetimine (Admin) göndermek istediği mesajı daha resmi, anlaşılır ve nazik bir dile çevir.\n"
                +
                "\n" +
                "Kullanıcı Taslağı: " + draft + "\n" +
                "\n" +
                "Kurallar:\n" +
                "1. Dili TÜRKÇE kullan.\n" +
                "2. Resmi ve saygılı ol.\n" +
                "3. Mesajın özünü koru ama ifadeyi güçlendir.\n" +
                "4. Sadece düzeltilmiş metni döndür (Ekstra açıklama yapma).\n";

        String aiResponse = geminiService.generateContent(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse.trim());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin-report")
    public ResponseEntity<Map<String, String>> generateAdminReport(@RequestBody Map<String, Object> payload) {
        // Payload expects stats: { totalUsers: 10, totalJobs: 5, activeJobs: 3, ... }

        String prompt = "Sen bir sistem yöneticisi asistanısın. Aşağıdaki istatistiklere dayanarak yöneticiler için kısa, maddeli bir 'Yönetici Özeti' raporu oluştur.\n"
                +
                "\n" +
                "Veriler: " + payload.toString() + "\n" +
                "\n" +
                "Kurallar:\n" +
                "1. Dili TÜRKÇE kullan.\n" +
                "2. Resmi bir dil kullan.\n" +
                "3. Olumlu/Olumsuz trendleri yorumla (eğer veri azsa genel durumu özetle).\n" +
                "4. Maksimum 3-4 madde olsun.\n";

        String aiResponse = geminiService.generateContent(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse.trim());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-job-description")
    public ResponseEntity<Map<String, String>> generateJobDescription(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String draft = payload.get("draft");

        if ((title == null || title.trim().isEmpty()) && (draft == null || draft.trim().isEmpty())) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Lütfen en azından bir başlık veya taslak metin girin.");
            return ResponseEntity.badRequest().body(err);
        }

        String prompt;
        // Case A: Draft is empty or too short -> Generate from Title
        if (draft == null || draft.trim().length() < 5) {
            prompt = "Sen uzman bir İK (İnsan Kaynakları) danışmanısın. Aşağıdaki iş başlığı için profesyonel, çekici ve detaylı bir iş ilanı açıklaması yaz.\n"
                    +
                    "\n" +
                    "İş Başlığı: " + title + "\n" +
                    "\n" +
                    "Kurallar:\n" +
                    "1. Dili TÜRKÇE kullan.\n" +
                    "2. İlan yapısı şöyle olsun: Genel Özet, Sorumluluklar (madde madde), Aranan Nitelikler (madde madde).\n"
                    +
                    "3. Samimi ama profesyonel bir ton kullan.\n" +
                    "4. Maksimum 150-200 kelime olsun.\n" +
                    "5. Markdown formatı kullanma, sadece düz metin ve tireli liste kullan.\n";
        }
        // Case B: Draft exists -> Refine/Complete it
        else {
            prompt = "Sen uzman bir İK editörüsün. Aşağıdaki iş ilanı taslağını düzenle, genişlet ve daha profesyonel hale getir.\n"
                    +
                    "\n" +
                    "İş Başlığı: " + (title != null ? title : "Belirtilmemiş") + "\n" +
                    "Kullanıcı Taslağı: " + draft + "\n" +
                    "\n" +
                    "Kurallar:\n" +
                    "1. Dili TÜRKÇE kullan.\n" +
                    "2. Eksik kısımları (örneğin sorumluluklar eksikse) mantıklı şekilde tamamla.\n" +
                    "3. Yazım hatalarını düzelt ve akıcı bir dil kullan.\n" +
                    "4. Sadece ilan metnini döndür.\n";
        }

        String aiResponse = geminiService.generateContent(prompt);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse.trim());

        return ResponseEntity.ok(response);
    }
}
